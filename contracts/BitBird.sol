// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BitBirdGame {
    struct Game {
        address player1;
        address player2;
        uint256 stakeAmount;
        address winner;
        bool completed;
    }

    struct GameHistory {
        uint256 gameId;
        address opponent;
        bool won;
        uint256 stakeAmount;
        uint256 winningAmount; // New field for winning amount after deductions
    }

    uint256 public gameCounter = 0;
    mapping(uint256 => Game) public games;
    mapping(uint256 => bool) public gameIdExists;
    mapping(address => uint256) public pendingRewards;
    mapping(address => GameHistory[]) public userGameHistory;

    uint256 public platformFeePercent = 10;
    uint256 public gasFeePercent = 1;
    address public platformOwner;
    address public adminAccount;

    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 stakeAmount);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event GameCompleted(uint256 indexed gameId, address indexed winner, uint256 winningAmount);
    event RewardClaimed(address indexed player, uint256 amount);
    event GasFeeTransferred(address indexed adminAccount, uint256 gasFeeAmount);

    modifier onlyOwner() {
        require(msg.sender == platformOwner, "Only the platform owner can call this function");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == adminAccount, "Only the admin can call this function");
        _;
    }

    constructor(address _adminAccount) {
        platformOwner = msg.sender;
        adminAccount = _adminAccount;
    }

    function generateUniqueGameId() internal returns (uint256) {
        uint256 gameId;
        bool unique = false;

        while (!unique) {
            gameId = (uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 900000) + 100000;
            if (!gameIdExists[gameId]) {
                gameIdExists[gameId] = true;
                unique = true;
            }
        }

        return gameId;
    }

    function createGame() public payable returns (uint256) {
        require(msg.value > 0, "Stake amount must be greater than 0");

        uint256 gameId = generateUniqueGameId();

        games[gameId] = Game({
            player1: msg.sender,
            player2: address(0),
            stakeAmount: msg.value,
            winner: address(0),
            completed: false
        });

        gameCounter++;

        emit GameCreated(gameId, msg.sender, msg.value);
        return gameId;
    }

    function joinGame(uint256 gameId) public payable {
        require(gameIdExists[gameId], "Game ID does not exist");
        Game storage game = games[gameId];
        require(game.player2 == address(0), "Game already has two players");
        require(msg.value == game.stakeAmount, "Incorrect stake amount");

        game.player2 = msg.sender;
        emit GameJoined(gameId, game.player2);
    }

    function setWinner(uint256 gameId, address winnerAddress) external onlyAdmin {
        require(gameIdExists[gameId], "Game ID does not exist");
        Game storage game = games[gameId];
        require(game.completed == false, "Game already completed");
        require(game.player1 == winnerAddress || game.player2 == winnerAddress, "Winner must be one of the players");

        game.winner = winnerAddress;
        game.completed = true;

        uint256 totalStake = game.stakeAmount * 2;
        uint256 platformFee = (totalStake * platformFeePercent) / 100;
        uint256 gasFee = (totalStake * gasFeePercent) / 100;
        uint256 winnerReward = totalStake - platformFee - gasFee;

        payable(platformOwner).transfer(platformFee);
        payable(adminAccount).transfer(gasFee);
        emit GasFeeTransferred(adminAccount, gasFee);

        pendingRewards[game.winner] += winnerReward;

        // Update game history for both players
        updateGameHistory(game.player1, gameId, game.player2, game.player1 == winnerAddress, game.stakeAmount, game.player1 == winnerAddress ? winnerReward : 0);
        updateGameHistory(game.player2, gameId, game.player1, game.player2 == winnerAddress, game.stakeAmount, game.player2 == winnerAddress ? winnerReward : 0);

        emit GameCompleted(gameId, game.winner, winnerReward);
    }

    function updateGameHistory(address player, uint256 gameId, address opponent, bool won, uint256 stakeAmount, uint256 winningAmount) internal {
        userGameHistory[player].push(GameHistory({
            gameId: gameId,
            opponent: opponent,
            won: won,
            stakeAmount: stakeAmount,
            winningAmount: winningAmount
        }));
    }

    function claimPendingReward() public {
        uint256 reward = pendingRewards[msg.sender];
        require(reward > 0, "No rewards to claim");

        pendingRewards[msg.sender] = 0;
        payable(msg.sender).transfer(reward);

        emit RewardClaimed(msg.sender, reward);
    }

    function setOwner(address newOwner) external onlyOwner {
        platformOwner = newOwner;
    }

    function getPendingRewards(address user) public view returns (uint256) {
        return pendingRewards[user];
    }

    function getUserGameHistory(address user) public view returns (GameHistory[] memory) {
        return userGameHistory[user];
    }

    receive() external payable {}
}
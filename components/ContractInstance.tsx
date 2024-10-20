import { ethers, ContractTransactionReceipt, EventLog } from 'ethers';
import artifacts from '../contracts/artifacts/BitBirdGameABI.json';

// const contractAddress = '0x7cF631e6EA4be71b1F230eCb72490DBCeACa2189'; // Replace with your deployed contract address
const contractAddress='0xeAa89A92806aaafD5e4829259DEa675E932038A4';
let contract: ethers.Contract | null = null;

export const getContractInstance = async () => {
  if (contract) return contract;

  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      contract = new ethers.Contract(contractAddress, artifacts, signer);
      return contract;
    } catch (error) {
      console.error('Error connecting to MetaMask', error);
      throw error;
    }
  } else {
    console.error('MetaMask is not installed');
    throw new Error('MetaMask is not installed');
  }
};

export const createGame = async (stakeAmount: string) => {
  const contract = await getContractInstance();
  const tx = await contract.createGame({ value: ethers.parseEther(stakeAmount) });
  const receipt = await tx.wait() as ContractTransactionReceipt;
  const gameCreatedEvent = receipt.logs.find((log) => {
    return log instanceof EventLog && log.eventName === 'GameCreated';
  }) as EventLog | undefined;

  if (gameCreatedEvent && gameCreatedEvent.args) {
    console.log("Game Events", gameCreatedEvent)
    return gameCreatedEvent.args.gameId.toString();
  } else {
    throw new Error('GameCreated event not found in transaction receipt');
  }
};

export const joinGame = async (gameId: string, stakeAmount: string) => {
  const contract = await getContractInstance();
  const tx = await contract.joinGame(gameId, { value: ethers.parseEther(stakeAmount) });
  const receipt = await tx.wait() as ContractTransactionReceipt;
  const gameJoinedEvent = receipt.logs.find((log) => {
    return log instanceof EventLog && log.eventName === 'GameJoined';
  }) as EventLog | undefined;

  if (gameJoinedEvent) {
    return true;
  } else {
    throw new Error('GameJoined event not found in transaction receipt');
  }
};

// ... rest of the code remains the same
export const setWinner = async (
    gameId: number | string,
    winnerAddress: string,
    signer: ethers.Signer
  ): Promise<void> => {
    const contract = new ethers.Contract(contractAddress, artifacts, signer);
    const tx = await contract.setWinner(gameId, winnerAddress);
    await tx.wait();
  };

  export const claimPendingReward = async () => {
    try {
      const contract = await getContractInstance();
      const tx = await contract.claimPendingReward();
      const receipt = await tx.wait();
      
      // Check for the RewardClaimed event
      const rewardClaimedEvent = receipt.logs.find((log:any) => {
        return log instanceof EventLog && log.eventName === 'RewardClaimed';
      }) as EventLog | undefined;
  
      if (rewardClaimedEvent && rewardClaimedEvent.args) {
        const claimedAmount = ethers.formatEther(rewardClaimedEvent.args.reward);
        console.log(`Reward claimed: ${claimedAmount} ETH`);
        return {
          success: true,
          amount: claimedAmount
        };
      } else {
        console.log('Reward claimed, but no event found');
        return {
          success: true,
          amount: '0'
        };
      }
    } catch (error:any) {
      console.error('Error claiming reward:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

export const getPendingRewards = async (address: string) => {
  const contract = await getContractInstance();
  const rewards = await contract.getPendingRewards(address);
  return ethers.formatEther(rewards);
};

export const getUserGameHistory = async (address: string) => {
  const contract = await getContractInstance();
  return await contract.getUserGameHistory(address);
};
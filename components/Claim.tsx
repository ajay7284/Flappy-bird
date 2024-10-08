import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { message } from 'antd';
import { getPendingRewards, claimPendingReward } from '@/components/ContractInstance';

const ClaimButton: React.FC = () => {
  const [pendingRewards, setPendingRewards] = useState<string>('0');
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const { address } = useAccount();

  useEffect(() => {
    const fetchPendingRewards = async () => {
      if (address) {
        try {
          const rewards = await getPendingRewards(address);
          setPendingRewards(rewards);
        } catch (error) {
          console.error('Error fetching pending rewards:', error);
          message.error('Failed to fetch pending rewards');
        }
      }
    };

    fetchPendingRewards();
    const interval = setInterval(fetchPendingRewards, 30000);

    return () => clearInterval(interval);
  }, [address]);

  const handleClaimReward = async () => {
    if (!address) {
      message.error('Please connect your wallet first');
      return;
    }

    setIsClaiming(true);
    try {
      const result = await claimPendingReward();
      if (result.success) {
        message.success(`Successfully claimed ${result.amount} BTT in rewards!`);
        setPendingRewards('0'); // Reset pending rewards after successful claim
      } else {
        message.error('Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      message.error('An error occurred while claiming the reward');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <button
      style={{
        backgroundColor: "#d3193a",
        padding: "10px 15px",
        borderRadius: "8px",
        color: "white",
        border: "none",
        fontWeight: "bold",
        cursor: isClaiming ? "not-allowed" : "pointer",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        transition: "transform 0.3s ease-in-out",
        opacity: isClaiming ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isClaiming) e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        if (!isClaiming) e.currentTarget.style.transform = "scale(1)";
      }}
      onClick={handleClaimReward}
      disabled={isClaiming}
    >
      {isClaiming ? 'Claiming...' : `Claim (${pendingRewards} BTT)`}
    </button>
  );
};

export default ClaimButton;
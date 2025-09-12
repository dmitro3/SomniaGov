

import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { contractAddresses, contractABIs } from '../config/contracts';
import { useChainId } from 'wagmi';
import { motion } from 'framer-motion';
import { 
  Coins, 
  Lock,
  Unlock,
  TrendingUp,
  Calendar,
  Percent,
  Gift,
  AlertTriangle,
  Clock,
  Zap,
  Target
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { parseEther, formatEther } from 'viem';

interface StakeInfo {
  amount: string;
  lockEndTime: string;
  multiplier: string;
  rewards: string;
  stakingTimestamp: string;
}

interface UserStats {
  stakedAmount: string;
  earnedRewards: string;
  totalClaimedRewards: string;
  votingStreak: string;
  totalUserVotes: string;
  totalUserProposals: string;
  lastActivity: string;
}

export default function Stake() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contracts = contractAddresses[chainId];
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [lockDuration, setLockDuration] = useState(30); // days
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [stakeInfo, setStakeInfo] = useState<StakeInfo | null>(null);

  // Read user's token balance
  const { data: tokenBalance } = useContractRead({
    address: contracts?.token,
    abi: contractABIs.token,
    functionName: 'balanceOf',
    args: [address],
    enabled: isConnected && !!address && !!contracts?.token,
  });

  // Read user stats
  const { data: userStatsData } = useContractRead({
    address: contracts?.token,
    abi: contractABIs.token,
    functionName: 'getUserStats',
    args: [address],
    enabled: isConnected && !!address && !!contracts?.token,
  });

  // Read stake information
  const { data: stakeData } = useContractRead({
    address: contracts?.token,
    abi: contractABIs.token,
    functionName: 'stakes',
    args: [address],
    enabled: isConnected && !!address && !!contracts?.token,
  });

  // Read unstake penalty
  const { data: penalty } = useContractRead({
    address: contracts?.token,
    abi: contractABIs.token,
    functionName: 'calculateUnstakePenalty',
    args: [address, stakeInfo ? parseEther(formatEther(BigInt(stakeInfo.amount))) : parseEther('0')],
    enabled: isConnected && !!address && !!contracts?.token && !!stakeInfo,
  });

  // Prepare stake transaction
  const { config: stakeConfig } = usePrepareContractWrite({
    address: contracts?.token,
    abi: contractABIs.token,
    functionName: 'stakeWithLock',
    args: [parseEther(stakeAmount || '0'), BigInt(lockDuration * 24 * 60 * 60)], // Convert days to seconds
    enabled: !!stakeAmount && parseFloat(stakeAmount) > 0 && !!contracts?.token,
  });

  const { 
    data: stakeHash, 
    write: stakeTokens, 
    isLoading: isStaking 
  } = useContractWrite(stakeConfig);

  // Prepare unstake transaction
  const { config: unstakeConfig } = usePrepareContractWrite({
    address: contracts?.token,
    abi: contractABIs.token,
    functionName: 'unstake',
    args: [stakeInfo ? BigInt(stakeInfo.amount) : BigInt(0)],
    enabled: !!stakeInfo && !!contracts?.token,
  });

  const { 
    data: unstakeHash, 
    write: unstakeTokens, 
    isLoading: isUnstaking 
  } = useContractWrite(unstakeConfig);

  // Prepare claim rewards transaction
  const { config: claimConfig } = usePrepareContractWrite({
    address: contracts?.token,
    abi: contractABIs.token,
    functionName: 'claimReward',
    enabled: !!contracts?.token,
  });

  const { 
    data: claimHash, 
    write: claimRewards, 
    isLoading: isClaiming 
  } = useContractWrite(claimConfig);

  // Wait for transactions
  const { isLoading: isStakeConfirming } = useWaitForTransaction({ hash: stakeHash });
  const { isLoading: isUnstakeConfirming } = useWaitForTransaction({ hash: unstakeHash });
  const { isLoading: isClaimConfirming } = useWaitForTransaction({ hash: claimHash });

  useEffect(() => {
    if (userStatsData) {
      setUserStats({
        stakedAmount: userStatsData[0]?.toString() || '0',
        earnedRewards: userStatsData[1]?.toString() || '0',
        totalClaimedRewards: userStatsData[2]?.toString() || '0',
        votingStreak: userStatsData[3]?.toString() || '0',
        totalUserVotes: userStatsData[4]?.toString() || '0',
        totalUserProposals: userStatsData[5]?.toString() || '0',
        lastActivity: userStatsData[6]?.toString() || '0',
      });
    }
  }, [userStatsData]);

  useEffect(() => {
    if (stakeData) {
      setStakeInfo({
        amount: stakeData[0]?.toString() || '0',
        lockEndTime: stakeData[1]?.toString() || '0',
        multiplier: stakeData[2]?.toString() || '0',
        rewards: stakeData[3]?.toString() || '0',
        stakingTimestamp: stakeData[4]?.toString() || '0',
      });
    }
  }, [stakeData]);

  const formatTokenAmount = (amount: string | bigint) => {
    if (!amount) return '0';
    const value = typeof amount === 'string' ? BigInt(amount) : amount;
    return formatEther(value);
  };

  const calculateMultiplier = (days: number) => {
    if (days >= 365) return 3.0;
    if (days >= 180) return 2.5;
    if (days >= 90) return 2.0;
    return 1.5;
  };

  const isLocked = stakeInfo && Number(stakeInfo.lockEndTime) > Date.now() / 1000;
  const lockTimeRemaining = stakeInfo ? Math.max(0, Number(stakeInfo.lockEndTime) - Date.now() / 1000) : 0;
  const daysRemaining = Math.ceil(lockTimeRemaining / (24 * 60 * 60));

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    try {
      await stakeTokens?.();
      setStakeAmount('');
    } catch (error) {
      console.error('Staking error:', error);
    }
  };

  const handleUnstake = async () => {
    if (!stakeInfo || stakeInfo.amount === '0') return;
    try {
      await unstakeTokens?.();
    } catch (error) {
      console.error('Unstaking error:', error);
    }
  };

  const handleClaimRewards = async () => {
    try {
      await claimRewards?.();
    } catch (error) {
      console.error('Claim error:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Staking</h1>
          <p className="text-gray-400">Please connect your wallet to access staking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Token Staking</h1>
        <p className="text-gray-400">Stake SGOV tokens to earn rewards and increase your voting power</p>
      </div>

      {/* Staking Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-dark p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Coins className="h-8 w-8 text-green-400" />
            <span className="text-sm text-gray-400">Available</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatTokenAmount(tokenBalance || '0')}
          </div>
          <div className="text-sm text-gray-400">SGOV Balance</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-dark p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Lock className="h-8 w-8 text-blue-400" />
            <span className="text-sm text-gray-400">Staked</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatTokenAmount(userStats?.stakedAmount || '0')}
          </div>
          <div className="text-sm text-gray-400">
            {isLocked && `Locked for ${daysRemaining} days`}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-dark p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Gift className="h-8 w-8 text-yellow-400" />
            <span className="text-sm text-gray-400">Rewards</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatTokenAmount(userStats?.earnedRewards || '0')}
          </div>
          <div className="text-sm text-gray-400">Pending SGOV</div>
        </motion.div>
      </div>

      {/* Staking Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-dark p-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary-400" />
            Stake Tokens
          </h3>

          <div className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount to Stake
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={() => setStakeAmount(formatTokenAmount(tokenBalance || '0'))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 text-sm hover:text-primary-300"
                >
                  MAX
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Balance: {formatTokenAmount(tokenBalance || '0')} SGOV
              </div>
            </div>

            {/* Lock Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lock Duration (Days)
              </label>
              <div className="flex space-x-2">
                {[30, 90, 180, 365].map((days) => (
                  <button
                    key={days}
                    onClick={() => setLockDuration(days)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                      lockDuration === days
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Multiplier: {calculateMultiplier(lockDuration)}x
              </div>
            </div>

            <button
              onClick={handleStake}
              disabled={!stakeTokens || isStaking || isStakeConfirming || !stakeAmount || parseFloat(stakeAmount) <= 0}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {isStaking || isStakeConfirming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isStaking ? 'Preparing...' : 'Confirming...'}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Stake Tokens
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Current Stakes & Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {/* Current Stake Info */}
          <div className="glass-dark p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-secondary-400" />
              Your Stake
            </h3>

            {stakeInfo && Number(stakeInfo.amount) > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Staked Amount:</span>
                  <span className="text-white font-semibold">
                    {formatTokenAmount(stakeInfo.amount)} SGOV
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Lock Status:</span>
                  <span className={`font-semibold flex items-center ${isLocked ? 'text-red-400' : 'text-green-400'}`}>
                    {isLocked ? <Lock className="h-4 w-4 mr-1" /> : <Unlock className="h-4 w-4 mr-1" />}
                    {isLocked ? `Locked (${daysRemaining} days)` : 'Unlocked'}
                  </span>
                </div>

                {penalty && Number(penalty) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Early Exit Penalty:</span>
                    <span className="text-red-400 font-semibold">
                      {formatTokenAmount(penalty)} SGOV
                    </span>
                  </div>
                )}

                <button
                  onClick={handleUnstake}
                  disabled={!unstakeTokens || isUnstaking || isUnstakeConfirming}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  {isUnstaking || isUnstakeConfirming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isUnstaking ? 'Preparing...' : 'Confirming...'}
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      {isLocked ? 'Emergency Exit' : 'Unstake'}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Coins className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No tokens currently staked</p>
              </div>
            )}
          </div>

          {/* Claim Rewards */}
          <div className="glass-dark p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Gift className="h-5 w-5 mr-2 text-yellow-400" />
              Rewards
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Pending Rewards:</span>
                <span className="text-yellow-400 font-semibold">
                  {formatTokenAmount(userStats?.earnedRewards || '0')} SGOV
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Total Claimed:</span>
                <span className="text-white font-semibold">
                  {formatTokenAmount(userStats?.totalClaimedRewards || '0')} SGOV
                </span>
              </div>

              <button
                onClick={handleClaimRewards}
                disabled={!claimRewards || isClaiming || isClaimConfirming || !userStats || Number(userStats.earnedRewards) <= 0}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                {isClaiming || isClaimConfirming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isClaiming ? 'Preparing...' : 'Confirming...'}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Claim Rewards
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
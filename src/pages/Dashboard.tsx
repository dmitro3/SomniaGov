import { useAccount } from 'wagmi';
import { useContractRead } from 'wagmi';
import { contractAddresses, contractABIs } from '../config/contracts';
import { useChainId } from 'wagmi';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Vote, 
  Trophy, 
  Coins,
  Activity,
  Calendar,
  Target,
  Award
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import NFTBadges from '../components/NFTBadges';

interface UserStats {
  stakedAmount: string;
  earnedRewards: string;
  totalClaimedRewards: string;
  votingStreak: string;
  totalUserVotes: string;
  totalUserProposals: string;
  lastActivity: string;
}

interface UserProfile {
  rank: number;
  totalExperience: string;
  reputationScore: string;
  badgeCount: string;
  uniqueBadgeTypes: string;
  userEvolutionCount: string;
  lastActivityTimestamp: string;
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contracts = contractAddresses[chainId];
  const navigate = useNavigate();
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Read user staked amount from governance contract
  const { data: stakedAmount } = useContractRead({
    address: contracts?.governance,
    abi: contractABIs.governance,
    functionName: 'getStakedAmount',
    args: [address],
    enabled: isConnected && !!address && !!contracts?.governance,
  });

  // Read user reputation data (if available)
  const { data: userReputationScore } = useContractRead({
    address: contracts?.governance,
    abi: contractABIs.governance,
    functionName: 'userReputationScore',
    args: [address],
    enabled: isConnected && !!address && !!contracts?.governance,
  });

  const { data: userTotalVotes } = useContractRead({
    address: contracts?.governance,
    abi: contractABIs.governance,
    functionName: 'userTotalVotes',
    args: [address],
    enabled: isConnected && !!address && !!contracts?.governance,
  });

  const { data: userTotalProposals } = useContractRead({
    address: contracts?.governance,
    abi: contractABIs.governance,
    functionName: 'userTotalProposals',
    args: [address],
    enabled: isConnected && !!address && !!contracts?.governance,
  });

  // Read total supply and other contract stats
  const { data: totalSupply } = useContractRead({
    address: contracts?.token,
    abi: contractABIs.token,
    functionName: 'totalSupply',
    enabled: !!contracts?.token,
  });

  const { data: proposalCount } = useContractRead({
    address: contracts?.governance,
    abi: contractABIs.governance,
    functionName: 'proposalCount',
    enabled: !!contracts?.governance,
  });

  // Read user badges to calculate unique types
  const { data: userBadges } = useContractRead({
    address: contracts?.reputation,
    abi: [
      {
        "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
        "name": "getUserBadges",
        "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'getUserBadges',
    args: [address],
    enabled: isConnected && !!address && !!contracts?.reputation,
  });

  useEffect(() => {
    if (stakedAmount !== undefined || userTotalVotes !== undefined || userTotalProposals !== undefined) {
      setUserStats({
        stakedAmount: stakedAmount?.toString() || '0',
        earnedRewards: '0', // Not available in Governance
        totalClaimedRewards: '0', // Not available in Governance
        votingStreak: '0', // Not available in Governance
        totalUserVotes: userTotalVotes?.toString() || '0',
        totalUserProposals: userTotalProposals?.toString() || '0',
        lastActivity: Date.now().toString(), // Use current timestamp
      });
    }
  }, [stakedAmount, userTotalVotes, userTotalProposals]);

  // Listen for user actions to refresh data
  const handleUserActionCompleted = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    window.addEventListener('userActionCompleted', handleUserActionCompleted);
    return () => {
      window.removeEventListener('userActionCompleted', handleUserActionCompleted);
    };
  }, [handleUserActionCompleted]);

  useEffect(() => {
    if (userReputationScore !== undefined) {
      const reputation = Number(userReputationScore);
      let rank = 0;
      
      if (reputation >= 5000) {
        rank = 4; // Elder
      } else if (reputation >= 1500) {
        rank = 3; // Council
      } else if (reputation >= 500) {
        rank = 2; // Delegate
      } else if (reputation >= 100) {
        rank = 1; // Contributor
      } else {
        rank = 0; // Newcomer
      }

      let badgeCount = '0';
      let uniqueBadgeTypes = '0';
      
      if (userBadges && Array.isArray(userBadges) && userBadges.length > 0) {
        badgeCount = userBadges.length.toString();
        
        const uniqueTypes = new Set();
        userBadges.forEach((_, index) => {
          uniqueTypes.add(index % 8);
        });
        uniqueBadgeTypes = uniqueTypes.size.toString();
      }
      
      setUserProfile({
        rank: rank,
        totalExperience: reputation.toString(),
        reputationScore: reputation.toString(),
        badgeCount,
        uniqueBadgeTypes,
        userEvolutionCount: '0', // Not available in Governance
        lastActivityTimestamp: Date.now().toString(), // Use current timestamp
      });
    }
  }, [userReputationScore, userBadges]);

  const rankNames = ['Newcomer', 'Contributor', 'Delegate', 'Council', 'Elder'];
  const currentRankName = userProfile ? rankNames[userProfile.rank] || 'Newcomer' : 'Newcomer';
  
  const formatTokenAmount = (amount: string) => {
    if (!amount || amount === '0') return '0';
    const value = BigInt(amount);
    const formatted = (Number(value) / 1e18).toFixed(2);
    return formatted;
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp || timestamp === '0') return 'Never';
    const timestampNum = Number(timestamp);
    const date = timestampNum > 1000000000000 
      ? new Date(timestampNum)  // Already in milliseconds
      : new Date(timestampNum * 1000);  // Convert from seconds to milliseconds
    return date.toLocaleDateString();
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Dashboard</h1>
          <p className="text-gray-400">Please connect your wallet to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your governance activity and statistics</p>
      </div>

      {/* User Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-dark p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{currentRankName}</span>
          </div>
          <p className="text-sm text-gray-400">Current Rank</p>
          <p className="text-xs text-gray-500 mt-1">{userProfile?.reputationScore} XP</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-dark p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Coins className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{formatTokenAmount(userStats?.stakedAmount || '0')}</span>
          </div>
          <p className="text-sm text-gray-400">Staked SGOV</p>
          <p className="text-xs text-gray-500 mt-1">+{formatTokenAmount(userStats?.earnedRewards || '0')} pending</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-dark p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Vote className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{userStats?.totalUserVotes || '0'}</span>
          </div>
          <p className="text-sm text-gray-400">Total Votes</p>
          <p className="text-xs text-gray-500 mt-1">Streak: {userStats?.votingStreak || '0'}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-dark p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Award className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">{userProfile?.badgeCount || '0'}</span>
          </div>
          <p className="text-sm text-gray-400">NFT Badges</p>
          <p className="text-xs text-gray-500 mt-1">{userProfile?.uniqueBadgeTypes || '0'} unique types</p>
        </motion.div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-dark p-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary-400" />
            Governance Activity
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Proposals Created</span>
              <span className="text-white font-semibold">{userStats?.totalUserProposals || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Votes Cast</span>
              <span className="text-white font-semibold">{userStats?.totalUserVotes || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Voting Streak</span>
              <span className="text-white font-semibold">{userStats?.votingStreak || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Activity</span>
              <span className="text-white font-semibold">{formatDate(userStats?.lastActivity || '0')}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-dark p-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-secondary-400" />
            Rewards & Earnings
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Staked Amount</span>
              <span className="text-white font-semibold">{formatTokenAmount(userStats?.stakedAmount || '0')} SGOV</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pending Rewards</span>
              <span className="text-green-400 font-semibold">{formatTokenAmount(userStats?.earnedRewards || '0')} SGOV</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Claimed</span>
              <span className="text-white font-semibold">{formatTokenAmount(userStats?.totalClaimedRewards || '0')} SGOV</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Badge Evolutions</span>
              <span className="text-white font-semibold">{userProfile?.userEvolutionCount || '0'}</span>
            </div>
          </div>
        </motion.div>
        
        {/* NFT Badges */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <NFTBadges />
        </motion.div>
      </div>

      {/* Network Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-dark p-6 rounded-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-primary-400" />
          Network Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {proposalCount?.toString() || '0'}
            </div>
            <div className="text-sm text-gray-400">Total Proposals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {totalSupply ? formatTokenAmount(totalSupply.toString()) : '0'}
            </div>
            <div className="text-sm text-gray-400">Total Supply</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {chainId === 50312 ? 'Testnet' : 'Mainnet'}
            </div>
            <div className="text-sm text-gray-400">Network</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/proposals/create')}
            className="glass-dark p-4 rounded-xl hover:bg-primary-600/10 transition-colors text-left"
          >
            <Vote className="h-6 w-6 text-primary-400 mb-2" />
            <div className="text-white font-semibold">Create Proposal</div>
            <div className="text-sm text-gray-400">Start a new governance proposal</div>
          </button>
          <button 
            onClick={() => navigate('/stake')}
            className="glass-dark p-4 rounded-xl hover:bg-green-600/10 transition-colors text-left"
          >
            <Coins className="h-6 w-6 text-green-400 mb-2" />
            <div className="text-white font-semibold">Stake Tokens</div>
            <div className="text-sm text-gray-400">Earn rewards by staking SGOV</div>
          </button>
          <button 
            onClick={() => navigate('/reputation')}
            className="glass-dark p-4 rounded-xl hover:bg-purple-600/10 transition-colors text-left"
          >
            <Trophy className="h-6 w-6 text-purple-400 mb-2" />
            <div className="text-white font-semibold">View Badges</div>
            <div className="text-sm text-gray-400">Check your NFT achievements</div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
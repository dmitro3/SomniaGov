

import { useAccount } from 'wagmi';
import { useContractRead } from 'wagmi';
import { contractAddresses, contractABIs } from '../config/contracts';
import { useChainId } from 'wagmi';
import { motion } from 'framer-motion';
import { 
  User, 
  Trophy,
  Coins,
  Vote,
  Calendar,
  MapPin,
  Edit,
  Copy,
  ExternalLink,
  Activity,
  Award,
  Target,
  TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

export default function Profile() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contracts = contractAddresses[chainId];
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [copied, setCopied] = useState(false);

  // Read user stats from governance token
  const { data: tokenStats } = useContractRead({
    address: contracts?.token,
    abi: contractABIs.token,
    functionName: 'getUserStats',
    args: [address],
    enabled: isConnected && !!address && !!contracts?.token,
  });

  // Read user profile from reputation NFT
  const { data: nftProfile } = useContractRead({
    address: contracts?.reputation,
    abi: contractABIs.reputation,
    functionName: 'getUserProfile',
    args: [address],
    enabled: isConnected && !!address && !!contracts?.reputation,
  });

  // Read user badges
  const { data: badges } = useContractRead({
    address: contracts?.reputation,
    abi: contractABIs.reputation,
    functionName: 'getUserBadges',
    args: [address],
    enabled: isConnected && !!address && !!contracts?.reputation,
  });

  useEffect(() => {
    if (tokenStats) {
      setUserStats({
        stakedAmount: tokenStats[0]?.toString() || '0',
        earnedRewards: tokenStats[1]?.toString() || '0',
        totalClaimedRewards: tokenStats[2]?.toString() || '0',
        votingStreak: tokenStats[3]?.toString() || '0',
        totalUserVotes: tokenStats[4]?.toString() || '0',
        totalUserProposals: tokenStats[5]?.toString() || '0',
        lastActivity: tokenStats[6]?.toString() || '0',
      });
    }
  }, [tokenStats]);

  useEffect(() => {
    if (nftProfile) {
      setUserProfile({
        rank: nftProfile[0] || 0,
        totalExperience: nftProfile[1]?.toString() || '0',
        reputationScore: nftProfile[2]?.toString() || '0',
        badgeCount: nftProfile[3]?.toString() || '0',
        uniqueBadgeTypes: nftProfile[4]?.toString() || '0',
        userEvolutionCount: nftProfile[5]?.toString() || '0',
        lastActivityTimestamp: nftProfile[6]?.toString() || '0',
      });
    }
  }, [nftProfile]);

  const rankNames = ['Newcomer', 'Contributor', 'Delegate', 'Council', 'Elder'];
  const currentRankName = userProfile ? rankNames[userProfile.rank] || 'Newcomer' : 'Newcomer';

  const formatTokenAmount = (amount: string) => {
    if (!amount || amount === '0') return '0';
    const value = BigInt(amount);
    const formatted = (Number(value) / 1e18).toFixed(4);
    return formatted;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
          <h1 className="text-3xl font-bold text-white mb-4">Profile</h1>
          <p className="text-gray-400">Please connect your wallet to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">User Profile</h1>
        <p className="text-gray-400">Manage your governance profile and view your activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="glass-dark p-6 rounded-xl">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-gray-400 font-mono text-sm">
                    {formatAddress(address || '')}
                  </span>
                  <button
                    onClick={copyAddress}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <span className="text-green-400 text-xs">✓</span>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <a
                    to={`https://testnet-explorer.somnia.network/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-2xl font-bold text-white">{currentRankName}</div>
                <div className="text-sm text-gray-400">Governance Rank</div>
                <div className="text-lg font-semibold text-primary-400">
                  {userProfile?.reputationScore || '0'} XP
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-dark-600">
                <span className="text-gray-400">Network:</span>
                <span className="text-white">{chainId === 50312 ? 'Somnia Testnet' : 'Somnia Mainnet'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-600">
                <span className="text-gray-400">Member Since:</span>
                <span className="text-white">{formatDate(userProfile?.lastActivityTimestamp || '0')}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Last Activity:</span>
                <span className="text-white">{formatDate(userStats?.lastActivity || '0')}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link to="/settings">
                <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats and Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-dark p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary-400" />
              Activity Summary
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Vote className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{userStats?.totalUserVotes || '0'}</div>
                <div className="text-sm text-gray-400">Total Votes</div>
              </div>
              
              <div className="text-center">
                <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{userStats?.totalUserProposals || '0'}</div>
                <div className="text-sm text-gray-400">Proposals</div>
              </div>
              
              <div className="text-center">
                <Award className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{userProfile?.badgeCount || '0'}</div>
                <div className="text-sm text-gray-400">NFT Badges</div>
              </div>
              
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{userStats?.votingStreak || '0'}</div>
                <div className="text-sm text-gray-400">Vote Streak</div>
              </div>
            </div>
          </motion.div>

          {/* Financial Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-dark p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Coins className="h-5 w-5 mr-2 text-green-400" />
              Financial Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Staked Tokens</div>
                <div className="text-2xl font-bold text-white">
                  {formatTokenAmount(userStats?.stakedAmount || '0')}
                </div>
                <div className="text-xs text-gray-500">SGOV</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Pending Rewards</div>
                <div className="text-2xl font-bold text-green-400">
                  {formatTokenAmount(userStats?.earnedRewards || '0')}
                </div>
                <div className="text-xs text-gray-500">SGOV</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Total Claimed</div>
                <div className="text-2xl font-bold text-white">
                  {formatTokenAmount(userStats?.totalClaimedRewards || '0')}
                </div>
                <div className="text-xs text-gray-500">SGOV</div>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <Link to="/stake" className="flex-1">
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Manage Staking
                </button>
              </Link>
              <Link to="/reputation" className="flex-1">
                <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  View Badges
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Reputation Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-dark p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
              Reputation & Achievements
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current Rank:</span>
                <span className="text-white font-semibold">{currentRankName}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Experience Points:</span>
                <span className="text-primary-400 font-semibold">{userProfile?.reputationScore || '0'} XP</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Unique Badge Types:</span>
                <span className="text-white font-semibold">{userProfile?.uniqueBadgeTypes || '0'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Badge Evolutions:</span>
                <span className="text-white font-semibold">{userProfile?.userEvolutionCount || '0'}</span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/reputation">
                <button className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-2 rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all">
                  View Full Reputation
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
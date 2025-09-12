

import { useAccount } from 'wagmi';
import { useContractRead } from 'wagmi';
import { contractAddresses, contractABIs } from '../config/contracts';
import { useChainId } from 'wagmi';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star,
  Crown,
  Award,
  Target,
  TrendingUp,
  Users,
  Zap,
  Gift,
  Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface UserProfile {
  rank: number;
  totalExperience: string;
  reputationScore: string;
  badgeCount: string;
  uniqueBadgeTypes: string;
  userEvolutionCount: string;
  lastActivityTimestamp: string;
}

interface Badge {
  id: string;
  owner: string;
  rank: number;
  badgeType: number;
  level: string;
  experience: string;
  timestamp: string;
  metadata: string;
  isEvolved: boolean;
  powerLevel: string;
}

export default function Reputation() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contracts = contractAddresses[chainId];
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userBadges, setUserBadges] = useState<string[]>([]);

  // Read user stats from governance contract
  const { data: userStatsData } = useContractRead({
    address: contracts?.governance,
    abi: contractABIs.governance,
    functionName: 'getUserStats',
    args: [address],
    enabled: isConnected && !!address && !!contracts?.governance,
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
    if (userStatsData) {
      const [stakedAmount, totalVotes, totalProposals, reputationScore] = userStatsData as any[];
      
      // Debug log to see what we're getting
      console.log('ReputationPage Debug:', {
        reputationScore: reputationScore?.toString(),
        repScoreNum: Number(reputationScore || 0),
        userStatsData
      });
      
      const repScore = Number(reputationScore || 0);
      let rankIndex = 0; // Newcomer
      
      if (repScore >= 5000) {
        rankIndex = 4; // Elder
      } else if (repScore >= 1500) {
        rankIndex = 3; // Council
      } else if (repScore >= 500) {
        rankIndex = 2; // Delegate
      } else if (repScore >= 100) {
        rankIndex = 1; // Contributor
      }
      
      setUserProfile({
        rank: rankIndex,
        totalExperience: reputationScore?.toString() || '0',
        reputationScore: reputationScore?.toString() || '0',
        badgeCount: '0', // Will be filled by badge data
        uniqueBadgeTypes: '0',
        userEvolutionCount: '0',
        lastActivityTimestamp: '0',
      });
    }
  }, [userStatsData]);

  useEffect(() => {
    if (badges) {
      setUserBadges(badges.map((id: any) => id.toString()));
    }
  }, [badges]);

  const rankNames = ['Newcomer', 'Contributor', 'Delegate', 'Council', 'Elder'];
  const rankDescriptions = [
    'Just getting started in governance',
    'Active community member',
    'Trusted delegate with voting power',
    'Council member with special privileges',
    'Elder with maximum authority'
  ];
  const rankRequirements = [0, 100, 500, 1500, 5000];
  
  const currentRankName = userProfile ? rankNames[userProfile.rank] || 'Newcomer' : 'Newcomer';
  const currentRankDesc = userProfile ? rankDescriptions[userProfile.rank] || rankDescriptions[0] : rankDescriptions[0];
  const currentXP = Number(userProfile?.reputationScore || 0);
  const nextRankIndex = Math.min((userProfile?.rank || 0) + 1, rankNames.length - 1);
  const nextRankXP = rankRequirements[nextRankIndex];
  const progressPercent = nextRankXP > 0 ? Math.min((currentXP / nextRankXP) * 100, 100) : 100;

  const badgeTypes = [
    { id: 0, name: 'Participation', icon: '⭐', color: 'text-blue-400' },
    { id: 1, name: 'Voting Streak', icon: '🔥', color: 'text-red-400' },
    { id: 2, name: 'Proposal Creator', icon: '📝', color: 'text-green-400' },
    { id: 3, name: 'Staking', icon: '💎', color: 'text-purple-400' },
    { id: 4, name: 'Delegation', icon: '🤝', color: 'text-yellow-400' },
    { id: 5, name: 'Execution', icon: '⚡', color: 'text-orange-400' },
    { id: 6, name: 'Seasonal', icon: '🌟', color: 'text-cyan-400' },
    { id: 7, name: 'Achievement', icon: '🏆', color: 'text-pink-400' },
    { id: 8, name: 'Special', icon: '✨', color: 'text-indigo-400' },
    { id: 9, name: 'Legendary', icon: '👑', color: 'text-amber-400' },
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 4: return 'text-amber-400'; // Elder
      case 3: return 'text-purple-400'; // Council
      case 2: return 'text-orange-400'; // Delegate
      case 1: return 'text-green-400'; // Contributor
      default: return 'text-blue-400'; // Newcomer
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 4: return Crown;
      case 3: return Trophy;
      case 2: return Award;
      case 1: return Target;
      default: return Star;
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Reputation</h1>
          <p className="text-gray-400">Please connect your wallet to view your reputation.</p>
        </div>
      </div>
    );
  }

  const RankIcon = getRankIcon(userProfile?.rank || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Reputation System</h1>
        <p className="text-gray-400">Track your governance participation and earn badges</p>
      </div>

      {/* Current Rank */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-dark p-8 rounded-xl mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center`}>
              <RankIcon className={`h-8 w-8 ${getRankColor(userProfile?.rank || 0)}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${getRankColor(userProfile?.rank || 0)}`}>
                {currentRankName}
              </h2>
              <p className="text-gray-400">{currentRankDesc}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{currentXP}</div>
            <div className="text-sm text-gray-400">Reputation Points</div>
          </div>
        </div>

        {/* Progress to Next Rank */}
        {(userProfile?.rank || 0) < rankNames.length - 1 && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Progress to {rankNames[nextRankIndex]}</span>
              <span className="text-gray-400">{currentXP}/{nextRankXP} XP</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ delay: 0.5, duration: 1 }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {nextRankXP - currentXP} XP needed for next rank
            </div>
          </div>
        )}
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-dark p-6 rounded-xl text-center"
        >
          <Award className="h-8 w-8 text-purple-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white">{userProfile?.badgeCount || '0'}</div>
          <div className="text-sm text-gray-400">Total Badges</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-dark p-6 rounded-xl text-center"
        >
          <Sparkles className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white">{userProfile?.uniqueBadgeTypes || '0'}</div>
          <div className="text-sm text-gray-400">Unique Types</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-dark p-6 rounded-xl text-center"
        >
          <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white">{userProfile?.userEvolutionCount || '0'}</div>
          <div className="text-sm text-gray-400">Evolutions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-dark p-6 rounded-xl text-center"
        >
          <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-white">{userProfile?.totalExperience || '0'}</div>
          <div className="text-sm text-gray-400">Total XP</div>
        </motion.div>
      </div>

      {/* Rank Progression */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-dark p-6 rounded-xl mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Rank Progression</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {rankNames.map((rank, index) => {
            const isCurrentRank = index === (userProfile?.rank || 0);
            const isUnlocked = index <= (userProfile?.rank || 0);
            const RankIconComponent = getRankIcon(index);
            
            return (
              <div
                key={index}
                className={`text-center p-4 rounded-lg transition-all ${
                  isCurrentRank 
                    ? 'bg-primary-600/20 border-2 border-primary-500' 
                    : isUnlocked 
                    ? 'bg-dark-700/50' 
                    : 'bg-dark-800/30 opacity-50'
                }`}
              >
                <RankIconComponent 
                  className={`h-8 w-8 mx-auto mb-2 ${
                    isUnlocked ? getRankColor(index) : 'text-gray-600'
                  }`} 
                />
                <div className={`font-semibold ${
                  isUnlocked ? 'text-white' : 'text-gray-600'
                }`}>
                  {rank}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {rankRequirements[index]} XP
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Badge Collection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-dark p-6 rounded-xl mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Badge Collection</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {badgeTypes.map((badge) => {
            const badgeCount = userBadges.length; // This would need proper filtering by type
            const hasThisBadge = badgeCount > 0; // Simplified for now
            
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-lg text-center transition-all ${
                  hasThisBadge 
                    ? 'glass-dark hover:bg-primary-600/10 cursor-pointer' 
                    : 'bg-dark-800/30 opacity-50'
                }`}
              >
                <div className="text-2xl mb-2">{badge.icon}</div>
                <div className={`font-semibold text-sm ${
                  hasThisBadge ? badge.color : 'text-gray-600'
                }`}>
                  {badge.name}
                </div>
                {hasThisBadge && (
                  <div className="text-xs text-gray-400 mt-1">
                    Owned
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* How to Earn XP */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-dark p-6 rounded-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-6">How to Earn Reputation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-dark-700/50 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-400">🗳️</span>
              </div>
              <div className="font-semibold text-white">Vote on Proposals</div>
            </div>
            <div className="text-sm text-gray-400">+10 XP per vote</div>
          </div>

          <div className="p-4 bg-dark-700/50 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-400">📝</span>
              </div>
              <div className="font-semibold text-white">Create Proposals</div>
            </div>
            <div className="text-sm text-gray-400">+50 XP per proposal</div>
          </div>

          <div className="p-4 bg-dark-700/50 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-400">💬</span>
              </div>
              <div className="font-semibold text-white">Comment & Discuss</div>
            </div>
            <div className="text-sm text-gray-400">+5 XP per comment</div>
          </div>

          <div className="p-4 bg-dark-700/50 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-yellow-600/20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-yellow-400">🤝</span>
              </div>
              <div className="font-semibold text-white">Delegate Tokens</div>
            </div>
            <div className="text-sm text-gray-400">+15 XP per delegation</div>
          </div>

          <div className="p-4 bg-dark-700/50 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-orange-600/20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-orange-400">⚡</span>
              </div>
              <div className="font-semibold text-white">Execute Proposals</div>
            </div>
            <div className="text-sm text-gray-400">+100 XP per execution</div>
          </div>

          <div className="p-4 bg-dark-700/50 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-cyan-600/20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-cyan-400">💎</span>
              </div>
              <div className="font-semibold text-white">Stake Tokens</div>
            </div>
            <div className="text-sm text-gray-400">+1 XP per token staked</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
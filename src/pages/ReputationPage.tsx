import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useContractRead } from 'wagmi';
import { contractAddresses, contractABIs } from '../config/contracts';
import { useChainId } from 'wagmi';
import { 
  Trophy, 
  Award, 
  Star, 
  TrendingUp, 
  Users, 
  Target,
  Crown,
  Medal,
  Zap
} from 'lucide-react';

const ranks = [
  { name: 'Newcomer', minRep: 0, color: 'text-gray-400', icon: Users },
  { name: 'Contributor', minRep: 100, color: 'text-green-400', icon: Target },
  { name: 'Delegate', minRep: 500, color: 'text-blue-400', icon: Star },
  { name: 'Council', minRep: 1500, color: 'text-purple-400', icon: Crown },
  { name: 'Elder', minRep: 5000, color: 'text-yellow-400', icon: Trophy }
];

export default function ReputationPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contracts = contractAddresses[chainId];

  const [userProfile, setUserProfile] = useState(null);

  // Read user badges from reputation NFT
  const { data: userBadges } = useContractRead({
    address: contracts?.reputation,
    abi: contractABIs.reputation,
    functionName: 'getUserBadges',
    args: [address],
    enabled: isConnected && !!address && !!contracts?.reputation,
  });

  // Read user rank from governance contract (more reliable)
  const { data: userRankData } = useContractRead({
    address: contracts?.governance,
    abi: contractABIs.governance,
    functionName: 'getUserRank',
    args: [address],
    enabled: isConnected && !!address && !!contracts?.governance,
  });

  const { data: reputationScore } = useContractRead({
    address: contracts?.governance,
    abi: contractABIs.governance,
    functionName: 'userReputationScore',
    args: [address],
    enabled: isConnected && !!address && !!contracts?.governance,
  });

  useEffect(() => {
    const rank = userRankData ? Number(userRankData[1]) : 0; // getUserRank returns [name, index]
    const repScore = reputationScore ? Number(reputationScore) : 0;
    
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
      rank,
      totalExperience: repScore.toString(),
      reputationScore: repScore.toString(),
      badgeCount,
      uniqueBadgeTypes,
      userEvolutionCount: '0', // Not available in ReputationNFT
      lastActivityTimestamp: Date.now().toString(),
    });
  }, [userRankData, reputationScore, userBadges]);

  const currentRank = userProfile ? ranks[userProfile.rank] || ranks[0] : ranks[0];
  const nextRank = userProfile && userProfile.rank < ranks.length - 1 ? ranks[userProfile.rank + 1] : null;
  const userRepScore = userProfile ? Number(userProfile.reputationScore) : 0;
  const progress = nextRank ? Math.min((userRepScore - currentRank.minRep) / (nextRank.minRep - currentRank.minRep) * 100, 100) : 100;

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <Trophy className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Reputation System</h1>
          <p className="text-gray-400">Please connect your wallet to view your reputation and badges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Reputation System</h1>
        <p className="text-gray-400">Track your governance activity and earn reputation</p>
      </div>

      {/* Current Rank */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark p-8 rounded-xl mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center`}>
              <currentRank.icon className={`h-8 w-8 ${currentRank.color}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${currentRank.color}`}>{currentRank.name}</h2>
              <p className="text-gray-400">Current Rank</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{userRepScore}</div>
            <div className="text-sm text-gray-400">Reputation Score</div>
          </div>
        </div>

        {/* Progress to Next Rank */}
        {nextRank && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Progress to {nextRank.name}</span>
              <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{currentRank.minRep}</span>
              <span>{nextRank.minRep} needed</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-dark p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Award className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">{userProfile?.badgeCount || '0'}</span>
          </div>
          <p className="text-sm text-gray-400">NFT Badges</p>
          <p className="text-xs text-gray-500 mt-1">{userProfile?.uniqueBadgeTypes || '0'} unique types</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-dark p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Zap className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{userProfile?.userEvolutionCount || '0'}</span>
          </div>
          <p className="text-sm text-gray-400">Badge Evolutions</p>
          <p className="text-xs text-gray-500 mt-1">Times badges upgraded</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-dark p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{userProfile?.totalExperience || '0'}</span>
          </div>
          <p className="text-sm text-gray-400">Total Experience</p>
          <p className="text-xs text-gray-500 mt-1">Lifetime activity points</p>
        </motion.div>
      </div>

      {/* Rank Progression */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-dark p-6 rounded-xl mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Rank Progression</h3>
        <div className="space-y-4">
          {ranks.map((rank, index) => {
            const isCurrentRank = userProfile && userProfile.rank === index;
            const isUnlocked = userRepScore >= rank.minRep;
            
            return (
              <div 
                key={rank.name}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isCurrentRank 
                    ? 'border-primary-500 bg-primary-500/10' 
                    : isUnlocked
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-dark-600 bg-dark-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <rank.icon className={`h-6 w-6 ${isUnlocked ? rank.color : 'text-gray-600'}`} />
                  <div>
                    <div className={`font-semibold ${isUnlocked ? rank.color : 'text-gray-500'}`}>
                      {rank.name}
                      {isCurrentRank && <span className="ml-2 text-xs text-primary-400">(Current)</span>}
                    </div>
                    <div className="text-sm text-gray-400">
                      {rank.minRep}+ reputation required
                    </div>
                  </div>
                </div>
                {isUnlocked ? (
                  <Medal className="h-5 w-5 text-green-400" />
                ) : (
                  <div className="text-sm text-gray-500">
                    {rank.minRep - userRepScore} more needed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* How to Earn Reputation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-dark p-6 rounded-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-4">How to Earn Reputation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              <span className="text-gray-300">Vote on proposals (+10-50 XP)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              <span className="text-gray-300">Create proposals (+100-200 XP)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              <span className="text-gray-300">Participate in discussions (+5-25 XP)</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-secondary-500 rounded-full" />
              <span className="text-gray-300">Stake tokens (+1 XP per day)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-secondary-500 rounded-full" />
              <span className="text-gray-300">Maintain voting streaks (+bonus XP)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-secondary-500 rounded-full" />
              <span className="text-gray-300">Complete achievements (+50-500 XP)</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
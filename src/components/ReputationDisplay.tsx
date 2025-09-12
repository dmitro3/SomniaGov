

import { motion } from 'framer-motion';
import { Crown, TrendingUp, Star } from 'lucide-react';

interface ReputationDisplayProps {
  rank: string;
  reputation: number;
  address?: string;
  className?: string;
}

const rankInfo = {
  'Newcomer': { 
    color: 'text-amber-400', 
    bg: 'bg-amber-900/20', 
    border: 'border-amber-700',
    icon: '🌱',
    min: 0, 
    max: 100,
    multiplier: '1.0x'
  },
  'Contributor': { 
    color: 'text-gray-400', 
    bg: 'bg-gray-900/20', 
    border: 'border-gray-700',
    icon: '⚡',
    min: 100, 
    max: 500,
    multiplier: '1.2x'
  },
  'Delegate': { 
    color: 'text-yellow-400', 
    bg: 'bg-yellow-900/20', 
    border: 'border-yellow-700',
    icon: '🤝',
    min: 500, 
    max: 1500,
    multiplier: '1.5x'
  },
  'Council': { 
    color: 'text-blue-400', 
    bg: 'bg-blue-900/20', 
    border: 'border-blue-700',
    icon: '🏛️',
    min: 1500, 
    max: 5000,
    multiplier: '2.0x'
  },
  'Elder': { 
    color: 'text-purple-400', 
    bg: 'bg-purple-900/20', 
    border: 'border-purple-700',
    icon: '👑',
    min: 5000, 
    max: 10000,
    multiplier: '3.0x'
  }
};

export default function ReputationDisplay({ 
  rank, 
  reputation, 
  address,
  className = '' 
}: ReputationDisplayProps) {
  const currentRankInfo = rankInfo[rank as keyof typeof rankInfo] || rankInfo['Newcomer'];
  
  const progressToNextRank = currentRankInfo.max > 0 
    ? Math.min(((reputation - currentRankInfo.min) / (currentRankInfo.max - currentRankInfo.min)) * 100, 100)
    : 100;

  const getNextRank = (currentRank: string) => {
    const ranks = ['Newcomer', 'Contributor', 'Delegate', 'Council', 'Elder'];
    const currentIndex = ranks.indexOf(currentRank);
    return currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : 'Max Rank';
  };

  return (
    <div className={`stats-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-primary-500" />
          <h3 className="text-lg font-semibold">Reputation</h3>
        </div>
        <div className="text-sm text-gray-400">
          {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
        </div>
      </div>

      {/* Current Rank */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">{currentRankInfo.icon}</div>
        <div className="flex-1">
          <div className={`inline-block px-3 py-1 rounded-full border text-sm font-medium ${currentRankInfo.color} ${currentRankInfo.bg} ${currentRankInfo.border}`}>
            {rank}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Voting Multiplier: {currentRankInfo.multiplier}
          </div>
        </div>
      </div>

      {/* Reputation Score */}
      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-2xl font-bold text-white">{reputation.toLocaleString()}</span>
          <div className="flex items-center gap-1 text-success-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">+24 this week</span>
          </div>
        </div>
        <div className="text-sm text-gray-400">Reputation Points</div>
      </div>

      {/* Progress to Next Rank */}
      {rank !== 'Elder' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Progress to {getNextRank(rank)}
            </span>
            <span className="text-sm font-medium text-white">
              {reputation}/{currentRankInfo.max}
            </span>
          </div>
          
          <div className="w-full bg-dark-700 rounded-full h-2 mb-1">
            <motion.div 
              className={`h-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500`}
              style={{ width: `${progressToNextRank}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextRank}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          
          <div className="text-xs text-gray-400">
            {currentRankInfo.max - reputation} points to next rank
          </div>
        </div>
      )}

      {/* Abilities */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300 flex items-center gap-1">
          <Star className="h-4 w-4" />
          Current Abilities
        </h4>
        <div className="space-y-1 text-sm text-gray-400">
          <div className="flex items-center justify-between">
            <span>Basic Voting</span>
            <span className="text-success-400">✓</span>
          </div>
          {rank !== 'Newcomer' && (
            <div className="flex items-center justify-between">
              <span>Comment on Proposals</span>
              <span className="text-success-400">✓</span>
            </div>
          )}
          {['Delegate', 'Council', 'Elder'].includes(rank) && (
            <div className="flex items-center justify-between">
              <span>Receive Delegated Votes</span>
              <span className="text-success-400">✓</span>
            </div>
          )}
          {['Council', 'Elder'].includes(rank) && (
            <div className="flex items-center justify-between">
              <span>Create Proposals</span>
              <span className="text-success-400">✓</span>
            </div>
          )}
          {rank === 'Elder' && (
            <div className="flex items-center justify-between">
              <span>Veto Power</span>
              <span className="text-success-400">✓</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
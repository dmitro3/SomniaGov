

import { motion } from 'framer-motion';
import { Award, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useReputation } from '../hooks/useProposals';
import { useAccount } from 'wagmi';

interface BadgeShowcaseProps {
  className?: string;
}

const getBadgeEmoji = (badgeType: number) => {
  const emojiMap: { [key: number]: string } = {
    0: '🗳️', // Participation
    1: '🔥', // Voting Streak
    2: '📝', // Proposal Creator
    3: '💰', // Staking
    4: '👥', // Delegation
    5: '🎯', // Execution
    6: '🏆', // Seasonal
    7: '✨', // Achievement/Composed
  };
  return emojiMap[badgeType] || '🏅';
};

const getBadgeRarity = (badgeType: number, level: number) => {
  if (badgeType === 7) return 'legendary'; // Achievement badges
  if (badgeType === 6) return 'epic'; // Seasonal
  if (level >= 5) return 'rare';
  if (level >= 3) return 'uncommon';
  return 'common';
};

const getBadgeName = (badgeType: number) => {
  const nameMap: { [key: number]: string } = {
    0: 'Participation',
    1: 'Voting Streak',
    2: 'Proposal Creator',
    3: 'Staking Reward',
    4: 'Delegation',
    5: 'Execution',
    6: 'Seasonal',
    7: 'Achievement',
  };
  return nameMap[badgeType] || 'Unknown Badge';
};

const rarityColors = {
  common: 'from-gray-500 to-gray-600',
  uncommon: 'from-green-500 to-green-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-yellow-500 to-orange-600'
};

export default function BadgeShowcase({ 
  className = '' 
}: BadgeShowcaseProps) {
  const { isConnected } = useAccount();
  const { badges, loading, error } = useReputation();
  
  const userBadges = badges ? badges.map((badge: any, index: number) => {
    const badgeType = Number(badge.badgeType || 0);
    const level = Number(badge.level || 1);
    const tokenId = badge.tokenId ? Number(badge.tokenId) : null;
    const ipfsHash = badge.ipfsHash || null;
    
    return {
      id: index,
      name: getBadgeName(badgeType),
      type: badgeType,
      level: level,
      rarity: getBadgeRarity(badgeType, level),
      image: getBadgeEmoji(badgeType),
      tokenId: tokenId,
      ipfsHash: ipfsHash,
    };
  }) : [];
  
  const badgeCount = userBadges.length;
  const latestBadge = userBadges.length > 0 ? userBadges[userBadges.length - 1].name : 'No badges yet';
  
  if (!isConnected) {
    return (
      <div className={`stats-card ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-secondary-500" />
            <h3 className="text-lg font-semibold">Badge Collection</h3>
          </div>
        </div>
        <div className="text-center py-8 text-gray-400">
          Connect wallet to view badges
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className={`stats-card ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-secondary-500" />
            <h3 className="text-lg font-semibold">Badge Collection</h3>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading badges...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`stats-card ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-secondary-500" />
            <h3 className="text-lg font-semibold">Badge Collection</h3>
          </div>
        </div>
        <div className="text-center py-8 text-red-400">
          Failed to load badges
        </div>
      </div>
    );
  }
  return (
    <div className={`stats-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="h-6 w-6 text-secondary-500" />
          <h3 className="text-lg font-semibold">Badge Collection</h3>
        </div>
        <span className="text-sm text-secondary-400 font-medium">
          {badgeCount} badges
        </span>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {userBadges.length > 0 ? userBadges.slice(0, 6).map((badge, index) => (
          <motion.div
            key={badge.id}
            className="nft-card aspect-square p-3 flex flex-col items-center justify-center cursor-pointer group"
            whileHover={{ scale: 1.05, rotateY: 5 }}
            transition={{ duration: 0.2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {badge.ipfsHash ? (
              <div className="relative w-8 h-8 mb-1">
                <img 
                  src={`https://gateway.pinata.cloud/ipfs/${badge.ipfsHash}`}
                  alt={badge.name}
                  className="w-full h-full object-cover rounded border-2 border-gray-600"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'none';
                  }}
                />
                <div className="text-2xl absolute inset-0 flex items-center justify-center" style={{display: 'none'}}>
                  {badge.image}
                </div>
              </div>
            ) : (
              <div className="text-2xl mb-1">{badge.image}</div>
            )}
            <div className="text-xs text-center">
              <div className="font-medium text-white truncate">{badge.name}</div>
              <div className={`text-xs px-1 py-0.5 rounded mt-1 bg-gradient-to-r ${
                rarityColors[badge.rarity as keyof typeof rarityColors]
              } text-white`}>
                Level {badge.level}
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-3 text-center py-4 text-gray-400">
            No badges earned yet
          </div>
        )}
      </div>

      {/* Latest Badge */}
      <div className="bg-dark-700 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium text-yellow-400">Latest Badge</span>
        </div>
        <div className="text-sm text-white">{latestBadge}</div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link 
          to="/reputation" 
          className="flex-1 btn btn-outline text-sm py-2 text-center hover:scale-105 transition-transform"
        >
          View All
        </Link>
        <button className="flex items-center justify-center w-10 h-10 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
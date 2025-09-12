import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { getContractAddresses, contractABIs } from '../config/contracts';
import { useChainId } from 'wagmi';
import { Award, Trophy, Target, Zap, Users, Sparkles } from 'lucide-react';

interface Badge {
  id: string;
  badgeType: number;
  level: number;
  metadata: string;
  timestamp: number;
  ipfsHash?: string;
}

const badgeTypeInfo = {
  0: { name: 'Participation', icon: Users, color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-700' },
  1: { name: 'Voting Streak', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700' },
  2: { name: 'Proposal Creator', icon: Target, color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-700' },
  3: { name: 'Staking', icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-900/20', border: 'border-purple-700' },
  4: { name: 'Delegation', icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-900/20', border: 'border-indigo-700' },
  5: { name: 'Execution', icon: Award, color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700' },
  6: { name: 'Seasonal', icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-900/20', border: 'border-pink-700' },
  7: { name: 'Achievement', icon: Award, color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-700' }
};

export default function NFTBadges() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const [badges, setBadges] = useState<Badge[]>([]);

  // Read user's badge IDs from the NFT contract
  const { data: badgeIds, refetch } = useContractRead({
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

  const badgeImages = {
    0: "bafybeiedi7b3ykr7uumfqpl3hnmhhw7sehbe3hxeiwqmhvifcxrmxijaf4",
    1: "bafybeia6tnst62ev3lnl4iwfcooes2rvmjhvf2vjj3czg5yrtrzxfwqx4u",
    2: "bafybeihsrkccoromkdsj7c6f53yhkojx3ruccp3pdfx5inudpx66uktntu",
    3: "bafybeibhoanqix7y3qbq2te3kvn7q4wopwerbazhl2k7oo3mlwfqiwc5bi",
    4: "bafybeihcn7znhnno2ml3fuccnrhhegwkc3mvaisnzlijvjv4mrwrvh2c6q",
    5: "bafybeic46itqakmvezkjdw2olukzjcebtmlfzitm4lrjpv7pi7m7gzw2nq",
    6: "bafybeifhh4hnjcr6olbz4dbgva7zwt42y3yevjx6hejtb37cvjqrrvgwpi",
    7: "bafybeieiw37bln5t4ocnwbasgov6ajbhezqc54kjszhpjupwrx5j6cikv4"
  };

  useEffect(() => {
    const fetchBadgeDetails = async () => {
      if (!badgeIds || !contracts?.reputation || badgeIds.length === 0) {
        setBadges([]);
        return;
      }

      const mockBadges = (badgeIds as bigint[]).map((id, index) => ({
        id: id.toString(),
        badgeType: index % 8,
        level: 1,
        metadata: `Badge #${id.toString()}`,
        timestamp: Date.now() - (index * 24 * 60 * 60 * 1000),
        ipfsHash: badgeImages[index % 8 as keyof typeof badgeImages]
      }));

      setBadges(mockBadges);
    };

    fetchBadgeDetails();
  }, [badgeIds, contracts?.reputation]);

  // Listen for new badges after user actions
  useEffect(() => {
    const handleRefresh = () => {
      setTimeout(() => {
        refetch();
      }, 3000); // Wait for transaction to be mined
    };

    window.addEventListener('userActionCompleted', handleRefresh);
    return () => {
      window.removeEventListener('userActionCompleted', handleRefresh);
    };
  }, [refetch]);

  if (!isConnected) {
    return (
      <div className="stats-card">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-6 w-6 text-primary-500" />
          <h3 className="text-lg font-semibold">NFT Badges</h3>
        </div>
        <p className="text-gray-400 text-center py-8">Connect your wallet to view your badges</p>
      </div>
    );
  }

  if (!badges.length) {
    return (
      <div className="stats-card">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-6 w-6 text-primary-500" />
          <h3 className="text-lg font-semibold">NFT Badges</h3>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">0 badges</span>
        </div>
        <div className="text-center py-8">
          <Award className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No badges earned yet</p>
          <p className="text-sm text-gray-500">Vote on proposals and create proposals to earn your first NFT badges!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award className="h-6 w-6 text-primary-500" />
          <h3 className="text-lg font-semibold">NFT Badges</h3>
          <span className="text-xs bg-primary-900/20 text-primary-400 px-2 py-1 rounded-full border border-primary-700">
            {badges.length} badges
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.map((badge, index) => {
          const badgeInfo = badgeTypeInfo[badge.badgeType as keyof typeof badgeTypeInfo] || badgeTypeInfo[7];
          const IconComponent = badgeInfo.icon;

          return (
            <div
              key={badge.id}
              className={`relative p-3 rounded-lg border transition-all hover:scale-105 ${badgeInfo.bg} ${badgeInfo.border}`}
            >
              <div className="flex flex-col items-center text-center">
                {badge.ipfsHash ? (
                  <div className="mb-2">
                    <img 
                      src={`https://gateway.pinata.cloud/ipfs/${badge.ipfsHash}`}
                      alt={badgeInfo.name}
                      className="w-12 h-12 rounded-lg border-2 border-gray-600"
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
                    <div className={`p-2 rounded-full ${badgeInfo.bg} border ${badgeInfo.border}`} style={{display: 'none'}}>
                      <IconComponent className={`h-6 w-6 ${badgeInfo.color}`} />
                    </div>
                  </div>
                ) : (
                  <div className={`p-2 rounded-full ${badgeInfo.bg} border ${badgeInfo.border} mb-2`}>
                    <IconComponent className={`h-6 w-6 ${badgeInfo.color}`} />
                  </div>
                )}
                
                <div className="space-y-1">
                  <h4 className={`text-xs font-medium ${badgeInfo.color}`}>
                    {badgeInfo.name}
                  </h4>
                  
                  {badge.level > 1 && (
                    <div className="text-xs text-gray-400">
                      Level {badge.level}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    {badge.metadata}
                  </div>
                </div>

                {/* Badge glow effect */}
                <div className={`absolute inset-0 rounded-lg opacity-20 blur-sm ${badgeInfo.bg}`} />
              </div>
            </div>
          );
        })}
      </div>

      {badges.length > 0 && (
        <div className="mt-4 p-3 bg-dark-700 rounded-lg">
          <p className="text-xs text-gray-400 text-center">
            🎉 Keep participating to earn more exclusive NFT badges!
          </p>
        </div>
      )}
    </div>
  );
}
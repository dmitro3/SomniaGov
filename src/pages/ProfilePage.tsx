import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useContractRead } from 'wagmi';
import { User, Edit, Copy, ExternalLink, Trophy, Award, Vote } from 'lucide-react';
import { getContractAddresses, contractABIs } from '../config/contracts';
import { useChainId } from 'wagmi';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [userStats, setUserStats] = useState<any>(null);

  const { data: userStatsData } = useContractRead({
    address: contracts?.governance as `0x${string}`,
    abi: contractABIs.governance,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    enabled: !!address && !!contracts?.governance,
  });

  useEffect(() => {
    if (userStatsData) {
      const [stakedAmount, totalVotes, totalProposals, reputationScore] = userStatsData as any[];
      
      let rank = 'Newcomer';
      const repScore = Number(reputationScore || 0);
      
      if (repScore >= 5000) {
        rank = 'Elder';
      } else if (repScore >= 1500) {
        rank = 'Council';
      } else if (repScore >= 500) {
        rank = 'Delegate';
      } else if (repScore >= 100) {
        rank = 'Contributor';
      }
      
      setUserStats({
        stakedAmount: stakedAmount?.toString() || '0',
        totalVotes: totalVotes?.toString() || '0',
        totalProposals: totalProposals?.toString() || '0',
        reputationScore: reputationScore?.toString() || '0',
        rank
      });
    }
  }, [userStatsData]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard!');
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <User className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Profile</h1>
          <p className="text-gray-400">Please connect your wallet to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Profile</h1>
          <p className="text-gray-400">Manage your governance profile and settings</p>
        </div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark p-8 rounded-xl mb-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter username..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => setIsEditing(false)}
                      >
                        Save
                      </button>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-white">
                        {username || 'Anonymous Voter'}
                      </h2>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                      <button 
                        onClick={copyAddress}
                        className="hover:text-white transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <a 
                        href={`https://explorer.somnia.network/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-dark p-6 rounded-xl text-center"
          >
            <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{userStats?.rank || 'Newcomer'}</div>
            <div className="text-sm text-gray-400">Current Rank</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-dark p-6 rounded-xl text-center"
          >
            <Vote className="h-8 w-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{userStats?.totalVotes || '0'}</div>
            <div className="text-sm text-gray-400">Votes Cast</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-dark p-6 rounded-xl text-center"
          >
            <Award className="h-8 w-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{userStats?.reputationScore || '0'} XP</div>
            <div className="text-sm text-gray-400">Reputation Score</div>
          </motion.div>
        </div>

        {/* Activity History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-dark p-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
          
          <div className="text-center py-12">
            <Vote className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No activity yet</p>
            <p className="text-sm text-gray-500">
              Start by voting on proposals or staking tokens to build your governance profile.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
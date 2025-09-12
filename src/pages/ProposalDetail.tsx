import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount, useContractRead } from 'wagmi';
import { formatEther } from 'ethers';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';
import { getContractAddresses, contractABIs } from '../config/contracts';
import { somniaTestnet } from '../config/contracts';
import { useVote } from '../hooks/useProposals';
import CommentSection from '../components/CommentSection';
import toast from 'react-hot-toast';

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const { address, isConnected } = useAccount();
  const [voting, setVoting] = useState(false);
  const { vote, loading: voteLoading } = useVote();

  const addresses = getContractAddresses(somniaTestnet.id);

  const { data: proposalData, isLoading, refetch } = useContractRead({
    address: addresses.governance,
    abi: contractABIs.governance,
    functionName: 'getProposal',
    args: id && !isNaN(Number(id)) ? [BigInt(id)] : undefined,
    enabled: !!id && !isNaN(Number(id)),
  });

  const { data: proposalOptions } = useContractRead({
    address: addresses.governance,
    abi: contractABIs.governance,
    functionName: 'getProposalOptions',
    args: id && !isNaN(Number(id)) ? [BigInt(id)] : undefined,
    enabled: !!id && !isNaN(Number(id)),
  });

  const { data: userVoteData } = useContractRead({
    address: addresses.governance,
    abi: contractABIs.governance,
    functionName: 'getUserVote',
    args: id && !isNaN(Number(id)) && address ? [BigInt(id), address] : undefined,
    enabled: !!id && !!address,
  });

  const handleVote = async (option: 0 | 1 | 2) => {
    if (voting || voteLoading || !id) return;
    
    try {
      setVoting(true);
      await vote(parseInt(id), option);
      toast.success(`Vote cast successfully!`);
      refetch();
    } catch (error: any) {
      toast.error(`Vote failed: ${error.message}`);
    } finally {
      setVoting(false);
    }
  };

  const getVoteOptionName = (option: number) => {
    switch (option) {
      case 0: return 'Against';
      case 1: return 'For';
      case 2: return 'Abstain';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (!proposalData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Proposal Not Found</h1>
          <p className="text-gray-400 mb-6">The proposal you're looking for doesn't exist.</p>
          <Link 
            to="/proposals" 
            className="btn btn-primary"
          >
            Back to Proposals
          </Link>
        </div>
      </div>
    );
  }

  const [
    proposalId,
    proposer,
    title,
    description,
    startTime,
    endTime,
    forVotes,
    againstVotes,
    abstainVotes,
    executed,
    canceled
  ] = proposalData as any[];

  // Convert from wei to readable numbers
  const forVotesNum = Math.floor(Number(forVotes) / 1e18);
  const againstVotesNum = Math.floor(Number(againstVotes) / 1e18);
  const abstainVotesNum = Math.floor(Number(abstainVotes) / 1e18);
  const totalVotes = forVotesNum + againstVotesNum + abstainVotesNum;
  
  const forPercentage = totalVotes > 0 ? (forVotesNum / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (againstVotesNum / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (abstainVotesNum / totalVotes) * 100 : 0;

  const now = Math.floor(Date.now() / 1000);
  const isActive = now >= Number(startTime) && now <= Number(endTime) && !executed && !canceled;

  const hasVoted = userVoteData ? userVoteData[0] : false;
  const userVoteOption = userVoteData ? userVoteData[1] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/proposals" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Proposals
        </Link>
        
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isActive 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
              : executed 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {isActive ? 'Active' : executed ? 'Executed' : canceled ? 'Canceled' : 'Ended'}
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{proposer.slice(0, 6)}...{proposer.slice(-4)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Ends {new Date(Number(endTime) * 1000).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{totalVotes.toLocaleString()} SGOV tokens</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark p-6 rounded-xl mb-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{description}</p>
          </motion.div>

          {/* Voting Options */}
          {proposalOptions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-dark p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Voting Options</h2>
              <div className="space-y-3">
                {(proposalOptions as string[]).map((option, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">{option}</span>
                    {isConnected && isActive && !hasVoted && (
                      <button
                        onClick={() => handleVote(index as 0 | 1 | 2)}
                        disabled={voting || voteLoading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          voting || voteLoading
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : index === 0
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                            : index === 1
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                        }`}
                      >
                        {voting ? 'Voting...' : `Vote ${option}`}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {hasVoted && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-400 text-sm">
                    ✅ You voted: {getVoteOptionName(Number(userVoteOption))}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CommentSection proposalId={Number(id)} />
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vote Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-dark p-6 rounded-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Results</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    For
                  </span>
                  <span className="text-white font-medium">
                    {forVotesNum.toLocaleString()} SGOV ({forPercentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${totalVotes > 0 ? (forVotesNum / totalVotes) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-red-400">
                    <TrendingDown className="h-4 w-4" />
                    Against
                  </span>
                  <span className="text-white font-medium">
                    {againstVotesNum.toLocaleString()} SGOV ({againstPercentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${totalVotes > 0 ? (againstVotesNum / totalVotes) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {Number(abstainVotes) > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-gray-400">
                      <AlertCircle className="h-4 w-4" />
                      Abstain
                    </span>
                    <span className="text-white font-medium">
                      {abstainVotesNum.toLocaleString()} SGOV ({abstainPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${totalVotes > 0 ? (abstainVotesNum / totalVotes) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total Voting Power:</span>
                <span className="text-white font-medium">{totalVotes.toLocaleString()} SGOV</span>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-dark p-6 rounded-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">Proposal Created</p>
                  <p className="text-gray-400 text-xs">{new Date(Number(startTime) * 1000).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-green-400'}`} />
                <div>
                  <p className="text-white text-sm font-medium">
                    {isActive ? 'Voting Ends' : 'Voting Ended'}
                  </p>
                  <p className="text-gray-400 text-xs">{new Date(Number(endTime) * 1000).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
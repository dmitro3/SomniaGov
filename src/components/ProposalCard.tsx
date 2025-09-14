

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVote } from '../hooks/useProposals';
import { useContract } from '../hooks/useContract';
import toast from 'react-hot-toast';
import { 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown,
  MessageCircle,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Proposal {
  id: number;
  title: string;
  description: string;
  status: 'Active' | 'Passed' | 'Failed' | 'Pending' | 'Executed';
  endTime: number;
  forVotes: number;
  againstVotes: number;
  totalVotes: number;
  quorum: number;
  proposer: string;
  category: string;
  commentCount?: number;
}

interface ProposalCardProps {
  proposal: Proposal;
  showActions?: boolean;
  compact?: boolean;
}

export default function ProposalCard({ 
  proposal, 
  showActions = false, 
  compact = false 
}: ProposalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentCount, setCommentCount] = useState(proposal.commentCount || 0);
  const { governanceContract } = useContract();
  const [voting, setVoting] = useState(false);
  const { vote, loading: voteLoading } = useVote();

  useEffect(() => {
    const fetchCommentCount = async () => {
      if (governanceContract && !proposal.commentCount) {
        try {
          const count = await governanceContract.getProposalCommentCount(proposal.id);
          setCommentCount(Number(count) || 0);
        } catch (error) {
          console.error('Error fetching comment count:', error);
          setCommentCount(0);
        }
      }
    };

    fetchCommentCount();
  }, [governanceContract, proposal.id, proposal.commentCount]);

  const handleVote = async (option: 0 | 1) => {
    if (voting || voteLoading) return;
    
    try {
      setVoting(true);
      await vote(proposal.id, option);
      toast.success(`Vote cast ${option === 1 ? 'For' : 'Against'} proposal!`);
    } catch (error: any) {
      toast.error(`Vote failed: ${error.message}`);
    } finally {
      setVoting(false);
    }
  };

  const getTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Passed': return 'text-success-400 bg-success-400/10 border-success-400/20';
      case 'Failed': return 'text-danger-400 bg-danger-400/10 border-danger-400/20';
      case 'Executed': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-warning-400 bg-warning-400/10 border-warning-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Passed': return <CheckCircle className="h-4 w-4" />;
      case 'Failed': return <XCircle className="h-4 w-4" />;
      case 'Active': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const quorumPercentage = (proposal.totalVotes / proposal.quorum) * 100;

  return (
    <Link to={`/proposals/${proposal.id}`} className="block">
      <motion.div
        className="proposal-card card-hover cursor-pointer"
        whileHover={{ scale: compact ? 1.02 : 1.01 }}
        transition={{ duration: 0.2 }}
      >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-1 ${getStatusColor(proposal.status)}`}>
              {getStatusIcon(proposal.status)}
              {proposal.status}
            </span>
            <span className="px-3 py-1 rounded-full bg-dark-700 text-xs font-medium text-gray-300">
              {proposal.category}
            </span>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
            {proposal.title}
          </h3>
          
          <p className={`text-gray-400 leading-relaxed ${
            compact 
              ? 'line-clamp-2' 
              : isExpanded 
                ? '' 
                : 'line-clamp-3'
          }`}>
            {proposal.description}
          </p>
          
          {!compact && proposal.description.length > 150 && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="text-primary-400 hover:text-primary-300 text-sm mt-2 transition-colors"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
      </div>

      {/* Voting Progress */}
      <div className="space-y-4 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Voting Progress</span>
          <span className="text-white font-medium">
            {proposal.totalVotes.toLocaleString()}
          </span>
        </div>
        
        <div className="w-full bg-dark-700 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(quorumPercentage, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success-400" />
            <span className="text-sm text-gray-400">For:</span>
            <span className="text-sm font-medium text-success-400">
              {proposal.forVotes.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-danger-400" />
            <span className="text-sm text-gray-400">Against:</span>
            <span className="text-sm font-medium text-danger-400">
              {proposal.againstVotes.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-dark-700">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {getTimeRemaining(proposal.endTime)}
          </div>
          
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="truncate">
              {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
            </span>
          </div>

          {!compact && (
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showActions && proposal.status === 'Active' && !proposal.userVote?.hasVoted && (
            <>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(1); }}
                disabled={voting || voteLoading}
                className={`vote-button vote-for text-sm px-4 py-2 ${
                  voting || voteLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-green-500/20 cursor-pointer'
                }`}
              >
                {voting ? 'Voting...' : 'Vote For'}
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(0); }}
                disabled={voting || voteLoading}
                className={`vote-button vote-against text-sm px-4 py-2 ${
                  voting || voteLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-red-500/20 cursor-pointer'
                }`}
              >
                {voting ? 'Voting...' : 'Vote Against'}
              </button>
            </>
          )}
          
          {/* Show user's previous vote if they have voted */}
          {proposal.userVote?.hasVoted && (
            <div className="flex items-center gap-2 text-sm bg-dark-700 px-3 py-2 rounded-lg">
              <span className="text-gray-400">You voted:</span>
              <span className={`font-medium ${
                proposal.userVote.option === 1 ? 'text-success-400' : 
                proposal.userVote.option === 0 ? 'text-danger-400' : 'text-warning-400'
              }`}>
                {proposal.userVote.option === 1 ? 'For' : 
                 proposal.userVote.option === 0 ? 'Against' : 'Abstain'}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-primary-400">
            <ExternalLink className="h-4 w-4" />
            <span className="text-sm">View Details</span>
          </div>
        </div>
      </div>
      </motion.div>
    </Link>
  );
}
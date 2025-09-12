import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContract } from '../hooks/useContract';
import { IPFSService } from '../services/ipfs';
import { sendTransactionWithAutoGas } from '../utils/gasEstimation';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  ipfsHash: string;
}

interface CommentSectionProps {
  proposalId: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ proposalId }) => {
  const { address } = useAccount();
  const { governanceContract, contracts } = useContract();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [proposalId]);

  const loadComments = async () => {
    if (!governanceContract) {
      return;
    }
    
    setLoading(true);
    try {
      const [hashes, authors] = await governanceContract.getProposalComments(proposalId);
      
      if (!hashes || hashes.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }
      
      const commentPromises = hashes.map(async (hash: string, index: number) => {
        const commentData = await IPFSService.getComment(hash);
        if (commentData) {
          return {
            id: hash,
            author: authors[index],
            content: commentData.content,
            timestamp: commentData.timestamp,
            ipfsHash: hash
          };
        }
        return null;
      });

      const loadedComments = (await Promise.all(commentPromises)).filter(Boolean) as Comment[];
      setComments(loadedComments.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !address || !governanceContract) return;
    
    setSubmitting(true);
    try {
      // Upload comment to IPFS
      const commentData = {
        content: newComment.trim(),
        author: address,
        proposalId
      };
      
      const ipfsHash = await IPFSService.uploadComment(commentData);
      if (!window.ethereum) {
        throw new Error('No Ethereum provider found');
      }

      const ethers = await import('ethers');
      
      if (!address) {
        throw new Error('No address available');
      }

      const contractInterface = new ethers.Interface([
        "function addComment(uint256 proposalId, string memory ipfsHash) external"
      ]);
      
      const data = contractInterface.encodeFunctionData('addComment', [proposalId, ipfsHash]);
      
      const txParams = {
        to: contracts.governance,
        data: data,
        from: address
      };
      
      await sendTransactionWithAutoGas(txParams);
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className="glass-dark rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white">
          Discussion <span className="text-gray-400">({comments.length})</span>
        </h3>
      </div>
      
      {/* Comment Form */}
      {address ? (
        <div className="mb-8">
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  {address.slice(2, 4).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this proposal..."
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all"
                  rows={4}
                  disabled={submitting}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-400">
                    {newComment.length}/500 characters
                  </span>
                  <button
                    onClick={submitComment}
                    disabled={!newComment.trim() || submitting || newComment.length > 500}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-purple-600 flex items-center gap-2 transition-all duration-200 font-medium"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Posting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Post Comment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 text-center">
          <p className="text-gray-400 mb-3">Connect your wallet to join the discussion</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Connect Wallet
          </button>
        </div>
      )}
      
      {/* Comments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading discussion...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-300 mb-2">Start the Discussion</h4>
          <p className="text-gray-500">Be the first to share your thoughts on this proposal!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div key={comment.id} className="group">
              <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">
                      {comment.author.slice(2, 4).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-300">
                        {formatAddress(comment.author)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
              {index < comments.length - 1 && (
                <div className="ml-14 my-3">
                  <div className="w-px h-4 bg-gradient-to-b from-gray-600 to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
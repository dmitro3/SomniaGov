import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { 
  Plus, 
  Filter, 
  Search,
  Vote,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProposals } from '../hooks/useProposals';
import ProposalCard from '../components/ProposalCard';

const statusFilters = [
  { value: 'all', label: 'All Proposals', count: 0 },
  { value: 'active', label: 'Active', count: 0 },
  { value: 'passed', label: 'Passed', count: 0 },
  { value: 'failed', label: 'Failed', count: 0 },
  { value: 'executed', label: 'Executed', count: 0 }
];

const categoryFilters = [
  'All Categories',
  'Treasury',
  'Protocol', 
  'Grants',
  'Technical',
  'Community',
  'Partnerships',
  'Security'
];

export default function ProposalsPage() {
  const { address, isConnected } = useAccount();
  const { proposals, loading, error } = useProposals();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortBy, setSortBy] = useState('newest');

  const updatedStatusFilters = statusFilters.map(filter => ({
    ...filter,
    count: filter.value === 'all' 
      ? proposals.length
      : proposals.filter(p => p.status.toLowerCase() === filter.value).length
  }));

  // Filter and sort proposals
  const filteredProposals = proposals
    .filter(proposal => {
      const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           proposal.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || proposal.status.toLowerCase() === statusFilter;
      const matchesCategory = categoryFilter === 'All Categories' || proposal.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.startTime - a.startTime;
        case 'oldest':
          return a.startTime - b.startTime;
        case 'ending':
          return a.endTime - b.endTime;
        case 'votes':
          return b.totalVotes - a.totalVotes;
        default:
          return 0;
      }
    });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <Vote className="h-16 w-16 text-danger-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Error Loading Proposals</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Governance Proposals</h1>
            <p className="text-xl text-gray-400">
              Vote on proposals that shape the future of our community
            </p>
          </div>
          
          {isConnected && (
            <Link 
              to="/proposals/create" 
              className="btn btn-primary flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Plus className="h-5 w-5" />
              Create Proposal
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stats-card text-center">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {proposals.length}
            </div>
            <div className="text-sm text-gray-400">Total Proposals</div>
          </div>
          <div className="stats-card text-center">
            <div className="text-2xl font-bold text-success-400 mb-1">
              {proposals.filter(p => p.status === 'Active').length}
            </div>
            <div className="text-sm text-gray-400">Active Now</div>
          </div>
          <div className="stats-card text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {proposals.reduce((sum, p) => sum + p.totalVotes, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Votes</div>
          </div>
          <div className="stats-card text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {Math.round(proposals.filter(p => p.status === 'Passed').length / Math.max(proposals.length, 1) * 100)}%
            </div>
            <div className="text-sm text-gray-400">Pass Rate</div>
          </div>
        </div>

        {/* Filters */}
        <div className="stats-card mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search proposals..."
                  className="form-input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {updatedStatusFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label} ({filter.count})
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categoryFilters.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="ending">Ending Soon</option>
              <option value="votes">Most Votes</option>
            </select>
          </div>
        </div>

        {/* Proposals List */}
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="proposal-card animate-pulse">
                <div className="h-6 bg-dark-700 rounded mb-4"></div>
                <div className="h-4 bg-dark-700 rounded mb-2"></div>
                <div className="h-4 bg-dark-700 rounded mb-4 w-3/4"></div>
                <div className="h-2 bg-dark-700 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-dark-700 rounded w-24"></div>
                  <div className="h-4 bg-dark-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProposals.length > 0 ? (
          <div className="space-y-6">
            {filteredProposals.map((proposal, index) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProposalCard proposal={proposal} showActions={isConnected} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Vote className="h-20 w-20 text-gray-500 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'All Categories'
                ? 'No matching proposals found'
                : 'No proposals yet'
              }
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'All Categories'
                ? 'Try adjusting your filters to see more proposals.'
                : 'Be the first to create a governance proposal and start the discussion!'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'All Categories' ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCategoryFilter('All Categories');
                  }}
                  className="btn btn-outline"
                >
                  Clear Filters
                </button>
              ) : null}
              
              {isConnected && (
                <Link to="/proposals/create" className="btn btn-primary">
                  Create First Proposal
                </Link>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
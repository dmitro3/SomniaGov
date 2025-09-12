

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { 
  Vote, 
  Trophy, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  BarChart3,
  MessageCircle,
  Coins,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatsCard from './components/StatsCard';
import ProposalCard from './components/ProposalCard';
import BadgeShowcase from './components/BadgeShowcase';
import ReputationDisplay from './components/ReputationDisplay';
import { useProposals, useGovernanceStats } from './hooks/useProposals';

const features = [
  {
    icon: Vote,
    title: 'Batch Voting',
    description: 'Vote on multiple proposals in a single transaction, saving gas and time.',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    icon: Trophy,
    title: 'Hierarchical Ranks',
    description: 'Progress from Newcomer to Elder, unlocking new abilities and voting multipliers.',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    icon: Award,
    title: 'Evolving NFTs',
    description: 'Collect and evolve participation badges that showcase your governance journey.',
    gradient: 'from-pink-500 to-pink-600'
  },
  {
    icon: MessageCircle,
    title: 'Onchain Discussions',
    description: 'Participate in fully decentralized discussions and debates.',
    gradient: 'from-green-500 to-green-600'
  },
  {
    icon: TrendingUp,
    title: 'Conviction Voting',
    description: 'Lock tokens longer for increased voting power and show your commitment.',
    gradient: 'from-yellow-500 to-yellow-600'
  },
  {
    icon: Users,
    title: 'Liquid Democracy',
    description: 'Delegate your votes to experts while maintaining the ability to override.',
    gradient: 'from-indigo-500 to-indigo-600'
  }
];


export default function Home() {
  const { address, isConnected } = useAccount();
  const { proposals, loading: proposalsLoading, proposalCount } = useProposals();
  const { userStats, tokenStats, loading: statsLoading } = useGovernanceStats();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        
        <motion.div 
          className="relative container mx-auto px-4 py-20 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-8"
            variants={itemVariants}
          >
            <span className="gradient-text">SOMIAGOV</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto"
            variants={itemVariants}
          >
            The most advanced decentralized governance platform on Somnia Network. 
            Vote, delegate, earn rewards, and shape the future of decentralized communities.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            variants={itemVariants}
          >
            <Link 
              to="/proposals" 
              className="btn btn-primary text-lg px-8 py-4 hover:scale-105 transform transition-all"
            >
              Explore Proposals
            </Link>
            <Link 
              to="/dashboard" 
              className="btn btn-outline text-lg px-8 py-4 hover:scale-105 transform transition-all"
            >
              View Dashboard
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            variants={itemVariants}
          >
            <StatsCard
              icon={Vote}
              title="Total Proposals"
              value={proposalCount || 0}
              change="+12%"
            />
            <StatsCard
              icon={Users}
              title="Active Voters"
              value={proposals.filter(p => p.totalVotes > 0).length || 0}
              change="+8%"
              format="number"
            />
            <StatsCard
              icon={Coins}
              title="Total Votes Cast"
              value={proposals.reduce((sum, p) => sum + p.totalVotes, 0) || 0}
              change="+15%"
              format="number"
            />
            <StatsCard
              icon={Shield}
              title="Active Proposals"
              value={proposals.filter(p => p.status === 'Active').length || 0}
              change="+3%"
              format="number"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* User Status Section */}
      {isConnected && (
        <section className="py-16 border-t border-dark-700">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-center mb-8">Your Governance Profile</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <ReputationDisplay
                  rank={userStats ? (() => {
                    const repScore = Number(userStats[3] || 0); // reputationScore is at index 3
                    if (repScore >= 5000) return 'Elder';
                    if (repScore >= 1500) return 'Council';
                    if (repScore >= 500) return 'Delegate';
                    if (repScore >= 100) return 'Contributor';
                    return 'Newcomer';
                  })() : 'Newcomer'}
                  reputation={userStats ? Number(userStats[3]) : 0}
                  address={address}
                />
                
                <BadgeShowcase
                  badgeCount={3} // Will be replaced with real NFT count
                  latestBadge="Participation Badge"
                />
                
                <div className="stats-card">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="h-6 w-6 text-primary-500" />
                    <h3 className="text-lg font-semibold">Activity Stats</h3>
                  </div>
                  {userStats ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Votes Cast</span>
                        <span className="font-semibold">{Number(userStats[2])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Proposals Created</span>
                        <span className="font-semibold">{Number(userStats[3])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tokens Staked</span>
                        <span className="font-semibold text-success-400">{Number(userStats[4]).toLocaleString()} SGOV</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reputation Score</span>
                        <span className="font-semibold text-primary-400">{Number(userStats[1])}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-dark-700 rounded w-3/4"></div>
                        <div className="h-4 bg-dark-700 rounded w-1/2"></div>
                        <div className="h-4 bg-dark-700 rounded w-2/3"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 border-t border-dark-700">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Advanced Governance Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the most sophisticated governance mechanisms designed for 
              maximum participation, fairness, and community engagement.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group relative overflow-hidden glass-dark rounded-xl p-6 hover:scale-105 transition-all duration-300"
                variants={itemVariants}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Active Proposals Section */}
      <section className="py-20 border-t border-dark-700">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-4xl font-bold mb-4">Active Proposals</h2>
              <p className="text-xl text-gray-300">
                Participate in ongoing governance decisions
              </p>
            </div>
            <Link 
              to="/proposals" 
              className="btn btn-primary hover:scale-105 transition-transform"
            >
              View All Proposals
            </Link>
          </motion.div>

          <motion.div 
            className="grid lg:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {proposalsLoading ? (
              // Loading skeleton
              Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="proposal-card animate-pulse">
                  <div className="h-6 bg-dark-700 rounded mb-4"></div>
                  <div className="h-4 bg-dark-700 rounded mb-2"></div>
                  <div className="h-4 bg-dark-700 rounded mb-4"></div>
                  <div className="h-2 bg-dark-700 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-dark-700 rounded w-20"></div>
                    <div className="h-4 bg-dark-700 rounded w-16"></div>
                  </div>
                </div>
              ))
            ) : proposals.length > 0 ? (
              proposals.slice(0, 2).map((proposal, index) => (
                <motion.div key={proposal.id} variants={itemVariants}>
                  <ProposalCard proposal={proposal} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <Vote className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Proposals Yet</h3>
                <p className="text-gray-400 mb-6">Be the first to create a governance proposal!</p>
                <Link to="/proposals/create" className="btn btn-primary">
                  Create First Proposal
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-dark-700">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Shape the Future?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of governance participants earning rewards, 
              building reputation, and making decisions that matter.
            </p>
            
            {!isConnected ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn btn-primary text-lg px-8 py-4">
                  Connect Wallet
                </button>
                <Link to="/about" className="btn btn-outline text-lg px-8 py-4">
                  Learn More
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/proposals/create" className="btn btn-primary text-lg px-8 py-4">
                  Create Proposal
                </Link>
                <Link to="/stake" className="btn btn-secondary text-lg px-8 py-4">
                  Stake Tokens
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
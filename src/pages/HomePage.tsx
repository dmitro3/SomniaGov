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
import StatsCard from '../components/StatsCard';
import ProposalCard from '../components/ProposalCard';
import { useProposals } from '../hooks/useProposals';

export default function HomePage() {
  const { isConnected } = useAccount();
  const { proposals, loading, proposalCount } = useProposals();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const recentProposals = proposals.slice(0, 3);

  const features = [
    {
      icon: Vote,
      title: 'Advanced Voting',
      description: 'Quadratic voting, conviction voting, and batch operations',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Trophy,
      title: 'Reputation System',
      description: 'Earn experience and climb the governance hierarchy',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: Award,
      title: 'Evolving NFTs',
      description: 'Collect and evolve unique governance achievement badges',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Coins,
      title: 'Token Staking',
      description: 'Stake tokens with lock periods for enhanced voting power',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Users,
      title: 'Liquid Democracy',
      description: 'Delegate your voting power to trusted community members',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      icon: MessageCircle,
      title: 'Onchain Discussion',
      description: 'Participate in governance discussions directly on-chain',
      color: 'from-red-500 to-rose-600'
    }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl font-bold mb-8">
              <span className="gradient-text">SOMIAGOV</span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              The most advanced decentralized governance platform. 
              Experience quadratic voting, evolving NFT badges, and sophisticated tokenomics 
              all built on the lightning-fast Somnia Network.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link to={isConnected ? "/dashboard" : "/proposals"}>
                <button className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-secondary-700 transition-all transform hover:scale-105 shadow-2xl">
                  {isConnected ? 'Go to Dashboard' : 'Explore Governance'}
                </button>
              </Link>
              
              <Link to="/proposals/create">
                <button className="px-8 py-4 border-2 border-primary-500 text-primary-400 rounded-xl font-semibold text-lg hover:bg-primary-500/10 transition-all transform hover:scale-105">
                  Create Proposal
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            <StatsCard
              icon={Vote}
              title="Active Proposals"
              value={proposalCount.toString()}
              subtitle="Currently voting"
              gradient="from-blue-500 to-cyan-600"
            />
            <StatsCard
              icon={Users}
              title="Community Members"
              value="2,500+"
              subtitle="Governance participants"
              gradient="from-green-500 to-emerald-600"
            />
            <StatsCard
              icon={Coins}
              title="Total Staked"
              value="50M+"
              subtitle="SGOV tokens locked"
              gradient="from-purple-500 to-pink-600"
            />
            <StatsCard
              icon={Trophy}
              title="NFT Badges"
              value="10,000+"
              subtitle="Achievements earned"
              gradient="from-yellow-500 to-orange-600"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Revolutionary Governance Features
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the next generation of decentralized governance with advanced voting mechanisms,
              gamified participation, and sophisticated tokenomics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-dark p-8 rounded-2xl hover:bg-primary-600/5 transition-all group cursor-pointer"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Proposals Section */}
      {recentProposals.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
                Active Governance
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Participate in the latest proposals and shape the future of the protocol
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentProposals.map((proposal, index) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProposalCard proposal={proposal} />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link to="/proposals">
                <button className="px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-secondary-700 transition-all transform hover:scale-105">
                  View All Proposals
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-secondary-600/10" />
        <div className="container mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-8">
              Ready to Shape the Future?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of governance participants earning rewards, collecting NFT badges,
              and building the decentralized future together.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/stake">
                <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105">
                  Start Staking
                </button>
              </Link>
              <Link to="/reputation">
                <button className="px-8 py-4 border-2 border-purple-500 text-purple-400 rounded-xl font-semibold text-lg hover:bg-purple-500/10 transition-all transform hover:scale-105">
                  View Badges
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
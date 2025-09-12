import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WagmiConfig } from 'wagmi'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

import Navbar from './components/Navbar'

import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard' 
import ProposalsPage from './pages/ProposalsPage'
import ProposalDetail from './pages/ProposalDetail'
import CreateProposal from './pages/CreateProposal'
import ReputationPage from './pages/ReputationPage'
import StakePage from './pages/StakePage'
import FaucetPage from './pages/FaucetPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

import { somniaTestnet } from './config/contracts'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'f188478f2e0b45aa7780b062d4eab58c'

const chains = [somniaTestnet]
const { publicClient } = configureChains(chains, [
  w3mProvider({ projectId }),
  publicProvider()
])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ 
    projectId, 
    chains 
  }),
  publicClient
})

const ethereumClient = new EthereumClient(wagmiConfig, chains)

function SafeWeb3Modal({ projectId, ethereumClient }: { projectId: string, ethereumClient: any }) {
  useEffect(() => {
    const originalFilter = Array.prototype.filter;
    const originalSome = Array.prototype.some;
    
    Array.prototype.filter = function(callback, thisArg) {
      try {
        if (typeof callback !== 'function') return [];
        if (!this || this.length === 0) return [];
        
        return originalFilter.call(this, (item, index, array) => {
          try {
            if (item === null || item === undefined) return false;
            return callback.call(thisArg, item, index, array);
          } catch (error) {
            return false;
          }
        }, thisArg);
      } catch (error) {
        return [];
      }
    };

    Array.prototype.some = function(callback, thisArg) {
      try {
        if (typeof callback !== 'function') return false;
        if (!this || this.length === 0) return false;
        
        return originalSome.call(this, (item, index, array) => {
          try {
            if (item === null || item === undefined) return false;
            return callback.call(thisArg, item, index, array);
          } catch (error) {
            return false;
          }
        }, thisArg);
      } catch (error) {
        return false;
      }
    };

    return () => {
      Array.prototype.filter = originalFilter;
      Array.prototype.some = originalSome;
    };
  }, []);

  try {
    return (
      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeMode="dark"
        themeVariables={{
          '--w3m-font-family': 'Inter, system-ui, sans-serif',
          '--w3m-accent-color': '#667eea'
        }}
      />
    );
  } catch (error) {
    console.error('Web3Modal render error:', error);
    return null;
  }
}

function App() {

  return (
    <WagmiConfig config={wagmiConfig}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" style={{overflow: 'visible'}}>
          <Navbar />
          
          <main className="relative">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/proposals" element={<ProposalsPage />} />
              <Route path="/proposals/:id" element={<ProposalDetail />} />
              <Route path="/proposals/create" element={<CreateProposal />} />
              <Route path="/reputation" element={<ReputationPage />} />
              <Route path="/stake" element={<StakePage />} />
              <Route path="/faucet" element={<FaucetPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>

          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #374151',
              },
            }}
          />
        </div>
      </Router>
      
      <SafeWeb3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </WagmiConfig>
  )
}

export default App
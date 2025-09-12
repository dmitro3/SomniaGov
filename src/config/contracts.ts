
import { Chain } from 'wagmi';

import GovernanceABI from './Governance.abi.json'
import GovernanceTokenABI from '../../artifacts/contracts/GovernanceToken.sol/GovernanceToken.json'
import ReputationNFTABI from '../../artifacts/contracts/ReputationNFT.sol/ReputationNFT.json'

const GovernanceABI_Contracts = GovernanceABI;
const TokenABI = GovernanceTokenABI.abi;
const ReputationABI_Contracts = ReputationNFTABI.abi;

export const somniaMainnet: Chain = {
  id: 2019,
  name: 'Somnia Network',
  network: 'somnia',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    public: { http: ['http://dream-rpc.somnia.network/'] },
    default: { http: ['http://dream-rpc.somnia.network/'] },
  },
  blockExplorers: {
    default: { name: 'Somnia Explorer', url: 'https://explorer.somnia.network' },
  },
};

export const somniaTestnet: Chain = {
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    public: { http: ['http://dream-rpc.somnia.network/'] },
    default: { http: ['http://dream-rpc.somnia.network/'] },
  },
  blockExplorers: {
    default: { name: 'Somnia Testnet Explorer', url: 'https://testnet-explorer.somnia.network' },
  },
  testnet: true,
};

// Contract addresses for different networks
export interface ContractAddresses {
  governance: `0x${string}`;
  token: `0x${string}`;
  reputation: `0x${string}`;
}

export const contractAddresses: Record<number, ContractAddresses> = {
  // Somnia Mainnet (2019)
  2019: {
    governance: (import.meta.env.VITE_GOVERNANCE_CONTRACT_MAINNET || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    token: (import.meta.env.VITE_GOVERNANCE_TOKEN_MAINNET || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    reputation: (import.meta.env.VITE_REPUTATION_NFT_MAINNET || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  },
  // Somnia Testnet (50312 - updated chain ID)
  50312: {
    governance: (import.meta.env.VITE_GOVERNANCE_CONTRACT_TESTNET || import.meta.env.VITE_GOVERNANCE_CONTRACT || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    token: (import.meta.env.VITE_GOVERNANCE_TOKEN_TESTNET || import.meta.env.VITE_GOVERNANCE_TOKEN || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    reputation: (import.meta.env.VITE_REPUTATION_NFT_TESTNET || import.meta.env.VITE_REPUTATION_NFT || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  },
  // Local Hardhat (1337)
  1337: {
    governance: (import.meta.env.VITE_GOVERNANCE_CONTRACT_LOCAL || '0x5FbDB2315678afecb367f032d93F642f64180aa3') as `0x${string}`,
    token: (import.meta.env.VITE_GOVERNANCE_TOKEN_LOCAL || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512') as `0x${string}`,
    reputation: (import.meta.env.VITE_REPUTATION_NFT_LOCAL || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0') as `0x${string}`,
  },
};

// Contract ABIs
export const contractABIs = {
  governance: GovernanceABI_Contracts,
  token: TokenABI,
  reputation: ReputationABI_Contracts,
} as const;

// Helper function to get contract addresses for current network
export function getContractAddresses(chainId: number): ContractAddresses {
  const addresses = contractAddresses[chainId];
  if (!addresses) {
    console.warn(`No contract addresses configured for chain ID: ${chainId}`);
    return contractAddresses[50312]; // Fallback to testnet (updated chain ID)
  }
  return addresses;
}

// Helper function to check if contracts are deployed
export function areContractsDeployed(chainId: number): boolean {
  const addresses = getContractAddresses(chainId);
  
  // Safety check to prevent runtime errors
  if (!addresses) {
    console.warn(`No addresses found for chain ID: ${chainId}`);
    return false;
  }
  
  return (
    addresses.governance !== '0x0000000000000000000000000000000000000000' &&
    addresses.token !== '0x0000000000000000000000000000000000000000' &&
    addresses.reputation !== '0x0000000000000000000000000000000000000000'
  );
}

// Supported networks
export const supportedChains = [somniaMainnet, somniaTestnet];

// Default network for development
export const defaultChain = somniaTestnet;

// Contract deployment info
export interface DeploymentInfo {
  network: string;
  chainId: number;
  blockNumber?: number;
  timestamp?: string;
  deployer?: string;
  gasUsed?: {
    governance?: string;
    token?: string;
    reputation?: string;
  };
}

// Load deployment info if available
export async function loadDeploymentInfo(): Promise<DeploymentInfo | null> {
  try {
    const response = await fetch('/deployment.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('No deployment info found');
  }
  return null;
}

// Environment validation
export function validateEnvironment(): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check for required environment variables
  if (!import.meta.env.VITE_WALLETCONNECT_PROJECT_ID) {
    missing.push('VITE_WALLETCONNECT_PROJECT_ID');
  }

  // Check for at least one set of contract addresses
  const hasTestnetAddresses = import.meta.env.VITE_GOVERNANCE_CONTRACT_TESTNET || import.meta.env.VITE_GOVERNANCE_CONTRACT;
  const hasMainnetAddresses = import.meta.env.VITE_GOVERNANCE_CONTRACT_MAINNET;
  
  if (!hasTestnetAddresses && !hasMainnetAddresses) {
    warnings.push('No contract addresses configured. Deploy contracts first.');
  }

  // Check for production readiness
  if (import.meta.env.MODE === 'production') {
    if (!hasMainnetAddresses) {
      warnings.push('Production deployment without mainnet contract addresses');
    }
    if (!import.meta.env.VITE_ALCHEMY_ID && !import.meta.env.VITE_INFURA_PROJECT_ID) {
      warnings.push('No production RPC provider configured');
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

// Export current environment configuration
export const config = {
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  defaultChainId: parseInt(import.meta.env.VITE_CHAIN_ID || '50312'),
  walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  enableTestnet: import.meta.env.VITE_ENABLE_TESTNET !== 'false',
  enableMainnet: import.meta.env.VITE_ENABLE_MAINNET === 'true',
};
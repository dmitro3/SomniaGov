# SOMIAGOV - Advanced Decentralized Governance Platform

![SOMIAGOV Logo](https://img.shields.io/badge/SOMIAGOV-Governance%20Platform-blue?style=for-the-badge)
![Network](https://img.shields.io/badge/Network-Somnia%20Testnet-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**The most advanced decentralized governance platform on Somnia Network**, featuring hierarchical reputation systems, NFT badges, batch voting, liquid democracy, and conviction voting mechanisms.

## 🌟 Features

### 🗳️ **Advanced Voting Mechanisms**
- **Batch Voting**: Vote on multiple proposals in a single transaction
- **Conviction Voting**: Lock tokens longer for increased voting power
- **Liquid Democracy**: Delegate votes to experts while maintaining override ability
- **Weighted Voting**: Vote power increases with reputation and token stake

### 🏆 **Hierarchical Reputation System**
- **Newcomer** (0+ XP): Basic participation rights
- **Contributor** (100+ XP): Enhanced voting power
- **Delegate** (500+ XP): Can receive delegated votes
- **Council** (1500+ XP): Proposal creation privileges
- **Elder** (5000+ XP): Maximum governance powers

### 🎖️ **Dynamic NFT Badge System**
- **Participation Badges**: Reward active governance participation
- **Voting Streak Badges**: Recognize consistent voting behavior
- **Proposal Creator Badges**: Honor proposal authors
- **Early Supporter Badges**: Acknowledge early platform adopters
- **Milestone Badges**: Celebrate reputation milestones
- **Event Participation**: Special event commemorations
- **Leadership Recognition**: Outstanding community leadership
- **Innovation Awards**: Recognize innovative contributions

### 💰 **Economic Incentives**
- **Staking Rewards**: Earn rewards for token staking
- **Participation Rewards**: Get rewarded for active governance
- **Reputation Mining**: Earn XP through quality contributions
- **Gas Optimization**: Automatic gas estimation for all transactions

### 🔄 **Real-time Features**
- **Live Proposal Tracking**: Real-time voting progress
- **Dynamic Statistics**: Live governance metrics
- **Activity Feeds**: Track community engagement
- **Notification System**: Stay updated on governance activities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet
- Somnia Testnet tokens

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/somiagov.git
cd somiagov

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Compile smart contracts
npm run compile

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PRIVATE_KEY=your_wallet_private_key

# Network Configuration - Somnia Testnet
VITE_CHAIN_ID=50312
VITE_NETWORK_NAME=somnia-testnet
VITE_RPC_URL=http://dream-rpc.somnia.network/
VITE_ENABLE_TESTNET=true

# Contract Addresses (Latest Deployment)
VITE_GOVERNANCE_CONTRACT_TESTNET=0x4d6eDaa8B2c8Df3E56C6Ef71744D31F05DD6A217
VITE_GOVERNANCE_TOKEN_TESTNET=0x49C240290238648F731c55B3563cE9CB2b295a5a
VITE_REPUTATION_NFT_TESTNET=0x83E7914446675D9046C08201e8e84F014007D9a6

# Wallet Connection
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# IPFS Configuration
VITE_INFURA_IPFS_PROJECT_ID=your_ipfs_project_id
VITE_INFURA_IPFS_SECRET=your_ipfs_secret
```

## 📋 Smart Contracts

### Core Contracts

| Contract | Address | Description |
|----------|---------|-------------|
| **Governance** | `0x4d6eDaa8B2c8Df3E56C6Ef71744D31F05DD6A217` | Main governance logic and proposal management |
| **GovernanceToken** | `0x49C240290238648F731c55B3563cE9CB2b295a5a` | ERC-20 governance token with staking |
| **ReputationNFT** | `0x83E7914446675D9046C08201e8e84F014007D9a6` | Dynamic NFT badges and reputation tracking |

### Contract Functions

#### Governance Contract
```solidity
// Proposal Management
function createProposal(string memory title, string memory description, uint256 duration)
function vote(uint256 proposalId, uint8 support, uint256 amount)
function batchVote(uint256[] memory proposalIds, uint8[] memory supports, uint256[] memory amounts)
function executeProposal(uint256 proposalId)

// User Statistics  
function getUserStats(address user) returns (uint256 stakedAmount, uint256 totalVotes, uint256 totalProposals, uint256 reputationScore, uint256 lastActivity)

// Delegation
function delegate(address to)
function undelegate()
```

#### GovernanceToken Contract
```solidity
// Token Management
function faucet() // Get test tokens
function stake(uint256 amount)
function unstake(uint256 amount)
function getStakedAmount(address user) returns (uint256)

// Standard ERC-20 functions
function transfer(address to, uint256 amount)
function approve(address spender, uint256 amount)
function balanceOf(address account) returns (uint256)
```

#### ReputationNFT Contract
```solidity
// Badge Management
function awardBadge(address to, BadgeType badgeType, string memory reason)
function getBadgesByAddress(address owner) returns (Badge[] memory)
function setBadgeImage(uint8 badgeType, string memory ipfsHash)

// NFT Functions
function tokenURI(uint256 tokenId) returns (string memory)
function balanceOf(address owner) returns (uint256)
```

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive design
- **Framer Motion** for smooth animations
- **Wagmi** for Web3 integration
- **React Router** for navigation
- **Zustand** for state management

### Blockchain Stack
- **Hardhat** for smart contract development
- **OpenZeppelin** for secure contract templates
- **Ethers.js** for blockchain interactions
- **Somnia Network** for fast, low-cost transactions

### Storage & IPFS
- **IPFS** for decentralized metadata storage
- **Pinata** for reliable IPFS pinning
- **Local Storage** for user preferences

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Preview production build
npm run lint            # Run ESLint

# Smart Contracts
npm run compile         # Compile contracts
npm run test           # Run contract tests
npm run deploy         # Deploy to default network
npm run deploy:testnet # Deploy to Somnia testnet
npm run node          # Start local Hardhat node

# Utilities
npm run verify-rpc     # Verify RPC connection
```

### Project Structure

```
somiagov/
├── contracts/              # Smart contracts
│   ├── Governance.sol     # Main governance contract
│   ├── GovernanceToken.sol # ERC-20 token contract
│   └── ReputationNFT.sol  # NFT badge contract
├── scripts/               # Deployment scripts
│   ├── deploy.js         # Main deployment script
│   └── setBadgeImages.js # Badge image configuration
├── src/                  # Frontend application
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── utils/           # Utility functions
│   └── styles/          # CSS and styling
├── test/                # Contract tests
└── artifacts/           # Compiled contract artifacts
```

## 🎮 Usage Guide

### Getting Started

1. **Connect Wallet**: Connect your Web3 wallet to Somnia Testnet
2. **Get Test Tokens**: Use the faucet to get SGOV tokens
3. **Stake Tokens**: Stake tokens to participate in governance
4. **Create Proposals**: Submit proposals for community voting
5. **Vote on Proposals**: Participate in governance decisions
6. **Earn Reputation**: Build XP through active participation
7. **Collect NFT Badges**: Earn badges for achievements

### Governance Process

1. **Proposal Creation**
   - Must have Council rank (1500+ XP) or higher
   - Provide clear title and description
   - Set voting duration (minimum 1 day)

2. **Voting Phase**
   - Vote with For/Against/Abstain
   - Voting power = Token stake × Reputation multiplier
   - Can change vote until voting ends

3. **Execution**
   - Proposals pass with majority support
   - Anyone can execute passed proposals
   - Failed proposals can be recreated with improvements

### Reputation System

| Rank | XP Required | Abilities |
|------|-------------|-----------|
| **Newcomer** | 0+ | Basic voting, faucet access |
| **Contributor** | 100+ | Enhanced voting power (1.2x multiplier) |
| **Delegate** | 500+ | Receive delegated votes, 1.5x multiplier |
| **Council** | 1500+ | Create proposals, 2x multiplier |
| **Elder** | 5000+ | All governance powers, 3x multiplier |

### Badge Types

- 🎯 **Participation**: Regular governance engagement
- 🔥 **Voting Streak**: Consistent voting behavior
- 📝 **Proposal Creator**: Successful proposal creation
- 🌟 **Early Supporter**: Early platform adoption
- 🏆 **Milestone**: Reputation milestones
- 🎉 **Event Participation**: Special events
- 👑 **Leadership**: Outstanding community leadership
- 💡 **Innovation**: Innovative contributions

## 🔧 Configuration

### Network Configuration

Add Somnia Testnet to your wallet:

```json
{
  "chainId": "0xC458",
  "chainName": "Somnia Testnet",
  "rpcUrls": ["http://dream-rpc.somnia.network/"],
  "nativeCurrency": {
    "name": "STT",
    "symbol": "STT",
    "decimals": 18
  },
  "blockExplorerUrls": ["https://somnia-testnet.blockscout.com/"]
}
```

### Gas Configuration

The platform automatically estimates gas for all transactions with a 20% buffer for reliability. Gas estimation is optimized for Rabby wallet compatibility.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/Governance.test.js

# Run tests with coverage
npx hardhat coverage

# Run gas reporter
REPORT_GAS=true npm test
```

## 🚀 Deployment

### Testnet Deployment

```bash
# Deploy to Somnia Testnet
npm run deploy:testnet

# Set up badge images
npx hardhat run scripts/setBadgeImages.js --network somnia_testnet
```

### Production Deployment

```bash
# Deploy to Somnia Mainnet
npm run deploy:production

# Verify contracts (if supported)
npx hardhat verify --network somnia DEPLOYED_CONTRACT_ADDRESS
```

## 🛡️ Security

### Smart Contract Security
- **OpenZeppelin** battle-tested contracts
- **ReentrancyGuard** protection on critical functions
- **Access control** with owner-only functions
- **Input validation** on all public functions
- **Safe math** operations throughout

### Frontend Security
- **Environment variables** for sensitive data
- **Input sanitization** for user data
- **Secure wallet connections** via Wagmi
- **HTTPS-only** API communications

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Write comprehensive tests
- Document new features
- Follow existing naming conventions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [https://somiagov.com](https://somiagov.com)
- **Documentation**: [https://docs.somiagov.com](https://docs.somiagov.com)
- **Discord**: [https://discord.gg/somiagov](https://discord.gg/somiagov)
- **Twitter**: [@SomiaGov](https://twitter.com/somiagov)
- **GitHub**: [https://github.com/somiagov](https://github.com/somiagov)

## 🆘 Support

- **Documentation**: Check our comprehensive docs
- **Discord**: Join our community for help
- **GitHub Issues**: Report bugs and request features
- **Email**: support@somiagov.com

## 🙏 Acknowledgments

- **Somnia Network** for providing the blockchain infrastructure
- **OpenZeppelin** for secure smart contract templates
- **The Community** for feedback and contributions
- **Early Testers** for helping improve the platform

---

**Built with ❤️ for decentralized governance on Somnia Network**

*Last updated: September 11, 2025*
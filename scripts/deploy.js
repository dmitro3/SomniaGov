const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SOMIAGOV Contracts...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "STT");

  console.log("\nDeploying contracts...");

  console.log("1. Deploying GovernanceToken...");
  const TokenFactory = await ethers.getContractFactory("GovernanceToken");
  const token = await TokenFactory.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("GovernanceToken deployed to:", tokenAddress);

  console.log("2. Deploying ReputationNFT...");
  const ReputationNFTFactory = await ethers.getContractFactory("ReputationNFT");
  const reputationNFT = await ReputationNFTFactory.deploy();
  await reputationNFT.waitForDeployment();
  const reputationNFTAddress = await reputationNFT.getAddress();
  console.log("ReputationNFT deployed to:", reputationNFTAddress);

  console.log("3. Deploying Governance...");
  const GovernanceFactory = await ethers.getContractFactory("Governance");
  const governance = await GovernanceFactory.deploy(
    tokenAddress,
    reputationNFTAddress
  );
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("Governance deployed to:", governanceAddress);

  console.log("\nSetting up cross-contract references...");
  
  console.log("Setting governance contract in NFT...");
  await reputationNFT.setGovernanceContract(governanceAddress);

  console.log("\nDeployment completed successfully!");
  console.log("\nContract Addresses:");
  console.log("GovernanceToken:", tokenAddress);
  console.log("ReputationNFT:", reputationNFTAddress);
  console.log("Governance:", governanceAddress);

  console.log("\nUpdate your .env file with these addresses:");
  console.log(`VITE_GOVERNANCE_CONTRACT_TESTNET=${governanceAddress}`);
  console.log(`VITE_GOVERNANCE_TOKEN_TESTNET=${tokenAddress}`);
  console.log(`VITE_REPUTATION_NFT_TESTNET=${reputationNFTAddress}`);

  const addresses = {
    governance: governanceAddress,
    token: tokenAddress,
    reputation: reputationNFTAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    network: process.env.HARDHAT_NETWORK || "somnia_testnet"
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployed-addresses.json',
    JSON.stringify(addresses, null, 2)
  );
  console.log("Contract addresses saved to deployed-addresses.json");

  console.log("\nDeployment complete! Contracts are ready for use.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
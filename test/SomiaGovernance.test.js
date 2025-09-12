const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SOMIAGOV Contracts", function () {
  let governanceToken;
  let reputationNFT;
  let governance;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy GovernanceToken
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    governanceToken = await GovernanceToken.deploy();
    await governanceToken.waitForDeployment();

    // Deploy ReputationNFT
    const ReputationNFT = await ethers.getContractFactory("ReputationNFT");
    reputationNFT = await ReputationNFT.deploy();
    await reputationNFT.waitForDeployment();

    // Deploy SomiaGovernance
    const SomiaGovernance = await ethers.getContractFactory("SomiaGovernance");
    governance = await SomiaGovernance.deploy(
      await governanceToken.getAddress(),
      await reputationNFT.getAddress(),
      owner.address
    );
    await governance.waitForDeployment();

    // Setup contract connections
    await governanceToken.setGovernanceContract(await governance.getAddress());
    await governanceToken.setReputationNFT(await reputationNFT.getAddress());
    await reputationNFT.setGovernanceContract(await governance.getAddress());
  });

  describe("Deployment", function () {
    it("Should deploy all contracts successfully", async function () {
      expect(await governanceToken.getAddress()).to.not.equal("0x0000000000000000000000000000000000000000");
      expect(await reputationNFT.getAddress()).to.not.equal("0x0000000000000000000000000000000000000000");
      expect(await governance.getAddress()).to.not.equal("0x0000000000000000000000000000000000000000");
    });

    it("Should set correct initial values", async function () {
      expect(await governanceToken.name()).to.equal("SOMIAGOV Token");
      expect(await governanceToken.symbol()).to.equal("SGOV");
      expect(await reputationNFT.name()).to.equal("SOMIAGOV Reputation NFT");
      expect(await reputationNFT.symbol()).to.equal("SGREP");
    });
  });

  describe("Token Staking", function () {
    it("Should allow users to stake tokens", async function () {
      const stakeAmount = ethers.parseEther("1000");
      
      // Transfer tokens to user1
      await governanceToken.transfer(user1.address, stakeAmount);
      
      // User1 approves and stakes
      await governanceToken.connect(user1).approve(await governanceToken.getAddress(), stakeAmount);
      await governanceToken.connect(user1).stake(stakeAmount);
      
      expect(await governanceToken.stakedBalances(user1.address)).to.equal(stakeAmount);
    });
  });

  describe("Governance", function () {
    it("Should track proposal count", async function () {
      expect(await governance.proposalCount()).to.equal(0);
    });

    it("Should have correct initial rank multipliers", async function () {
      expect(await governance.rankMultipliers(0)).to.equal(100); // Newcomer
      expect(await governance.rankMultipliers(4)).to.equal(300); // Elder
    });
  });

  describe("Reputation NFT", function () {
    it("Should start with no tokens", async function () {
      expect(await reputationNFT.totalSupply()).to.equal(0);
    });
  });
});
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GovernanceToken is ERC20, Ownable, ReentrancyGuard {
    
    struct StakeInfo {
        uint256 amount;
        uint256 lockEndTime;
        uint256 multiplier;
        uint256 rewards;
        uint256 stakingTimestamp;
    }
    
    mapping(address => StakeInfo) public stakes;
    mapping(address => bool) public rewardEligible;
    mapping(address => uint256) public votingStreaks;
    mapping(address => uint256) public totalVotes;
    mapping(address => uint256) public totalProposals;
    mapping(address => uint256) public lastActivityTime;
    
    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256) public totalClaimedRewards;
    
    uint256 public totalStaked;
    uint256 public constant INITIAL_SUPPLY = 1000000000 * 10**18;
    uint256 public constant MAX_SUPPLY = 10000000000 * 10**18;
    
    uint256 public constant FAUCET_AMOUNT = 10000 * 10**18;
    uint256 public constant FAUCET_COOLDOWN = 1 hours;
    mapping(address => uint256) public lastFaucetRequest;
    
    address public governanceContract;
    
    event TokensStaked(address indexed user, uint256 amount, uint256 lockDuration);
    event TokensUnstaked(address indexed user, uint256 amount);
    event RewardsDistributed(address indexed user, uint256 amount);
    event VotingActivity(address indexed user, uint256 proposalId);
    event ProposalActivity(address indexed user, uint256 proposalId);
    event FaucetUsed(address indexed user, uint256 amount);
    
    modifier onlyGovernance() {
        require(msg.sender == governanceContract, "Only governance can call");
        _;
    }
    
    constructor() ERC20("SOMIAGOV Token", "SGOV") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    function setGovernanceContract(address _governance) external onlyOwner {
        governanceContract = _governance;
    }
    
    function stakeWithLock(uint256 amount, uint256 lockDuration) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(lockDuration >= 30 days, "Minimum lock period is 30 days");
        require(lockDuration <= 365 days, "Maximum lock period is 365 days");
        
        StakeInfo storage stake = stakes[msg.sender];
        stake.amount = stake.amount + amount;
        stake.lockEndTime = block.timestamp + lockDuration;
        stake.multiplier = _calculateStakeMultiplier(lockDuration);
        stake.stakingTimestamp = block.timestamp;
        
        totalStaked = totalStaked + amount;
        rewardEligible[msg.sender] = true;
        lastActivityTime[msg.sender] = block.timestamp;
        
        _transfer(msg.sender, address(this), amount);
        emit TokensStaked(msg.sender, amount, lockDuration);
    }
    
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot unstake 0");
        StakeInfo storage stake = stakes[msg.sender];
        require(stake.amount >= amount, "Insufficient staked balance");
        
        uint256 penalty = _calculateUnstakePenalty(msg.sender, amount);
        uint256 amountAfterPenalty = amount - penalty;
        
        stake.amount = stake.amount - amount;
        totalStaked = totalStaked - amount;
        lastActivityTime[msg.sender] = block.timestamp;
        
        _transfer(address(this), msg.sender, amountAfterPenalty);
        
        if (penalty > 0) {
            _burn(address(this), penalty);
        }
        
        emit TokensUnstaked(msg.sender, amountAfterPenalty);
    }
    
    function recordVote(address voter, uint256 proposalId) external onlyGovernance {
        totalVotes[voter] = totalVotes[voter] + 1;
        votingStreaks[voter] = votingStreaks[voter] + 1;
        lastActivityTime[voter] = block.timestamp;
        
        pendingRewards[voter] = pendingRewards[voter] + 1 * 10**18;
        
        emit VotingActivity(voter, proposalId);
    }
    
    function recordProposal(address proposer, uint256 proposalId) external onlyGovernance {
        totalProposals[proposer] = totalProposals[proposer] + 1;
        lastActivityTime[proposer] = block.timestamp;
        
        pendingRewards[proposer] = pendingRewards[proposer] + 10 * 10**18;
        
        emit ProposalActivity(proposer, proposalId);
    }
    
    function claimRewards() external nonReentrant {
        uint256 reward = pendingRewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        
        pendingRewards[msg.sender] = 0;
        totalClaimedRewards[msg.sender] = totalClaimedRewards[msg.sender] + reward;
        
        _mint(msg.sender, reward);
        
        emit RewardsDistributed(msg.sender, reward);
    }
    
    function _calculateStakeMultiplier(uint256 lockDuration) internal pure returns (uint256) {
        if (lockDuration >= 365 days) return 300;
        if (lockDuration >= 180 days) return 250;
        if (lockDuration >= 90 days) return 200;
        return 150;
    }
    
    function _calculateUnstakePenalty(address user, uint256 amount) internal view returns (uint256) {
        StakeInfo storage stake = stakes[user];
        
        if (block.timestamp >= stake.lockEndTime) {
            return 0;
        }
        
        return amount * 10 / 100;
    }
    
    function getStakedAmount(address user) external view returns (uint256) {
        return stakes[user].amount;
    }
    
    function getUserStats(address user) external view returns (
        uint256 stakedAmount,
        uint256 totalUserVotes,
        uint256 totalUserProposals,
        uint256 votingStreak,
        uint256 pendingUserRewards
    ) {
        return (
            stakes[user].amount,
            totalVotes[user],
            totalProposals[user], 
            votingStreaks[user],
            pendingRewards[user]
        );
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = balanceOf(address(this));
        _transfer(address(this), owner(), balance);
    }
    
    function faucet() external {
        require(totalSupply() + FAUCET_AMOUNT <= MAX_SUPPLY, "Would exceed max supply");
        require(
            lastFaucetRequest[msg.sender] == 0 || 
            block.timestamp >= lastFaucetRequest[msg.sender] + FAUCET_COOLDOWN,
            "Faucet cooldown active. Wait 1 hour between requests"
        );
        
        lastFaucetRequest[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetUsed(msg.sender, FAUCET_AMOUNT);
    }
    
    function canUseFaucet(address user) external view returns (bool, uint256) {
        if (totalSupply() + FAUCET_AMOUNT > MAX_SUPPLY) {
            return (false, 0);
        }
        
        if (lastFaucetRequest[user] == 0) {
            return (true, 0);
        }
        
        uint256 nextAvailable = lastFaucetRequest[user] + FAUCET_COOLDOWN;
        if (block.timestamp >= nextAvailable) {
            return (true, 0);
        }
        
        return (false, nextAvailable - block.timestamp);
    }
    
    function mint(address to, uint256 amount) external onlyGovernance {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external onlyGovernance {
        _burn(from, amount);
    }
}
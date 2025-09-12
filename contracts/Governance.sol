// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./GovernanceToken.sol";

// Interface for the reputation NFT contract
interface IReputationNFT {
    enum UserRank { Newcomer, Contributor, Delegate, Council, Elder }
    enum BadgeType { Participation, VotingStreak, ProposalCreator, Staking, Delegation, Execution, Seasonal, Achievement }
    
    function mintBadge(
        address to,
        UserRank rank,
        BadgeType badgeType,
        uint256 level,
        string memory metadata
    ) external returns (uint256);
    
    function updateRank(address user, UserRank newRank) external;
}

contract Governance is Ownable, ReentrancyGuard {
    
    enum ProposalStatus { Pending, Active, Passed, Failed, Executed, Canceled }
    enum VoteOption { Against, For, Abstain }
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        string[] options;
        bytes executionData;
        uint256 startTime;
        uint256 endTime;
        uint256 executionDelay;
        uint256 totalVotes;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        ProposalStatus status;
        bool requiresMultiSig;
        mapping(address => Vote) votes;
        mapping(address => bool) hasVoted;
    }
    
    struct Vote {
        VoteOption option;
        uint256 weight;
        uint256 timestamp;
    }
    
    uint256 public proposalCount;
    GovernanceToken public governanceToken;
    IReputationNFT public reputationNFT;
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256[]) public userProposals;
    
    mapping(uint256 => string[]) public proposalComments;
    mapping(uint256 => address[]) public proposalCommentAuthors;
    
    mapping(address => uint256) public userReputationScore;
    mapping(address => uint256) public userTotalVotes;
    mapping(address => uint256) public userTotalProposals;
    
    uint256 public constant MIN_STAKE_AMOUNT = 1000 * 10**18;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant MIN_QUORUM = 100 * 10**18;
    
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter, VoteOption option, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event CommentAdded(uint256 indexed proposalId, address indexed author, string ipfsHash);
    
    modifier onlyStaked() {
        require(getStakedAmount(msg.sender) >= MIN_STAKE_AMOUNT, "Must stake tokens to participate");
        _;
    }
    
    constructor(address _governanceToken, address _reputationNFT) {
        governanceToken = GovernanceToken(_governanceToken);
        reputationNFT = IReputationNFT(_reputationNFT);
    }
    
    function setReputationNFT(address _reputationNFT) external onlyOwner {
        reputationNFT = IReputationNFT(_reputationNFT);
    }
    
    function getStakedAmount(address user) public view returns (uint256) {
        return governanceToken.getStakedAmount(user);
    }
    
    function createProposal(
        string memory title,
        string memory description,
        string[] memory options,
        bytes memory executionData,
        uint256 executionDelay,
        bool requiresMultiSig
    ) external onlyStaked nonReentrant returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(options.length > 0, "Must provide voting options");
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.proposer = msg.sender;
        newProposal.title = title;
        newProposal.description = description;
        newProposal.options = options;
        newProposal.executionData = executionData;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + VOTING_PERIOD;
        newProposal.executionDelay = executionDelay;
        newProposal.status = ProposalStatus.Active;
        newProposal.requiresMultiSig = requiresMultiSig;
        
        userProposals[msg.sender].push(proposalId);
        
        userTotalProposals[msg.sender] += 1;
        userReputationScore[msg.sender] += 50;
        
        // Update user rank automatically
        _updateUserRank(msg.sender);
        
        if (address(reputationNFT) != address(0)) {
            IReputationNFT.UserRank userRank = _getUserRankEnum(msg.sender);
            reputationNFT.mintBadge(
                msg.sender,
                userRank,
                IReputationNFT.BadgeType.ProposalCreator,
                1,
                string(abi.encodePacked("Proposal Creator: ", title))
            );
        }
        
        emit ProposalCreated(proposalId, msg.sender, title);
        
        return proposalId;
    }
    
    function vote(uint256 proposalId, VoteOption option) external onlyStaked nonReentrant {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp >= proposal.startTime && block.timestamp <= proposal.endTime, "Voting not open");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 votingWeight = getStakedAmount(msg.sender);
        require(votingWeight > 0, "Must have staked tokens to vote");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = Vote({
            option: option,
            weight: votingWeight,
            timestamp: block.timestamp
        });
        
        proposal.totalVotes += votingWeight;
        
        if (option == VoteOption.For) {
            proposal.forVotes += votingWeight;
        } else if (option == VoteOption.Against) {
            proposal.againstVotes += votingWeight;
        } else {
            proposal.abstainVotes += votingWeight;
        }
        
        userTotalVotes[msg.sender] += 1;
        userReputationScore[msg.sender] += 10;
        
        // Update user rank automatically
        _updateUserRank(msg.sender);
        
        if (address(reputationNFT) != address(0)) {
            uint256 totalVotes = userTotalVotes[msg.sender];
            IReputationNFT.UserRank userRank = _getUserRankEnum(msg.sender);
            
            if (totalVotes == 1) {
                reputationNFT.mintBadge(
                    msg.sender,
                    userRank,
                    IReputationNFT.BadgeType.Participation,
                    1,
                    "First Vote - Welcome to Governance!"
                );
            }
            else if (totalVotes % 5 == 0) {
                reputationNFT.mintBadge(
                    msg.sender,
                    userRank,
                    IReputationNFT.BadgeType.VotingStreak,
                    totalVotes / 5,
                    string(abi.encodePacked("Voting Milestone: ", _toString(totalVotes), " Votes"))
                );
            }
        }
        
        emit VoteCast(proposalId, msg.sender, option, votingWeight);
        
        if (block.timestamp > proposal.endTime) {
            _updateProposalStatus(proposalId);
        }
    }
    
    function _updateProposalStatus(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.status != ProposalStatus.Active) return;
        
        bool quorumReached = proposal.totalVotes >= MIN_QUORUM;
        bool majorityReached = proposal.forVotes > proposal.againstVotes;
        
        if (quorumReached && majorityReached) {
            proposal.status = ProposalStatus.Passed;
        } else {
            proposal.status = ProposalStatus.Failed;
        }
    }
    
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        bool executed,
        bool canceled
    ) {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        
        return (
            proposal.id,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.status == ProposalStatus.Executed,
            proposal.status == ProposalStatus.Canceled
        );
    }
    
    function getProposalOptions(uint256 proposalId) external view returns (string[] memory) {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal ID");
        return proposals[proposalId].options;
    }
    
    function getUserVote(uint256 proposalId, address user) external view returns (bool hasVoted, VoteOption option, uint256 weight) {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        hasVoted = proposal.hasVoted[user];
        
        if (hasVoted) {
            Vote storage userVote = proposal.votes[user];
            option = userVote.option;
            weight = userVote.weight;
        }
    }
    
    function getUserProposals(address user) external view returns (uint256[] memory) {
        return userProposals[user];
    }
    
    function getUserStats(address user) external view returns (
        uint256 stakedAmount,
        uint256 totalVotes,
        uint256 totalProposals,
        uint256 reputationScore,
        uint256 lastActivity
    ) {
        stakedAmount = getStakedAmount(user);
        totalVotes = userTotalVotes[user];
        totalProposals = userTotalProposals[user];
        reputationScore = userReputationScore[user];
        lastActivity = block.timestamp;
    }
    
    function getUserRank(address user) external view returns (string memory rank, uint256 rankIndex) {
        uint256 reputation = userReputationScore[user];
        
        if (reputation >= 5000) {
            return ("Elder", 4);
        } else if (reputation >= 1500) {
            return ("Council", 3);
        } else if (reputation >= 500) {
            return ("Delegate", 2);
        } else if (reputation >= 100) {
            return ("Contributor", 1);
        } else {
            return ("Newcomer", 0);
        }
    }
    
    function _getUserRankIndex(address user) internal view returns (uint256) {
        uint256 reputation = userReputationScore[user];
        
        if (reputation >= 5000) {
            return 4;
        } else if (reputation >= 1500) {
            return 3;
        } else if (reputation >= 500) {
            return 2;
        } else if (reputation >= 100) {
            return 1;
        } else {
            return 0;
        }
    }
    
    function _getUserRankEnum(address user) internal view returns (IReputationNFT.UserRank) {
        uint256 reputation = userReputationScore[user];
        
        if (reputation >= 5000) {
            return IReputationNFT.UserRank.Elder;
        } else if (reputation >= 1500) {
            return IReputationNFT.UserRank.Council;
        } else if (reputation >= 500) {
            return IReputationNFT.UserRank.Delegate;
        } else if (reputation >= 100) {
            return IReputationNFT.UserRank.Contributor;
        } else {
            return IReputationNFT.UserRank.Newcomer;
        }
    }
    
    function _updateUserRank(address user) internal {
        if (address(reputationNFT) != address(0)) {
            IReputationNFT.UserRank newRank = _getUserRankEnum(user);
            reputationNFT.updateRank(user, newRank);
        }
    }
    
    // Public function to update user rank manually (for existing users)
    function updateUserRank(address user) external {
        _updateUserRank(user);
    }
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    function addComment(uint256 proposalId, string memory ipfsHash) external onlyStaked {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal ID");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        proposalComments[proposalId].push(ipfsHash);
        proposalCommentAuthors[proposalId].push(msg.sender);
        
        userReputationScore[msg.sender] += 5;
        
        // Update user rank automatically
        _updateUserRank(msg.sender);
        
        emit CommentAdded(proposalId, msg.sender, ipfsHash);
    }
    
    function getProposalComments(uint256 proposalId) external view returns (string[] memory hashes, address[] memory authors) {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal ID");
        return (proposalComments[proposalId], proposalCommentAuthors[proposalId]);
    }
    
    function getProposalCommentCount(uint256 proposalId) external view returns (uint256) {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal ID");
        return proposalComments[proposalId].length;
    }

    function updateProposalStatus(uint256 proposalId) external {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal ID");
        _updateProposalStatus(proposalId);
    }
}
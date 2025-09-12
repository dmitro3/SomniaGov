// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract ReputationNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    enum UserRank { Newcomer, Contributor, Delegate, Council, Elder }
    enum BadgeType { Participation, VotingStreak, ProposalCreator, Staking, Delegation, Execution, Seasonal, Achievement }
    
    struct Badge {
        uint256 id;
        address owner;
        UserRank rank;
        BadgeType badgeType;
        uint256 level;
        uint256 experience;
        uint256 timestamp;
        string metadata;
    }
    
    Counters.Counter private _tokenIds;
    
    mapping(uint256 => Badge) public badges;
    mapping(address => uint256[]) public userBadges;
    mapping(address => UserRank) public userRanks;
    address public governanceContract;
    
    modifier onlyGovernance() {
        require(msg.sender == governanceContract, "Only governance can call");
        _;
    }
    
    constructor() ERC721("SOMIAGOV Reputation", "SGOVNFT") {}
    
    function setGovernanceContract(address _governance) external onlyOwner {
        governanceContract = _governance;
    }
    
    function mintBadge(
        address to,
        UserRank rank,
        BadgeType badgeType,
        uint256 level,
        string memory metadata
    ) external onlyGovernance returns (uint256) {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        
        badges[tokenId] = Badge({
            id: tokenId,
            owner: to,
            rank: rank,
            badgeType: badgeType,
            level: level,
            experience: 0,
            timestamp: block.timestamp,
            metadata: metadata
        });
        
        userBadges[to].push(tokenId);
        _mint(to, tokenId);
        
        return tokenId;
    }
    
    function getUserBadges(address user) external view returns (uint256[] memory) {
        return userBadges[user];
    }
    
    function updateRank(address user, UserRank newRank) external onlyGovernance {
        userRanks[user] = newRank;
    }
    
    mapping(uint8 => string) public badgeImages;
    
    function setBadgeImage(uint8 badgeType, string memory ipfsHash) external onlyOwner {
        badgeImages[badgeType] = ipfsHash;
    }
    
    function getBadgeImage(uint8 badgeType) external view returns (string memory) {
        return badgeImages[badgeType];
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        Badge memory badge = badges[tokenId];
        string memory imageHash = badgeImages[uint8(badge.badgeType)];
        
        if (bytes(imageHash).length == 0) {
            imageHash = "QmDefaultBadgeHash";
        }
        
        // Create proper JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name": "', badge.metadata, '",',
            '"description": "SOMIAGOV Reputation Badge - ', _getBadgeTypeName(badge.badgeType), '",',
            '"image": "ipfs://', imageHash, '",',
            '"attributes": [',
                '{"trait_type": "Rank", "value": "', _getRankName(badge.rank), '"},',
                '{"trait_type": "Badge Type", "value": "', _getBadgeTypeName(badge.badgeType), '"},',
                '{"trait_type": "Level", "value": ', _toString(badge.level), '},',
                '{"trait_type": "Experience", "value": ', _toString(badge.experience), '},',
                '{"trait_type": "Timestamp", "value": ', _toString(badge.timestamp), '}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }
    
    function _getRankName(UserRank rank) internal pure returns (string memory) {
        if (rank == UserRank.Newcomer) return "Newcomer";
        if (rank == UserRank.Contributor) return "Contributor";
        if (rank == UserRank.Delegate) return "Delegate";
        if (rank == UserRank.Council) return "Council";
        if (rank == UserRank.Elder) return "Elder";
        return "Unknown";
    }
    
    function _getBadgeTypeName(BadgeType badgeType) internal pure returns (string memory) {
        if (badgeType == BadgeType.Participation) return "Participation";
        if (badgeType == BadgeType.VotingStreak) return "Voting Streak";
        if (badgeType == BadgeType.ProposalCreator) return "Proposal Creator";
        if (badgeType == BadgeType.Staking) return "Staking";
        if (badgeType == BadgeType.Delegation) return "Delegation";
        if (badgeType == BadgeType.Execution) return "Execution";
        if (badgeType == BadgeType.Seasonal) return "Seasonal";
        if (badgeType == BadgeType.Achievement) return "Achievement";
        return "Unknown";
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
}
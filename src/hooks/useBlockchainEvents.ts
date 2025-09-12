

import { useEffect, useState } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { parseAbiItem } from 'viem';
import toast from 'react-hot-toast';
import { getContractAddresses, contractABIs, areContractsDeployed } from '../config/contracts';
import { useNetwork } from 'wagmi';

interface ProposalEvent {
  type: 'ProposalCreated' | 'VoteCast' | 'ProposalExecuted' | 'ProposalCanceled';
  proposalId: string;
  user: string;
  blockNumber: bigint;
  transactionHash: string;
  timestamp: number;
  data?: any;
}

interface ReputationEvent {
  type: 'BadgeEarned' | 'RankUpgraded' | 'NFTComposed';
  user: string;
  badgeId?: string;
  newRank?: string;
  blockNumber: bigint;
  transactionHash: string;
  timestamp: number;
}

export function useBlockchainEvents() {
  const [proposalEvents, setProposalEvents] = useState<ProposalEvent[]>([]);
  const [reputationEvents, setReputationEvents] = useState<ReputationEvent[]>([]);
  const [isListening, setIsListening] = useState(false);

  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { chain } = useNetwork();
  
  const chainId = chain?.id || 50312;
  const contracts = getContractAddresses(chainId);
  const contractsDeployed = areContractsDeployed(chainId);

  useEffect(() => {
    if (!publicClient || !contractsDeployed || !contracts.governance) {
      return;
    }

    setIsListening(true);

    // Governance Events
    const proposalCreatedEvent = parseAbiItem('event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, string description, uint256 startTime, uint256 endTime)');
    const voteCastEvent = parseAbiItem('event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 option, uint256 votes, uint256 conviction)');
    const proposalExecutedEvent = parseAbiItem('event ProposalExecuted(uint256 indexed proposalId, address indexed executor)');
    const proposalCanceledEvent = parseAbiItem('event ProposalCanceled(uint256 indexed proposalId, address indexed canceler)');

    // Reputation Events
    const badgeEarnedEvent = parseAbiItem('event BadgeEarned(address indexed user, uint256 indexed badgeId, uint8 badgeType, string name)');
    const rankUpgradedEvent = parseAbiItem('event RankUpgraded(address indexed user, uint8 oldRank, uint8 newRank, string newRankName)');
    const nftComposedEvent = parseAbiItem('event NFTComposed(address indexed user, uint256[] componentIds, uint256 newTokenId, string name)');

    // Watch for proposal events
    const unwatchProposalCreated = publicClient.watchEvent({
      address: contracts.governance as `0x${string}`,
      event: proposalCreatedEvent,
      onLogs: (logs) => {
        logs.forEach((log) => {
          const event: ProposalEvent = {
            type: 'ProposalCreated',
            proposalId: log.args.proposalId?.toString() || '0',
            user: log.args.proposer || '0x',
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            timestamp: Date.now(),
            data: {
              title: log.args.title,
              description: log.args.description,
              startTime: log.args.startTime,
              endTime: log.args.endTime,
            }
          };

          setProposalEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events

          // Show notification for new proposals
          toast.success(`New proposal created: ${log.args.title}`, {
            duration: 5000,
            icon: '📋'
          });
        });
      },
      pollingInterval: 2000,
    });

    const unwatchVoteCast = publicClient.watchEvent({
      address: contracts.governance as `0x${string}`,
      event: voteCastEvent,
      onLogs: (logs) => {
        logs.forEach((log) => {
          const event: ProposalEvent = {
            type: 'VoteCast',
            proposalId: log.args.proposalId?.toString() || '0',
            user: log.args.voter || '0x',
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            timestamp: Date.now(),
            data: {
              option: log.args.option,
              votes: log.args.votes?.toString(),
              conviction: log.args.conviction?.toString(),
            }
          };

          setProposalEvents(prev => [event, ...prev.slice(0, 49)]);

          // Show notification only for user's own votes or important votes
          if (log.args.voter?.toLowerCase() === address?.toLowerCase()) {
            const optionText = log.args.option === 0 ? 'Against' : log.args.option === 1 ? 'For' : 'Abstain';
            toast.success(`Your ${optionText} vote was recorded`, {
              duration: 4000,
              icon: '✅'
            });
          }
        });
      },
      pollingInterval: 2000,
    });

    const unwatchProposalExecuted = publicClient.watchEvent({
      address: contracts.governance as `0x${string}`,
      event: proposalExecutedEvent,
      onLogs: (logs) => {
        logs.forEach((log) => {
          const event: ProposalEvent = {
            type: 'ProposalExecuted',
            proposalId: log.args.proposalId?.toString() || '0',
            user: log.args.executor || '0x',
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            timestamp: Date.now(),
          };

          setProposalEvents(prev => [event, ...prev.slice(0, 49)]);

          toast.success(`Proposal #${log.args.proposalId} has been executed!`, {
            duration: 6000,
            icon: '⚡'
          });
        });
      },
      pollingInterval: 2000,
    });

    // Watch for reputation events if reputation contract is deployed
    let unwatchBadgeEarned: (() => void) | undefined;
    let unwatchRankUpgraded: (() => void) | undefined;
    let unwatchNFTComposed: (() => void) | undefined;

    if (contracts.reputation) {
      unwatchBadgeEarned = publicClient.watchEvent({
        address: contracts.reputation as `0x${string}`,
        event: badgeEarnedEvent,
        onLogs: (logs) => {
          logs.forEach((log) => {
            const event: ReputationEvent = {
              type: 'BadgeEarned',
              user: log.args.user || '0x',
              badgeId: log.args.badgeId?.toString(),
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              timestamp: Date.now(),
            };

            setReputationEvents(prev => [event, ...prev.slice(0, 49)]);

            // Show notification for user's own badges
            if (log.args.user?.toLowerCase() === address?.toLowerCase()) {
              toast.success(`🏆 Badge earned: ${log.args.name}`, {
                duration: 5000,
              });
            }
          });
        },
        pollingInterval: 2000,
      });

      unwatchRankUpgraded = publicClient.watchEvent({
        address: contracts.reputation as `0x${string}`,
        event: rankUpgradedEvent,
        onLogs: (logs) => {
          logs.forEach((log) => {
            const event: ReputationEvent = {
              type: 'RankUpgraded',
              user: log.args.user || '0x',
              newRank: log.args.newRankName,
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              timestamp: Date.now(),
            };

            setReputationEvents(prev => [event, ...prev.slice(0, 49)]);

            // Show notification for user's own rank upgrades
            if (log.args.user?.toLowerCase() === address?.toLowerCase()) {
              toast.success(`🎉 Rank upgraded to ${log.args.newRankName}!`, {
                duration: 6000,
              });
            }
          });
        },
        pollingInterval: 2000,
      });

      unwatchNFTComposed = publicClient.watchEvent({
        address: contracts.reputation as `0x${string}`,
        event: nftComposedEvent,
        onLogs: (logs) => {
          logs.forEach((log) => {
            const event: ReputationEvent = {
              type: 'NFTComposed',
              user: log.args.user || '0x',
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              timestamp: Date.now(),
            };

            setReputationEvents(prev => [event, ...prev.slice(0, 49)]);

            // Show notification for user's own compositions
            if (log.args.user?.toLowerCase() === address?.toLowerCase()) {
              toast.success(`✨ NFT composed: ${log.args.name}`, {
                duration: 5000,
              });
            }
          });
        },
        pollingInterval: 2000,
      });
    }

    // Cleanup function
    return () => {
      setIsListening(false);
      unwatchProposalCreated?.();
      unwatchVoteCast?.();
      unwatchProposalExecuted?.();
      unwatchBadgeEarned?.();
      unwatchRankUpgraded?.();
      unwatchNFTComposed?.();
    };
  }, [publicClient, contractsDeployed, contracts.governance, contracts.reputation, address]);

  return {
    proposalEvents,
    reputationEvents,
    isListening,
    clearEvents: () => {
      setProposalEvents([]);
      setReputationEvents([]);
    }
  };
}

// Hook for watching specific proposal events
export function useProposalEvents(proposalId?: number) {
  const [events, setEvents] = useState<ProposalEvent[]>([]);
  const publicClient = usePublicClient();
  const { chain } = useNetwork();
  
  const chainId = chain?.id || 50312;
  const contracts = getContractAddresses(chainId);
  const contractsDeployed = areContractsDeployed(chainId);

  useEffect(() => {
    if (!publicClient || !contractsDeployed || !contracts.governance || !proposalId) {
      return;
    }

    const voteCastEvent = parseAbiItem('event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 option, uint256 votes, uint256 conviction)');
    
    const unwatch = publicClient.watchEvent({
      address: contracts.governance as `0x${string}`,
      event: voteCastEvent,
      args: {
        proposalId: BigInt(proposalId)
      },
      onLogs: (logs) => {
        logs.forEach((log) => {
          const event: ProposalEvent = {
            type: 'VoteCast',
            proposalId: log.args.proposalId?.toString() || '0',
            user: log.args.voter || '0x',
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            timestamp: Date.now(),
            data: {
              option: log.args.option,
              votes: log.args.votes?.toString(),
              conviction: log.args.conviction?.toString(),
            }
          };

          setEvents(prev => [event, ...prev]);
        });
      },
      pollingInterval: 2000,
    });

    return () => unwatch();
  }, [publicClient, contractsDeployed, contracts.governance, proposalId]);

  return { events };
}

// Hook for user-specific events
export function useUserEvents(userAddress?: string) {
  const [userProposalEvents, setUserProposalEvents] = useState<ProposalEvent[]>([]);
  const [userReputationEvents, setUserReputationEvents] = useState<ReputationEvent[]>([]);
  
  const publicClient = usePublicClient();
  const { chain } = useNetwork();
  const { address } = useAccount();
  
  const targetAddress = userAddress || address;
  const chainId = chain?.id || 50312;
  const contracts = getContractAddresses(chainId);
  const contractsDeployed = areContractsDeployed(chainId);

  useEffect(() => {
    if (!publicClient || !contractsDeployed || !targetAddress) {
      return;
    }

    // Watch for user's proposal and voting events
    const voteCastEvent = parseAbiItem('event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 option, uint256 votes, uint256 conviction)');
    const proposalCreatedEvent = parseAbiItem('event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, string description, uint256 startTime, uint256 endTime)');

    const unwatchVotes = publicClient.watchEvent({
      address: contracts.governance as `0x${string}`,
      event: voteCastEvent,
      args: {
        voter: targetAddress as `0x${string}`
      },
      onLogs: (logs) => {
        logs.forEach((log) => {
          const event: ProposalEvent = {
            type: 'VoteCast',
            proposalId: log.args.proposalId?.toString() || '0',
            user: log.args.voter || '0x',
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            timestamp: Date.now(),
            data: {
              option: log.args.option,
              votes: log.args.votes?.toString(),
              conviction: log.args.conviction?.toString(),
            }
          };

          setUserProposalEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100
        });
      },
      pollingInterval: 3000,
    });

    const unwatchProposals = publicClient.watchEvent({
      address: contracts.governance as `0x${string}`,
      event: proposalCreatedEvent,
      args: {
        proposer: targetAddress as `0x${string}`
      },
      onLogs: (logs) => {
        logs.forEach((log) => {
          const event: ProposalEvent = {
            type: 'ProposalCreated',
            proposalId: log.args.proposalId?.toString() || '0',
            user: log.args.proposer || '0x',
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            timestamp: Date.now(),
            data: {
              title: log.args.title,
              description: log.args.description,
              startTime: log.args.startTime,
              endTime: log.args.endTime,
            }
          };

          setUserProposalEvents(prev => [event, ...prev.slice(0, 99)]);
        });
      },
      pollingInterval: 3000,
    });

    // Watch for user's reputation events
    let unwatchBadges: (() => void) | undefined;
    let unwatchRanks: (() => void) | undefined;

    if (contracts.reputation) {
      const badgeEarnedEvent = parseAbiItem('event BadgeEarned(address indexed user, uint256 indexed badgeId, uint8 badgeType, string name)');
      const rankUpgradedEvent = parseAbiItem('event RankUpgraded(address indexed user, uint8 oldRank, uint8 newRank, string newRankName)');

      unwatchBadges = publicClient.watchEvent({
        address: contracts.reputation as `0x${string}`,
        event: badgeEarnedEvent,
        args: {
          user: targetAddress as `0x${string}`
        },
        onLogs: (logs) => {
          logs.forEach((log) => {
            const event: ReputationEvent = {
              type: 'BadgeEarned',
              user: log.args.user || '0x',
              badgeId: log.args.badgeId?.toString(),
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              timestamp: Date.now(),
            };

            setUserReputationEvents(prev => [event, ...prev.slice(0, 99)]);
          });
        },
        pollingInterval: 3000,
      });

      unwatchRanks = publicClient.watchEvent({
        address: contracts.reputation as `0x${string}`,
        event: rankUpgradedEvent,
        args: {
          user: targetAddress as `0x${string}`
        },
        onLogs: (logs) => {
          logs.forEach((log) => {
            const event: ReputationEvent = {
              type: 'RankUpgraded',
              user: log.args.user || '0x',
              newRank: log.args.newRankName,
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              timestamp: Date.now(),
            };

            setUserReputationEvents(prev => [event, ...prev.slice(0, 99)]);
          });
        },
        pollingInterval: 3000,
      });
    }

    return () => {
      unwatchVotes?.();
      unwatchProposals?.();
      unwatchBadges?.();
      unwatchRanks?.();
    };
  }, [publicClient, contractsDeployed, contracts.governance, contracts.reputation, targetAddress]);

  return {
    proposalEvents: userProposalEvents,
    reputationEvents: userReputationEvents,
  };
}
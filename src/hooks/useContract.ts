import { usePublicClient, useWalletClient } from 'wagmi';
import { useNetwork } from 'wagmi';
import { getContractAddresses, contractABIs } from '../config/contracts';

export function useContract() {
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const chainId = chain?.id || 50312;
  const contracts = getContractAddresses(chainId);

  const governanceContract = {
    addComment: async (proposalId: number, ipfsHash: string) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet not connected');
      }

      const { request } = await publicClient.simulateContract({
        account: walletClient.account,
        address: contracts.governance as `0x${string}`,
        abi: contractABIs.governance,
        functionName: 'addComment',
        args: [BigInt(proposalId), ipfsHash],
      });

      return await walletClient.writeContract(request);
    },

    getProposalComments: async (proposalId: number) => {
      if (!publicClient) {
        throw new Error('No public client available');
      }

      return await publicClient.readContract({
        address: contracts.governance as `0x${string}`,
        abi: contractABIs.governance,
        functionName: 'getProposalComments',
        args: [BigInt(proposalId)],
      });
    },

    getProposalCommentCount: async (proposalId: number) => {
      if (!publicClient) {
        throw new Error('No public client available');
      }

      return await publicClient.readContract({
        address: contracts.governance as `0x${string}`,
        abi: contractABIs.governance,
        functionName: 'getProposalCommentCount',
        args: [BigInt(proposalId)],
      });
    }
  };

  return {
    governanceContract,
    contracts,
    publicClient,
    walletClient
  };
}
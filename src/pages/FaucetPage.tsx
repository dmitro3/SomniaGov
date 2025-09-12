import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useBalance } from 'wagmi';
import { formatEther } from 'ethers';
import { Droplets, Clock, Coins, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getContractAddresses, contractABIs } from '../config/contracts';
import { sendTransactionWithAutoGas } from '../utils/gasEstimation';
import { somniaTestnet } from '../config/contracts';
import toast from 'react-hot-toast';

export default function FaucetPage() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const addresses = getContractAddresses(somniaTestnet.id);

  const { data: tokenBalance, refetch: refetchBalance } = useBalance({
    address: address,
    token: addresses.token,
  });

  const { data: faucetAvailability, refetch: refetchFaucet } = useContractRead({
    address: addresses.token,
    abi: contractABIs.token,
    functionName: 'canUseFaucet',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Read faucet constants
  const { data: faucetAmount } = useContractRead({
    address: addresses.token,
    abi: contractABIs.token,
    functionName: 'FAUCET_AMOUNT',
  });

  const { data: faucetCooldown } = useContractRead({
    address: addresses.token,
    abi: contractABIs.token,
    functionName: 'FAUCET_COOLDOWN',
  });

  // Prepare faucet transaction
  const { config: faucetConfig } = usePrepareContractWrite({
    address: addresses.token,
    abi: contractABIs.token,
    functionName: 'faucet',
    enabled: !!address && faucetAvailability && faucetAvailability[0],
    overrides: {
      gasLimit: 800000, // Increased gas limit for minting operation
    }
  });

  const { write: useFaucet } = useContractWrite({
    ...faucetConfig,
    onSuccess(data) {
      toast.success('🎉 Faucet tokens received!');
      setLoading(false);
      refetchBalance();
      refetchFaucet();
    },
    onError(error) {
      console.error('❌ Faucet error:', error);
      let errorMessage = 'Unknown error occurred';
      
      if (error.message.includes('OUT_OF_GAS')) {
        errorMessage = 'Transaction ran out of gas. Please try again.';
      } else if (error.message.includes('Faucet cooldown active')) {
        errorMessage = 'Faucet is on cooldown. Please wait before requesting again.';
      } else if (error.message.includes('exceed max supply')) {
        errorMessage = 'Faucet has reached maximum supply limit.';
      } else if (error.message.includes('User rejected')) {
        errorMessage = 'Transaction was rejected by user.';
      } else {
        errorMessage = error.message;
      }
      
      toast.error('❌ Faucet failed: ' + errorMessage);
      setLoading(false);
    },
  });

  const handleFaucet = async () => {
    console.log('🚰 Using faucet...');
    setLoading(true);
    
    try {
      // Try wagmi first (better for Rabby wallet)
      if (useFaucet) {
        useFaucet();
        return;
      }
      
      if (!window.ethereum || !address) {
        throw new Error('Wallet not connected');
      }

      const ethers = await import('ethers');
      const contractInterface = new ethers.Interface(contractABIs.token);
      const data = contractInterface.encodeFunctionData('faucet', []);
      
      const txParams = {
        to: addresses.token,
        data: data,
        from: address
      };
      
      const txHash = await sendTransactionWithAutoGas(txParams);
      
      toast.loading('Getting faucet tokens... Please wait for confirmation', { 
        id: txHash,
        duration: 0
      });
      
    } catch (error: any) {
      console.error('Faucet error:', error);
      toast.error('Faucet failed: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  useEffect(() => {
    if (faucetAvailability && !faucetAvailability[0] && faucetAvailability[1] > 0) {
      setCooldownRemaining(Number(faucetAvailability[1]));
      
      const timer = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            refetchFaucet(); // Refresh availability when cooldown ends
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [faucetAvailability, refetchFaucet]);

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('=== FAUCET DEBUG ===');
    console.log('Address:', address);
    console.log('Contract address:', addresses.token);
    console.log('Faucet availability:', faucetAvailability);
    console.log('Faucet amount:', faucetAmount);
    console.log('Faucet cooldown:', faucetCooldown);
    console.log('Can use:', faucetAvailability ? faucetAvailability[0] : 'undefined');
    console.log('Cooldown remaining:', faucetAvailability ? faucetAvailability[1] : 'undefined');
  }, [address, addresses.token, faucetAvailability, faucetAmount, faucetCooldown]);
  
  const canUse = faucetAvailability ? faucetAvailability[0] : false;
  const faucetAmountFormatted = faucetAmount ? formatEther(faucetAmount) : '10,000';
  const cooldownHours = faucetCooldown ? Number(faucetCooldown) / 3600 : 1;

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <Droplets className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">SGOV Token Faucet</h1>
          <p className="text-gray-400 mb-6">Get free SGOV tokens for governance participation</p>
          <p className="text-gray-500">Please connect your wallet to use the faucet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">SGOV Token Faucet</h1>
        <p className="text-gray-400">Get free SGOV tokens for staking and governance participation</p>
      </div>

      {/* Current Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark p-6 rounded-xl mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins className="h-6 w-6 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Your SGOV Balance</p>
              <p className="text-2xl font-bold text-white">
                {tokenBalance ? formatEther(tokenBalance.value) : '0.00'} SGOV
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              refetchBalance();
              refetchFaucet();
            }}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded bg-gray-800/50 hover:bg-gray-700/50"
            title="Refresh balance"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      {/* Faucet Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-dark p-6 rounded-xl mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Droplets className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Faucet Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {faucetAmountFormatted}
            </div>
            <div className="text-sm text-gray-400">Tokens per request</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {cooldownHours}h
            </div>
            <div className="text-sm text-gray-400">Cooldown period</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              FREE
            </div>
            <div className="text-sm text-gray-400">No cost or fees</div>
          </div>
        </div>
      </motion.div>

      {/* Faucet Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-dark p-6 rounded-xl mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Faucet Status</h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            canUse 
              ? 'bg-green-900/30 text-green-400 border border-green-700/50' 
              : 'bg-orange-900/30 text-orange-400 border border-orange-700/50'
          }`}>
            {canUse ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            {canUse ? 'Available' : 'On Cooldown'}
          </div>
        </div>

        {!canUse && cooldownRemaining > 0 && (
          <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">Cooldown Active</span>
            </div>
            <p className="text-gray-300 text-sm mb-2">
              You can request more tokens in: <span className="font-mono text-orange-400">{formatTime(cooldownRemaining)}</span>
            </p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-400 h-2 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.max(0, 100 - (cooldownRemaining / (cooldownHours * 3600)) * 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleFaucet}
          disabled={loading || !canUse}
          className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
            canUse && !loading
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25'
              : 'bg-gray-700 cursor-not-allowed opacity-50'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Requesting Tokens...
            </div>
          ) : canUse ? (
            <div className="flex items-center justify-center gap-2">
              <Droplets className="h-5 w-5" />
              Get {faucetAmountFormatted} SGOV Tokens
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5" />
              Faucet on Cooldown
            </div>
          )}
        </button>
      </motion.div>

      {/* Usage Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-400">How to Use</h3>
        </div>
        
        <div className="space-y-3 text-gray-300 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mt-0.5">1</div>
            <div>
              <p className="font-medium text-white">Connect Your Wallet</p>
              <p>Make sure your wallet is connected to the Somnia Testnet</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mt-0.5">2</div>
            <div>
              <p className="font-medium text-white">Request Tokens</p>
              <p>Click the faucet button to receive {faucetAmountFormatted} SGOV tokens instantly</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mt-0.5">3</div>
            <div>
              <p className="font-medium text-white">Governance Participation</p>
              <p>Use your tokens for staking, voting on proposals, and governance participation</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold mt-0.5">!</div>
            <div>
              <p className="font-medium text-orange-400">Cooldown Period</p>
              <p>You can request tokens once every {cooldownHours} hour{cooldownHours !== 1 ? 's' : ''} to prevent spam</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
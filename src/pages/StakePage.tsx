import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'ethers';
import { Coins, Lock, TrendingUp, Calendar, Zap, AlertCircle, Wallet, Info, RefreshCw, Droplets } from 'lucide-react';
import { getContractAddresses, contractABIs } from '../config/contracts';
import { somniaTestnet } from '../config/contracts';
import toast from 'react-hot-toast';

export default function StakePage() {
  const { address, isConnected } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState('30');
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  
  const addresses = getContractAddresses(somniaTestnet.id);
  
  const { data: tokenBalance, refetch: refetchBalance } = useBalance({
    address: address,
    token: addresses.token,
  });
  
  const { data: stakeInfo, refetch: refetchStakeInfo } = useContractRead({
    address: addresses.token,
    abi: contractABIs.token,
    functionName: 'stakes',
    args: address ? [address] : undefined,
    enabled: !!address,
  });
  
  // Read user's token allowance for staking
  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: addresses.token,
    abi: contractABIs.token,
    functionName: 'allowance',
    args: address ? [address, addresses.token] : undefined,
    enabled: !!address,
  });
  
  // For AdvancedGovernanceToken, we don't need approval for self-staking
  // But we'll keep this as a fallback for some edge cases
  const { config: approveConfig } = usePrepareContractWrite({
    address: addresses.token,
    abi: contractABIs.token,
    functionName: 'approve',
    args: stakeAmount ? [addresses.token, parseEther(stakeAmount)] : undefined,
    enabled: false, // Disable approval for now since it's not needed for self-staking
  });
  
  const { write: approve } = useContractWrite({
    ...approveConfig,
    onSuccess(data) {
      toast.success('Tokens approved successfully!');
      setApproving(false);
      refetchAllowance();
    },
    onError(error) {
      toast.error('Approval failed: ' + error.message);
      console.error('Approve error:', error);
      setApproving(false);
    },
  });
  
  // Prepare stake transaction
  const { config: stakeConfig } = usePrepareContractWrite({
    address: addresses.token,
    abi: contractABIs.token,
    functionName: 'stakeWithLock',
    args: stakeAmount && lockPeriod ? [
      parseEther(stakeAmount),
      parseInt(lockPeriod) * 24 * 60 * 60 // Convert days to seconds
    ] : undefined,
    enabled: !!stakeAmount && !!lockPeriod && parseFloat(stakeAmount) > 0,
    overrides: {
      gasLimit: 1000000, // 1M gas - safe for staking operations
    }
  });
  
  const { write: stakeTokens } = useContractWrite({
    ...stakeConfig,
    onSuccess(data) {
      toast.success('Tokens staked successfully!');
      console.log('Stake success:', data);
      setLoading(false);
      setStakeAmount('');
      
      // Refetch data with a small delay to ensure blockchain is updated
      setTimeout(() => {
        console.log('🔄 Refreshing stake data after successful transaction...');
        refetchStakeInfo();
        refetchAllowance();
        refetchBalance();
      }, 2000);
    },
    onError(error) {
      toast.error('Staking failed: ' + error.message);
      console.error('Stake error:', error);
      setLoading(false);
    },
  });
  
  // Debug logging
  useEffect(() => {
    console.log('=== STAKE PAGE DEBUG ===');
    console.log('Chain ID:', somniaTestnet.id);
    console.log('Contract addresses:', addresses);
    console.log('Is connected:', isConnected);
    console.log('User address:', address);
    console.log('Token balance:', tokenBalance);
    console.log('Stake info:', stakeInfo);
    console.log('Allowance:', allowance);
    
    // Force refresh stake info every 10 seconds
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing stake data...');
      refetchStakeInfo();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [addresses, isConnected, address, tokenBalance, stakeInfo, allowance, refetchStakeInfo]);
  
  const handleApprove = async () => {
    if (!approve) {
      toast.error('Approve function not ready');
      return;
    }
    console.log('Starting approval...', { stakeAmount, addresses });
    setApproving(true);
    try {
      approve();
    } catch (error) {
      console.error('Approve call failed:', error);
      setApproving(false);
      toast.error('Failed to call approve');
    }
  };
  
  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid stake amount');
      return;
    }
    
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }
    
    console.log('Starting stake...', { stakeAmount, lockPeriod, addresses });
    setLoading(true);
    
    try {
      if (stakeTokens) {
        stakeTokens();
        return;
      }
      
      if (!window.ethereum) {
        throw new Error('No Ethereum provider found');
      }

      const ethers = await import('ethers');
      const { usePublicClient } = await import('wagmi');
      const publicClient = usePublicClient();
      
      const contractInterface = new ethers.Interface(contractABIs.token);
      const data = contractInterface.encodeFunctionData('stakeWithLock', [
        ethers.parseEther(stakeAmount),
        parseInt(lockPeriod) * 24 * 60 * 60 // Convert days to seconds
      ]);

      // Use a safe fixed gas limit for staking to avoid estimation issues
      const STAKING_GAS_LIMIT = 1000000; // 1M gas - safe for staking operations
      const gasHex = '0x' + STAKING_GAS_LIMIT.toString(16);
      
      console.log('Using fixed stake gas limit:', STAKING_GAS_LIMIT, '(hex:', gasHex, ')');

      // Force gas limit in multiple ways to override Rabby's estimation
      const txParams = {
        to: addresses.token,
        data: data,
        from: address,
        gas: gasHex,
        gasLimit: gasHex, // Some wallets use gasLimit instead of gas
      };
      
      console.log('Sending transaction with params:', txParams);
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      toast.loading('Staking tokens... Please wait for confirmation', { 
        id: txHash,
        duration: 0
      });
      
    } catch (error: any) {
      console.error('Stake error:', error);
      toast.error('Staking failed: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };
  
  // For AdvancedGovernanceToken stakeWithLock, we don't need approval for self-staking
  const needsApproval = false; // Disable approval requirement
  
  const getMultiplier = (days: string) => {
    switch (days) {
      case '30': return '1.0x';
      case '90': return '1.2x';
      case '180': return '1.5x';
      case '365': return '2.0x';
      default: return '1.0x';
    }
  };
  
  // Format stake info for display
  const currentStaked = stakeInfo ? formatEther((stakeInfo as any)[0] || '0') : '0.00';
  const lockEndTime = stakeInfo ? (stakeInfo as any)[1] : '0';
  const currentMultiplier = stakeInfo ? (stakeInfo as any)[2] : '0';
  
  // Debug stake info
  useEffect(() => {
    if (stakeInfo) {
      console.log('🥩 STAKE INFO DEBUG:', {
        raw: stakeInfo,
        amount: (stakeInfo as any)[0],
        lockEndTime: (stakeInfo as any)[1],
        multiplier: (stakeInfo as any)[2],
        formatted: currentStaked
      });
    }
  }, [stakeInfo, currentStaked]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <Coins className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Token Staking</h1>
          <p className="text-gray-400">Please connect your wallet to stake tokens.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Token Staking</h1>
        <p className="text-gray-400">Stake SGOV tokens to earn rewards and increase voting power</p>
      </div>

      {/* Staking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Coins className="h-8 w-8 text-green-400" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">
                {currentStaked} SGOV
                {stakeInfo === undefined && <span className="text-xs text-gray-500 ml-2">(Loading...)</span>}
                {stakeInfo === null && <span className="text-xs text-red-500 ml-2">(Error)</span>}
              </span>
              <span className="text-xs text-gray-400 mt-1">
                Contract: {addresses.token.slice(0,8)}...
              </span>
              {parseFloat(formatEther(tokenBalance?.value || 0)) < 1000 && (
                <Link 
                  to="/faucet"
                  className="text-xs text-blue-400 hover:text-blue-300 underline mt-1 inline-block"
                >
                  Need tokens? Use the faucet →
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Staked Balance</p>
              <p className="text-xs text-gray-500 mt-1">SGOV Tokens</p>
            </div>
            <button
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                refetchStakeInfo();
                refetchAllowance();
              }}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded bg-gray-800/50 hover:bg-gray-700/50"
              title="Refresh stake info"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-dark p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">12.5%</span>
          </div>
          <p className="text-sm text-gray-400">APY</p>
          <p className="text-xs text-gray-500 mt-1">Annual Percentage Yield</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-dark p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Zap className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{currentMultiplier !== '0' ? `${Number(currentMultiplier) / 100}x` : '1.0x'}</span>
          </div>
          <p className="text-sm text-gray-400">Voting Power</p>
          <p className="text-xs text-gray-500 mt-1">Current Multiplier</p>
        </motion.div>
      </div>

      {/* Token Balance Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-dark p-4 rounded-xl mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Available Balance:</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-white">
              {tokenBalance ? formatEther(tokenBalance.value) : '0.00'} SGOV
            </span>
            <p className="text-xs text-gray-500">~${tokenBalance ? (parseFloat(formatEther(tokenBalance.value)) * 0.1).toFixed(2) : '0.00'}</p>
          </div>
        </div>
      </motion.div>

      {/* Staking Requirements Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium text-yellow-400">Governance Requirements</span>
        </div>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Minimum 1,000 SGOV tokens required for proposal creation</li>
          <li>• Contributors rank (100+ reputation) needed for governance</li>
          <li>• Longer lock periods provide higher voting power multipliers</li>
          <li>• Staked tokens earn daily rewards</li>
        </ul>
      </motion.div>

      {/* Staking Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-dark p-6 rounded-xl mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Stake Tokens</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Amount to Stake</label>
            <div className="relative">
              <input
                type="number"
                className="form-input pr-16"
                placeholder="0.00"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">SGOV</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Lock Period</label>
            <select
              className="form-select"
              value={lockPeriod}
              onChange={(e) => setLockPeriod(e.target.value)}
            >
              <option value="30">30 days ({getMultiplier('30')} multiplier)</option>
              <option value="90">90 days ({getMultiplier('90')} multiplier)</option>
              <option value="180">180 days ({getMultiplier('180')} multiplier)</option>
              <option value="365">365 days ({getMultiplier('365')} multiplier)</option>
            </select>
          </div>

          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Staking Info</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Longer lock periods provide higher voting power multipliers</li>
              <li>• Rewards are distributed daily and can be claimed anytime</li>
              <li>• Tokens cannot be unstaked before lock period expires</li>
              <li>• Early unstaking incurs a 10% penalty fee</li>
            </ul>
          </div>

          {needsApproval ? (
            <button
              onClick={() => {
                console.log('🔵 APPROVE BUTTON CLICKED');
                console.log('Approve config:', approveConfig);
                console.log('Approve function:', !!approve);
                handleApprove();
              }}
              disabled={approving || !stakeAmount || !tokenBalance || parseEther(stakeAmount || '0') > tokenBalance.value}
              className="btn btn-primary w-full"
            >
              {approving ? 'Approving...' : 'Approve SGOV Tokens'}
            </button>
          ) : (
            <button
              onClick={() => {
                console.log('🟢 STAKE BUTTON CLICKED');
                console.log('Stake config:', stakeConfig);
                console.log('Stake function:', !!stakeTokens);
                handleStake();
              }}
              disabled={loading || !stakeAmount || !tokenBalance || parseEther(stakeAmount || '0') > tokenBalance.value || parseFloat(stakeAmount) <= 0}
              className="btn btn-primary w-full"
            >
              {loading ? 'Staking...' : 'Stake Tokens'}
            </button>
          )}
          
          {parseFloat(stakeAmount || '0') > 0 && tokenBalance && parseEther(stakeAmount || '0') > tokenBalance.value && (
            <p className="text-red-400 text-sm mt-2">Insufficient balance. You have {formatEther(tokenBalance.value)} SGOV tokens.</p>
          )}
          
          {parseFloat(stakeAmount || '0') > 0 && parseFloat(stakeAmount) < 1000 && (
            <p className="text-yellow-400 text-sm mt-2">Minimum 1,000 SGOV recommended for governance participation.</p>
          )}
        </div>
      </motion.div>

      {/* Lock End Time Display */}
      {lockEndTime > 0n && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-dark p-4 rounded-xl mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-gray-300">Lock End Time:</span>
            </div>
            <span className="text-sm text-white">
              {lockEndTime !== '0' ? new Date(Number(lockEndTime) * 1000).toLocaleDateString() : 'No lock'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Rewards Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-dark p-6 rounded-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Rewards</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-green-400 mb-1">0.00</div>
              <div className="text-sm text-gray-400">Pending Rewards</div>
            </div>
            <button className="btn btn-secondary w-full">Claim Rewards</button>
          </div>
          
          <div>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-white mb-1">0.00</div>
              <div className="text-sm text-gray-400">Total Claimed</div>
            </div>
            <div className="text-center text-sm text-gray-400">
              Lifetime earnings: 0.00 SGOV
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
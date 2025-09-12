

import { useState, useEffect } from 'react';
import { useWaitForTransaction, usePublicClient } from 'wagmi';
import { CheckCircle, XCircle, Clock, ExternalLink, AlertCircle } from 'lucide-react';

interface TransactionStatusProps {
  hash?: string;
  onSuccess?: (receipt: any) => void;
  onError?: (error: any) => void;
  showDetails?: boolean;
  className?: string;
}

export default function TransactionStatus({ 
  hash, 
  onSuccess, 
  onError, 
  showDetails = true, 
  className = '' 
}: TransactionStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const publicClient = usePublicClient();

  const { 
    data: receipt, 
    isLoading, 
    isSuccess, 
    isError, 
    error 
  } = useWaitForTransaction({
    hash: hash as `0x${string}`,
    confirmations: 2,
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  if (!hash) {
    return null;
  }

  const getStatusIcon = () => {
    if (isLoading) return <Clock className="w-5 h-5 text-yellow-400 animate-spin" />;
    if (isSuccess) return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (isError) return <XCircle className="w-5 h-5 text-red-400" />;
    return <AlertCircle className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Confirming transaction...';
    if (isSuccess) return 'Transaction confirmed';
    if (isError) return 'Transaction failed';
    return 'Transaction pending';
  };

  const getStatusColor = () => {
    if (isLoading) return 'border-yellow-400 bg-yellow-400/10';
    if (isSuccess) return 'border-green-400 bg-green-400/10';
    if (isError) return 'border-red-400 bg-red-400/10';
    return 'border-gray-400 bg-gray-400/10';
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const getExplorerUrl = () => {
    // For Somnia network - you may need to adjust this based on the actual explorer URL
    const baseUrl = 'https://explorer.somnia.network'; // Adjust this URL
    return `${baseUrl}/tx/${hash}`;
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <p className="font-medium text-white">{getStatusText()}</p>
            <p className="text-sm text-gray-400">
              {formatHash(hash)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <a
            href={getExplorerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="View on Explorer"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          
          {showDetails && (receipt || error) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </button>
          )}
        </div>
      </div>

      {/* Transaction Details */}
      {isExpanded && showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-600 space-y-2">
          {isSuccess && receipt && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Block Number:</span>
                <span className="text-white font-mono">#{receipt.blockNumber?.toString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Gas Used:</span>
                <span className="text-white font-mono">{receipt.gasUsed?.toString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Effective Gas Price:</span>
                <span className="text-white font-mono">
                  {receipt.effectiveGasPrice ? `${Number(receipt.effectiveGasPrice) / 1e9} Gwei` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 font-medium">Success</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Confirmations:</span>
                <span className="text-white font-mono">2+</span>
              </div>
            </div>
          )}

          {isError && error && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Error:</span>
                <span className="text-red-400 font-medium">Failed</span>
              </div>
              <div className="text-red-400 text-xs bg-red-400/10 p-2 rounded border border-red-400/20">
                {error.message || 'Transaction failed'}
              </div>
              <p className="text-gray-400 text-xs">
                The transaction was rejected or failed during execution. Please check your wallet and try again.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-yellow-400 font-medium">Pending</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Waiting for:</span>
                <span className="text-white">2 confirmations</span>
              </div>
              <p className="text-gray-400 text-xs">
                Your transaction is being processed by the network. This usually takes 30-60 seconds.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for use in lists or smaller spaces
export function CompactTransactionStatus({ hash, className = '' }: { hash?: string; className?: string }) {
  const { isLoading, isSuccess, isError } = useWaitForTransaction({
    hash: hash as `0x${string}`,
    confirmations: 1,
  });

  if (!hash) return null;

  const getStatusIndicator = () => {
    if (isLoading) return <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />;
    if (isSuccess) return <div className="w-2 h-2 bg-green-400 rounded-full" />;
    if (isError) return <div className="w-2 h-2 bg-red-400 rounded-full" />;
    return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {getStatusIndicator()}
      <span className="text-xs text-gray-400 font-mono">
        {hash.slice(0, 6)}...{hash.slice(-4)}
      </span>
    </div>
  );
}

// Hook for managing multiple transactions
export function useTransactionManager() {
  const [transactions, setTransactions] = useState<{
    hash: string;
    type: string;
    timestamp: number;
    status: 'pending' | 'success' | 'error';
  }[]>([]);

  const addTransaction = (hash: string, type: string) => {
    setTransactions(prev => [
      {
        hash,
        type,
        timestamp: Date.now(),
        status: 'pending'
      },
      ...prev.slice(0, 9) // Keep last 10 transactions
    ]);
  };

  const updateTransactionStatus = (hash: string, status: 'success' | 'error') => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.hash === hash ? { ...tx, status } : tx
      )
    );
  };

  const clearTransactions = () => {
    setTransactions([]);
  };

  const pendingCount = transactions.filter(tx => tx.status === 'pending').length;
  const successCount = transactions.filter(tx => tx.status === 'success').length;
  const errorCount = transactions.filter(tx => tx.status === 'error').length;

  return {
    transactions,
    addTransaction,
    updateTransactionStatus,
    clearTransactions,
    stats: {
      pending: pendingCount,
      success: successCount,
      error: errorCount,
      total: transactions.length
    }
  };
}
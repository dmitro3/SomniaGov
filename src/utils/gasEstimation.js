export async function estimateGasWithBuffer(txParams, multiplier = 1.2) {
  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider');
    }

    // Remove gas/gasLimit from params for estimation
    const estimationParams = {
      ...txParams,
      gas: undefined,
      gasLimit: undefined
    };

    console.log('Estimating gas for:', estimationParams);

    // Estimate gas using eth_estimateGas
    const estimatedGas = await window.ethereum.request({
      method: 'eth_estimateGas',
      params: [estimationParams]
    });

    // Convert hex to number, add buffer, convert back to hex
    const gasNumber = parseInt(estimatedGas, 16);
    const gasWithBuffer = Math.floor(gasNumber * multiplier);
    const gasHex = '0x' + gasWithBuffer.toString(16);

    console.log(`Gas estimation:
      - Estimated: ${gasNumber.toLocaleString()}
      - With buffer (${multiplier}x): ${gasWithBuffer.toLocaleString()}
      - Hex: ${gasHex}`);

    return gasHex;
  } catch (error) {
    console.warn('Gas estimation failed, using fallback:', error.message);
    
    // Fallback gas limits based on transaction type
    const fallbackLimits = {
      faucet: 800000,
      vote: 500000, 
      createProposal: 1000000,
      stake: 300000,
      unstake: 300000,
      comment: 500000
    };

    // Try to detect transaction type from data
    let fallbackGas = 300000; // Default
    
    if (txParams.data) {
      const data = txParams.data.toLowerCase();
      if (data.includes('faucet')) fallbackGas = fallbackLimits.faucet;
      else if (data.includes('vote')) fallbackGas = fallbackLimits.vote;
      else if (data.includes('createproposal')) fallbackGas = fallbackLimits.createProposal;
      else if (data.includes('stake')) fallbackGas = fallbackLimits.stake;
      else if (data.includes('comment')) fallbackGas = fallbackLimits.comment;
    }

    return '0x' + fallbackGas.toString(16);
  }
}

export async function sendTransactionWithAutoGas(txParams, options = {}) {
  try {
    const gasLimit = await estimateGasWithBuffer(txParams, options.gasMultiplier || 1.2);
    
    const finalTxParams = {
      ...txParams,
      gas: gasLimit,
      gasLimit: gasLimit
    };

    console.log('Sending transaction with auto gas:', finalTxParams);

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [finalTxParams],
    });

    return txHash;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}
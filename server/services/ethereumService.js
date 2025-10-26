import Web3 from 'web3';
import CryptoJS from 'crypto-js';

class EthereumService {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.isConnected = false;
    this.account = null;
    this.networkType = 'pos'; // 'pos' for Proof-of-Stake, 'pow' for Proof-of-Work
    this.init();
  }

  async init() {
    try {
      // Connect to geth node
      const providerUrl = process.env.ETHEREUM_PROVIDER_URL || 'http://localhost:8545';
      this.web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
      
      // Check connection
      const isListening = await this.web3.eth.net.isListening();
      this.isConnected = isListening;
      
      console.log(`✅ Connected to Ethereum node: ${isListening}`);
      console.log(`🌐 Provider URL: ${providerUrl}`);
      
      // Get network info to determine type
      await this.detectNetworkType();
      
      // Initialize account if private key is provided
      await this.initAccount();
      
      // Initialize contract if ABI and address are provided
      await this.initContract();
      
    } catch (error) {
      console.error('❌ Failed to connect to Ethereum node:', error.message);
      console.log('💡 Make sure geth is running on port 8545');
      this.isConnected = false;
    }
  }

  async detectNetworkType() {
    try {
      const networkId = await this.web3.eth.net.getId();
      const block = await this.web3.eth.getBlock('latest');
      
      // Check if it's a PoS network (no mining)
      if (block.difficulty === '0' || networkId === 1337) {
        this.networkType = 'pos';
        console.log('🔗 Network type: Proof-of-Stake (PoS)');
      } else {
        this.networkType = 'pow';
        console.log('⛏️  Network type: Proof-of-Work (PoW)');
      }
      
      console.log(`📊 Network ID: ${networkId}`);
      
    } catch (error) {
      console.log('⚠️  Could not detect network type, assuming PoS');
      this.networkType = 'pos';
    }
  }

  async initAccount() {
    try {
      const privateKey = process.env.ETHEREUM_PRIVATE_KEY;
      
      if (privateKey) {
        this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        this.web3.eth.accounts.wallet.add(this.account);
        console.log(`✅ Account initialized: ${this.account.address}`);
      } else {
        console.log('⚠️  No private key configured, using node accounts');
        // Get accounts from the node
        const accounts = await this.web3.eth.getAccounts();
        if (accounts.length > 0) {
          console.log(`✅ Node accounts available: ${accounts.length}`);
          console.log(`📝 Primary account: ${accounts[0]}`);
        } else {
          console.log('❌ No accounts available in the node');
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize account:', error.message);
    }
  }

  async initContract() {
    try {
      const contractAddress = process.env.VOTING_CONTRACT_ADDRESS;
      const contractABI = this.getContractABI();

      if (contractAddress && contractABI) {
        this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
        console.log('✅ Voting contract initialized');
      } else {
        console.log('ℹ️  No contract configuration found, using direct transactions');
      }
    } catch (error) {
      console.error('❌ Failed to initialize contract:', error.message);
    }
  }

  getContractABI() {
    return [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "voterHash",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "voteData",
            "type": "string"
          }
        ],
        "name": "castVote",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "voterHash",
            "type": "string"
          }
        ],
        "name": "hasVoted",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getTotalVotes",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
  }

  generateVoterHash(studentId, fullName, timestamp) {
    const data = `${studentId}-${fullName}-${timestamp}`;
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }

  encryptVoteData(votes) {
    const voteString = JSON.stringify(votes);
    const encryptionKey = process.env.VOTE_ENCRYPTION_KEY || 'voting-system-default-key-2024';
    return CryptoJS.AES.encrypt(voteString, encryptionKey).toString();
  }

  async submitVote(voteData) {
  try {
    if (!this.isConnected) {
      throw new Error('Not connected to Ethereum network');
    }

    const { voterId, votes, timestamp } = voteData;
    
    // Generate voter hash for anonymity
    const voterHash = this.generateVoterHash(voterId, 'anonymous', timestamp);
    
    // Encrypt vote data for privacy
    const encryptedVoteData = this.encryptVoteData(votes);
    
    // Get accounts from node
    const accounts = await this.web3.eth.getAccounts();
    if (accounts.length === 0) {
      throw new Error('No Ethereum accounts available in the node');
    }

    const fromAccount = accounts[0];
    console.log(`📤 Submitting vote from account: ${fromAccount}`);

    // Check account balance
    const balance = await this.web3.eth.getBalance(fromAccount);
    const balanceEth = this.web3.utils.fromWei(balance, 'ether');
    console.log(`💰 Account balance: ${balanceEth} ETH`);

    if (parseFloat(balanceEth) < 0.001) {
      throw new Error(`Insufficient balance: ${balanceEth} ETH. Need at least 0.001 ETH for transaction.`);
    }

    // Prepare vote data for blockchain
    const votePayload = {
      voterHash,
      encryptedVoteData,
      timestamp,
      voteCount: votes.length,
      network: 'ssc-voting-1337',
      type: 'vote'
    };

    // Convert to hex data (shorter payload)
    const voteDataHex = this.web3.utils.utf8ToHex(JSON.stringify(votePayload).substring(0, 1000));

    // Get current gas price
    const gasPrice = await this.web3.eth.getGasPrice();
    console.log(`⛽ Gas price: ${this.web3.utils.fromWei(gasPrice, 'gwei')} gwei`);

    // Estimate gas more accurately
    let gasLimit = 50000;
    try {
      const gasEstimate = await this.web3.eth.estimateGas({
        from: fromAccount,
        to: fromAccount, // Send to self to avoid contract issues
        data: voteDataHex
      });
      gasLimit = Math.floor(gasEstimate * 1.2); // Add 20% buffer
      console.log(`📊 Estimated gas: ${gasEstimate}, Using: ${gasLimit}`);
    } catch (estimateError) {
      console.log('⚠️  Could not estimate gas, using default:', gasLimit);
    }

    const txObject = {
      from: fromAccount,
      to: fromAccount, // Send to SELF to avoid any contract/revert issues
      data: voteDataHex,
      gas: gasLimit,
      gasPrice: gasPrice,
      value: '0x0'
    };

    console.log('⛓️  Creating transaction...', {
      from: fromAccount,
      to: txObject.to,
      gas: gasLimit,
      dataLength: voteDataHex.length
    });

    // Use node's account
    console.log('🔓 Sending transaction...');
    const receipt = await this.web3.eth.sendTransaction(txObject);
    
    console.log(`✅ Vote submitted successfully!`);
    console.log(`   Transaction: ${receipt.transactionHash}`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas used: ${receipt.gasUsed}`);

    return {
      success: true,
      receipt: {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        voterHash,
        gasUsed: receipt.gasUsed,
        timestamp: new Date().toISOString(),
        from: fromAccount,
        network: 'private-1337'
      }
    };

  } catch (error) {
    console.error('❌ Error submitting vote to blockchain:', error);
    
    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.message.includes('reverted')) {
      errorMessage = 'Transaction failed. This may be due to insufficient funds or gas issues.';
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient ETH for transaction gas fees.';
    } else if (error.message.includes('gas')) {
      errorMessage = 'Gas calculation error. Please try again.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

  async verifyTransaction(transactionHash) {
    try {
      const receipt = await this.web3.eth.getTransactionReceipt(transactionHash);
      
      if (receipt) {
        return {
          exists: true,
          blockNumber: receipt.blockNumber,
          status: receipt.status,
          gasUsed: receipt.gasUsed,
          confirmations: await this.getConfirmations(receipt.blockNumber)
        };
      }
      
      return { exists: false };
      
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return { exists: false, error: error.message };
    }
  }

  async getConfirmations(blockNumber) {
    try {
      const currentBlock = await this.web3.eth.getBlockNumber();
      return currentBlock - blockNumber;
    } catch (error) {
      return 0;
    }
  }

  async getBlockchainInfo() {
    try {
      if (!this.isConnected) {
        return { isConnected: false };
      }

      const blockNumber = await this.web3.eth.getBlockNumber();
      const gasPrice = await this.web3.eth.getGasPrice();
      const accounts = await this.web3.eth.getAccounts();
      const networkId = await this.web3.eth.net.getId();

      return {
        blockNumber,
        gasPrice: this.web3.utils.fromWei(gasPrice, 'gwei'),
        accounts: accounts.length,
        networkId,
        networkType: this.networkType,
        isConnected: this.isConnected
      };
    } catch (error) {
      console.error('Error getting blockchain info:', error);
      return { isConnected: false, error: error.message };
    }
  }

  async getAccountBalance(address = null) {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to Ethereum network');
      }

      const targetAddress = address || (this.account ? this.account.address : (await this.web3.eth.getAccounts())[0]);
      
      if (!targetAddress) {
        throw new Error('No Ethereum address available');
      }

      const balance = await this.web3.eth.getBalance(targetAddress);
      return {
        address: targetAddress,
        balance: this.web3.utils.fromWei(balance, 'ether'),
        balanceWei: balance
      };
    } catch (error) {
      console.error('Error getting account balance:', error);
      return { error: error.message };
    }
  }

  // Test connection to node
  async testConnection() {
    try {
      const info = await this.getBlockchainInfo();
      
      if (info.isConnected) {
        console.log('✅ Ethereum node connection test: PASSED');
        console.log(`   Network ID: ${info.networkId}`);
        console.log(`   Network Type: ${info.networkType}`);
        console.log(`   Current block: ${info.blockNumber}`);
        console.log(`   Accounts available: ${info.accounts}`);
        console.log(`   Gas price: ${info.gasPrice} gwei`);
        return true;
      } else {
        console.log('❌ Ethereum node connection test: FAILED');
        return false;
      }
    } catch (error) {
      console.log('❌ Ethereum node connection test: FAILED');
      console.log(`   Error: ${error.message}`);
      return false;
    }
  }
}

// Create singleton instance
export const ethereumService = new EthereumService();
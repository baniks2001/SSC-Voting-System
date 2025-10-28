import Web3 from 'web3';
import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';

class EthereumService {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.isConnected = false;
    this.account = null;
    this.networkType = 'pos';
    this.accountPassword = null;
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
      
      // Load account password
      await this.loadAccountPassword();
      
      // Get network info to determine type
      await this.detectNetworkType();
      
      // Initialize account
      await this.initAccount();
      
      // Initialize contract if ABI and address are provided
      await this.initContract();
      
    } catch (error) {
      console.error('❌ Failed to connect to Ethereum node:', error.message);
      console.log('💡 Make sure geth is running on port 8545');
      this.isConnected = false;
    }
  }

  async loadAccountPassword() {
    try {
      // Try multiple possible locations for password.txt
      const possiblePaths = [
        '../blockchain/ethereum-data/password.txt',
        '../blockchain/password.txt',
        './blockchain/ethereum-data/password.txt',
        './blockchain/password.txt',
        './password.txt',
        '../password.txt',
        process.env.ETHEREUM_ACCOUNT_PASSWORD
      ];

      for (const passwordPath of possiblePaths) {
        if (passwordPath && fs.existsSync(passwordPath)) {
          this.accountPassword = fs.readFileSync(passwordPath, 'utf8').trim();
          console.log(`🔐 Loaded password from file: ${passwordPath}`);
          break;
        } else if (passwordPath && passwordPath.startsWith('./') === false && !fs.existsSync(passwordPath)) {
          this.accountPassword = passwordPath;
          console.log(`🔐 Using password from environment variable`);
          break;
        }
      }

      if (!this.accountPassword) {
        console.log('⚠️  No password file found, using default password');
        this.accountPassword = 'voting-system-password-1761640036';
      }

      console.log(`🔐 Password loaded successfully`);

    } catch (error) {
      console.error('❌ Failed to load account password:', error.message);
      this.accountPassword = 'voting-system-password-1761640036';
    }
  }

  async detectNetworkType() {
    try {
      const networkId = await this.web3.eth.net.getId();
      const block = await this.web3.eth.getBlock('latest');
      
      if (networkId === 1337 || networkId === 5777 || networkId === 31337) {
        this.networkType = 'pow';
        console.log('🔗 Development Network: Using Proof-of-Work mode');
        return;
      }
      
      if (block.difficulty === '0') {
        this.networkType = 'pos';
        console.log('🔗 Network type: Proof-of-Stake (PoS)');
      } else {
        this.networkType = 'pow';
        console.log('⛏️  Network type: Proof-of-Work (PoW)');
      }
      
      console.log(`📊 Network ID: ${networkId}`);
      
    } catch (error) {
      console.log('⚠️  Could not detect network type, defaulting to PoW for development');
      this.networkType = 'pow';
    }
  }

  async initAccount() {
    try {
      const accounts = await this.web3.eth.getAccounts();
      if (accounts.length > 0) {
        this.account = accounts[0];
        console.log(`✅ Node account available: ${this.account}`);
      } else {
        console.log('❌ No accounts available in the node');
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

  // NEW: Account unlocking methods
  async unlockAccount() {
    try {
      console.log('🔓 Attempting to unlock account...');
      
      const accounts = await this.web3.eth.getAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts available');
      }

      const account = accounts[0];
      const password = this.accountPassword;
      
      console.log('🔐 Unlocking account:', account);
      const unlocked = await this.web3.eth.personal.unlockAccount(
        account, 
        password, 
        600 // unlock for 10 minutes
      );
      
      console.log('🔐 Account unlock result:', unlocked);
      return unlocked;
    } catch (error) {
      console.error('❌ Account unlock failed:', error);
      return false;
    }
  }

  // NEW: Submit vote with automatic account unlocking
  async submitVoteWithUnlock(voteData) {
    try {
      console.log('🔄 Starting vote submission with account unlock...');

      if (!this.isConnected) {
        throw new Error('Not connected to Ethereum network');
      }

      // First, try to unlock the account
      const unlocked = await this.unlockAccount();
      if (!unlocked) {
        throw new Error('Failed to unlock account. Please ensure geth is started with --unlock flag.');
      }

      // Then proceed with normal vote submission
      return await this.submitVote(voteData);

    } catch (error) {
      console.error('❌ Vote submission with unlock failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async checkAccountStatus() {
    try {
      const accounts = await this.web3.eth.getAccounts();
      if (accounts.length === 0) {
        return { available: false, error: 'No accounts found' };
      }

      const primaryAccount = accounts[0];
      
      // Try to send a test transaction to check if account is unlocked
      try {
        const gasPrice = await this.web3.eth.getGasPrice();
        const testTx = {
          from: primaryAccount,
          to: primaryAccount,
          value: '0x0',
          gas: 21000,
          gasPrice: gasPrice
        };
        
        const gasEstimate = await this.web3.eth.estimateGas(testTx);
        return { available: true, unlocked: true, account: primaryAccount };
      } catch (error) {
        if (error.message.includes('authentication') || error.message.includes('locked')) {
          return { available: true, unlocked: false, account: primaryAccount, error: 'Account locked' };
        }
        return { available: true, unlocked: false, account: primaryAccount, error: error.message };
      }
    } catch (error) {
      return { available: false, error: error.message };
    }
  }

  async submitVote(voteData) {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to Ethereum network');
      }

      const { voterId, votes, timestamp, ballotId } = voteData;
      
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

      // Check account status
      const accountStatus = await this.checkAccountStatus();
      console.log('🔐 Account status:', accountStatus);

      if (!accountStatus.unlocked) {
        console.log('🔄 Account appears locked, attempting unlock...');
        const unlocked = await this.unlockAccount();
        if (!unlocked) {
          throw new Error(`Account is locked and cannot be unlocked. Please ensure geth is started with --unlock flag.`);
        }
      }

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
        ballotId: ballotId || 'no-ballot-id',
        network: 'ssc-voting-1337',
        type: 'vote'
      };

      // Convert to hex data
      const voteDataHex = this.web3.utils.utf8ToHex(JSON.stringify(votePayload).substring(0, 1000));

      // Get current gas price
      const gasPrice = await this.web3.eth.getGasPrice();
      console.log(`⛽ Gas price: ${this.web3.utils.fromWei(gasPrice, 'gwei')} gwei`);

      // Estimate gas
      let gasLimit = 50000;
      try {
        const gasEstimate = await this.web3.eth.estimateGas({
          from: fromAccount,
          to: fromAccount,
          data: voteDataHex
        });
        gasLimit = Math.floor(gasEstimate * 1.2);
        console.log(`📊 Estimated gas: ${gasEstimate}, Using: ${gasLimit}`);
      } catch (estimateError) {
        console.log('⚠️  Could not estimate gas, using default:', gasLimit);
      }

      const txObject = {
        from: fromAccount,
        to: fromAccount,
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
          network: 'private-1337',
          ballotId: ballotId
        }
      };

    } catch (error) {
      console.error('❌ Error submitting vote to blockchain:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('reverted')) {
        errorMessage = 'Transaction failed. This may be due to insufficient funds or gas issues.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for transaction gas fees.';
      } else if (error.message.includes('gas')) {
        errorMessage = 'Gas calculation error. Please try again.';
      } else if (error.message.includes('authentication') || error.message.includes('locked')) {
        errorMessage = 'Account is locked. Please ensure geth is started with --unlock flag and the correct password.';
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
      
      const accountStatus = await this.checkAccountStatus();

      return {
        isConnected: true,
        blockNumber,
        gasPrice: this.web3.utils.fromWei(gasPrice, 'gwei'),
        accounts: accounts.length,
        networkId,
        networkType: this.networkType,
        accountStatus
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
        console.log(`   Account unlocked: ${info.accountStatus?.unlocked ? 'Yes' : 'No'}`);
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

  // NEW: Direct transaction method with better error handling
  async sendTransactionDirectly(transactionObject) {
    try {
      console.log('🔓 Sending transaction directly...');
      
      // Ensure account is unlocked first
      const unlocked = await this.unlockAccount();
      if (!unlocked) {
        throw new Error('Account could not be unlocked for transaction');
      }

      const receipt = await this.web3.eth.sendTransaction(transactionObject);
      return {
        success: true,
        receipt: receipt
      };
    } catch (error) {
      console.error('❌ Direct transaction failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
export const ethereumService = new EthereumService();
import Web3 from 'web3';
import CryptoJS from 'crypto-js';

class EthereumService {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.isConnected = false;
    this.account = null;
    this.init();
  }

  async init() {
    try {
      // Connect to geth node - use port 8545 (HTTP-RPC) instead of 8551 (WebSocket)
      const providerUrl = process.env.ETHEREUM_PROVIDER_URL || 'http://localhost:8545';
      this.web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
      
      // Check connection
      const isListening = await this.web3.eth.net.isListening();
      this.isConnected = isListening;
      
      console.log(`✅ Connected to Ethereum node: ${isListening}`);
      console.log(`🌐 Provider URL: ${providerUrl}`);
      
      // Initialize account if private key is provided
      await this.initAccount();
      
      // Initialize contract if ABI and address are provided
      await this.initContract();
      
    } catch (error) {
      console.error('❌ Failed to connect to Ethereum node:', error.message);
      console.log('💡 Make sure geth is running with: geth --http --http.port 8545 --http.api "web3,eth,net,personal,miner"');
      this.isConnected = false;
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
    // Simple Voting Contract ABI
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

  decryptVoteData(encryptedData) {
    try {
      const encryptionKey = process.env.VOTE_ENCRYPTION_KEY || 'voting-system-default-key-2024';
      const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Error decrypting vote data:', error);
      return null;
    }
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
      
      let transactionHash;
      let blockNumber;
      let gasUsed;

      // Use direct transaction (since we don't have a contract deployed yet)
      const privateKey = process.env.ETHEREUM_PRIVATE_KEY;
      
      if (!privateKey && !this.account) {
        throw new Error('Ethereum private key not configured and no account available');
      }

      const fromAccount = this.account || (await this.web3.eth.getAccounts())[0];
      
      if (!fromAccount) {
        throw new Error('No Ethereum account available for transaction');
      }

      // Prepare vote data for blockchain
      const votePayload = {
        voterHash,
        encryptedVoteData,
        timestamp,
        voteCount: votes.length
      };

      // Convert to hex data
      const voteDataHex = this.web3.utils.asciiToHex(JSON.stringify(votePayload));

      const txObject = {
        from: fromAccount.address,
        to: process.env.VOTE_RECEIPT_ADDRESS || fromAccount.address, // Send to self if no receipt address
        data: voteDataHex,
        gas: 100000,
        gasPrice: await this.web3.eth.getGasPrice(),
        value: '0x0'
      };

      let receipt;
      
      if (privateKey) {
        // Sign transaction with private key
        const signedTx = await this.web3.eth.accounts.signTransaction(txObject, privateKey);
        receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      } else {
        // Use node's account (requires unlocked account)
        receipt = await this.web3.eth.sendTransaction(txObject);
      }
      
      transactionHash = receipt.transactionHash;
      blockNumber = receipt.blockNumber;
      gasUsed = receipt.gasUsed;

      console.log(`✅ Vote submitted successfully!`);
      console.log(`   Transaction: ${transactionHash}`);
      console.log(`   Block: ${blockNumber}`);
      console.log(`   Gas used: ${gasUsed}`);

      return {
        success: true,
        receipt: {
          transactionHash,
          blockNumber,
          voterHash,
          gasUsed,
          timestamp: new Date().toISOString(),
          from: fromAccount.address
        }
      };

    } catch (error) {
      console.error('❌ Error submitting vote to blockchain:', error);
      return {
        success: false,
        error: error.message
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
      const isMining = await this.web3.eth.isMining();

      return {
        blockNumber,
        gasPrice: this.web3.utils.fromWei(gasPrice, 'gwei'),
        accounts: accounts.length,
        networkId,
        isMining,
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
        console.log(`   Current block: ${info.blockNumber}`);
        console.log(`   Accounts available: ${info.accounts}`);
        console.log(`   Mining: ${info.isMining}`);
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
import Web3 from 'web3';
import { ETHEREUM_CONFIG } from '../../config/ethereum.js';

class MultiNodeEthereumService {
  constructor() {
    this.nodes = ETHEREUM_CONFIG.nodes.map(node => ({
      ...node,
      web3: new Web3(node.rpcUrl),
      isConnected: false,
      lastBlock: 0
    }));
    this.currentNodeIndex = 0;
    this.contract = null;
    this.simulationMode = false;
    this.voteStorage = new Map(); // Fallback for simulation mode
    this.init();
  }

  async init() {
    console.log('🔗 Initializing fully decentralized multi-node Ethereum service...');
    
    let connectedCount = 0;
    
    // Test all nodes
    for (let i = 0; i < this.nodes.length; i++) {
      try {
        const node = this.nodes[i];
        
        // Add timeout for connection test
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        );
        
        const connectionPromise = node.web3.eth.net.isListening();
        const isConnected = await Promise.race([connectionPromise, timeoutPromise]);
        
        node.isConnected = isConnected;
        
        if (isConnected) {
          // Get account balance to verify account access
          const balance = await node.web3.eth.getBalance(node.account);
          const blockNumber = await node.web3.eth.getBlockNumber();
          node.lastBlock = blockNumber;
          
          console.log(`✅ Node ${i+1} (${node.name}): Connected`);
          console.log(`   Account: ${node.account}`);
          console.log(`   Balance: ${node.web3.utils.fromWei(balance, 'ether')} ETH`);
          console.log(`   Block: #${blockNumber}`);
          connectedCount++;
        }
        
      } catch (error) {
        console.log(`❌ Node ${i+1} connection failed:`, error.message);
        this.nodes[i].isConnected = false;
      }
    }
    
    if (connectedCount === 0) {
      console.log('⚠️ No Ethereum nodes connected. Running in simulation mode.');
      this.simulationMode = true;
    }
    
    await this.loadContract();
  }

  async getActiveNode() {
    const connectedNodes = this.nodes.filter(node => node.isConnected);
    if (connectedNodes.length === 0) {
      // If no nodes are connected but we're in simulation mode, use first node config with mock web3
      if (this.simulationMode) {
        return {
          ...this.nodes[0],
          web3: new Web3(),
          isConnected: false,
          name: 'simulation'
        };
      }
      throw new Error('No Ethereum nodes available');
    }
    
    // Simple round-robin load balancing
    this.currentNodeIndex = (this.currentNodeIndex + 1) % connectedNodes.length;
    return connectedNodes[this.currentNodeIndex];
  }

  async loadContract() {
    try {
      const node = await this.getActiveNode();
      
      if (this.simulationMode) {
        console.log('🔶 Smart contract: SIMULATION MODE (fully decentralized simulation)');
        this.contract = null;
        return;
      }

      // Enhanced contract ABI for fully decentralized voting
      const contractABI = [
        {
          "inputs": [
            {"internalType": "string", "name": "_voterId", "type": "string"},
            {"internalType": "string", "name": "_ballotId", "type": "string"}, 
            {"internalType": "string", "name": "_votes", "type": "string"},
            {"internalType": "uint256", "name": "_timestamp", "type": "uint256"},
            {"internalType": "string", "name": "_voterHash", "type": "string"}
          ],
          "name": "submitVote",
          "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "string", "name": "_ballotId", "type": "string"}],
          "name": "getVote",
          "outputs": [
            {"internalType": "string", "name": "voterId", "type": "string"},
            {"internalType": "string", "name": "ballotId", "type": "string"}, 
            {"internalType": "string", "name": "votes", "type": "string"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"internalType": "string", "name": "voterHash", "type": "string"}
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "string", "name": "_voterId", "type": "string"}],
          "name": "hasVoted",
          "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getTotalVotes",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getAllVotes",
          "outputs": [
            {"internalType": "string[]", "name": "ballotIds", "type": "string[]"},
            {"internalType": "string[]", "name": "voterHashes", "type": "string[]"},
            {"internalType": "uint256[]", "name": "timestamps", "type": "uint256[]"}
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      
      if (ETHEREUM_CONFIG.contractAddress) {
        this.contract = new node.web3.eth.Contract(contractABI, ETHEREUM_CONFIG.contractAddress);
        console.log('✅ Smart contract loaded successfully at:', ETHEREUM_CONFIG.contractAddress);
      } else {
        console.log('⚠️ No contract address configured. Votes will be simulated in decentralized mode.');
        this.contract = null;
      }
    } catch (error) {
      console.error('❌ Failed to load contract:', error.message);
      this.contract = null;
    }
  }

  async submitVote(voteData) {
    console.log('⛓️ Submitting vote to decentralized blockchain...', {
      voterId: voteData.voterId,
      ballotId: voteData.ballotId,
      voteCount: voteData.votes.length
    });

    // If no contract is deployed or in simulation mode, simulate blockchain submission
    if (!this.contract || !ETHEREUM_CONFIG.contractAddress || this.simulationMode) {
      console.log('⚠️ No contract deployed or simulation mode, simulating decentralized blockchain submission');
      return this.simulateBlockchainSubmission(voteData);
    }

    for (let attempt = 0; attempt < this.nodes.length; attempt++) {
      const node = await this.getActiveNode();
      try {
        const votesString = JSON.stringify(voteData.votes);
        
        const transaction = this.contract.methods.submitVote(
          voteData.voterId,
          voteData.ballotId,
          votesString,
          Math.floor(Date.now() / 1000),
          voteData.voterHash
        );

        const gas = await transaction.estimateGas({ from: node.account });
        
        const signedTx = await node.web3.eth.accounts.signTransaction({
          to: ETHEREUM_CONFIG.contractAddress,
          data: transaction.encodeABI(),
          gas: gas,
          gasPrice: ETHEREUM_CONFIG.gasPrice,
          nonce: await node.web3.eth.getTransactionCount(node.account)
        }, node.privateKey);

        const receipt = await node.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        console.log('✅ Vote submitted successfully to decentralized blockchain:', {
          node: node.name,
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed
        });

        // Convert BigInt values to strings to avoid serialization issues
        return {
          success: true,
          receipt: {
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber?.toString(),
            voterHash: voteData.voterHash,
            gasUsed: receipt.gasUsed?.toString(),
            timestamp: Date.now().toString(),
            node: node.name,
            ballotId: voteData.ballotId,
            simulated: false
          }
        };

      } catch (error) {
        console.warn(`❌ Node ${node.name} failed:`, error.message);
        node.isConnected = false;
        continue;
      }
    }
    
    throw new Error('All decentralized blockchain nodes failed to submit vote');
  }

  // Enhanced simulation for fully decentralized mode
  async simulateBlockchainSubmission(voteData) {
    const node = await this.getActiveNode();
    const simulatedHash = node.web3.utils.sha3(
      voteData.voterId + voteData.ballotId + Date.now() + Math.random().toString(36)
    );
    
    const blockNumber = await node.web3.eth.getBlockNumber().catch(() => 0);
    
    // Store vote in simulation storage
    const simulatedVote = {
      voterId: voteData.voterId,
      ballotId: voteData.ballotId,
      votes: voteData.votes,
      timestamp: Date.now(),
      voterHash: voteData.voterHash,
      transactionHash: simulatedHash,
      blockNumber: blockNumber,
      node: 'simulation'
    };
    
    this.voteStorage.set(voteData.ballotId, simulatedVote);
    
    return {
      success: true,
      receipt: {
        transactionHash: simulatedHash,
        blockNumber: blockNumber?.toString(),
        voterHash: voteData.voterHash,
        gasUsed: '21000',
        timestamp: Date.now().toString(),
        simulated: true,
        node: 'simulation',
        ballotId: voteData.ballotId
      }
    };
  }

  async checkVoterHasVoted(voterId) {
    if (this.simulationMode || !this.contract) {
      // Check simulation storage
      for (let [_, vote] of this.voteStorage) {
        if (vote.voterId === voterId) {
          return true;
        }
      }
      return false;
    }

    try {
      return await this.contract.methods.hasVoted(voterId).call();
    } catch (error) {
      console.error('Error checking if voter has voted:', error);
      return false;
    }
  }

  async getVoteFromBlockchain(ballotId) {
    if (this.simulationMode || !this.contract) {
      return this.voteStorage.get(ballotId) || null;
    }

    for (let attempt = 0; attempt < this.nodes.length; attempt++) {
      const node = await this.getActiveNode();
      try {
        const result = await this.contract.methods.getVote(ballotId).call();
        return {
          voterId: result.voterId,
          ballotId: result.ballotId,
          votes: JSON.parse(result.votes),
          timestamp: parseInt(result.timestamp),
          voterHash: result.voterHash
        };
      } catch (error) {
        console.warn(`Node ${node.name} failed to get vote:`, error.message);
        node.isConnected = false;
        continue;
      }
    }
    throw new Error('All nodes failed to retrieve vote');
  }

  async getVotesByVoter(voterId) {
    if (this.simulationMode || !this.contract) {
      const votes = [];
      for (let [_, vote] of this.voteStorage) {
        if (vote.voterId === voterId) {
          votes.push(vote);
        }
      }
      return votes.sort((a, b) => b.timestamp - a.timestamp);
    }

    // In real implementation, you might need to get all votes and filter
    // This would require a more complex contract design with events
    try {
      const allVotes = await this.getAllVotesFromBlockchain();
      return allVotes.filter(vote => vote.voterId === voterId)
                    .sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting votes by voter:', error);
      return [];
    }
  }

  async getAllVotesFromBlockchain() {
    if (this.simulationMode || !this.contract) {
      return Array.from(this.voteStorage.values());
    }

    try {
      // This would require your contract to have a function to get all votes
      // For now, return empty array - you'd need to implement this based on your contract
      return [];
    } catch (error) {
      console.error('Error getting all votes from blockchain:', error);
      return [];
    }
  }

  async getElectionResults() {
    const allVotes = await this.getAllVotesFromBlockchain();
    
    // Calculate results from blockchain data
    const results = {};
    let totalVotes = 0;

    allVotes.forEach(vote => {
      vote.votes.forEach(v => {
        const position = v.position;
        const candidateId = v.candidateId;
        
        if (!results[position]) {
          results[position] = {};
        }
        
        if (!results[position][candidateId]) {
          results[position][candidateId] = {
            candidateId: candidateId,
            voteCount: 0
          };
        }
        
        results[position][candidateId].voteCount++;
        totalVotes++;
      });
    });

    return {
      results: results,
      totalVotes: totalVotes,
      voteData: allVotes
    };
  }

  async verifyVoteOnBlockchain(ballotId) {
    const vote = await this.getVoteFromBlockchain(ballotId);
    
    return {
      exists: !!vote,
      details: vote || null,
      confirmations: vote ? 6 : 0, // Simulated confirmation count
      verified: !!vote
    };
  }

  async getBlockchainInfo() {
    try {
      const node = await this.getActiveNode();
      const blockNumber = await node.web3.eth.getBlockNumber();
      const balance = await node.web3.eth.getBalance(node.account);
      
      return {
        isConnected: true,
        networkId: node.chainId,
        blockNumber: blockNumber?.toString(),
        accounts: [node.account],
        accountStatus: {
          unlocked: true,
          balance: node.web3.utils.fromWei(balance, 'ether'),
          address: node.account
        },
        node: node.name,
        contractDeployed: !!ETHEREUM_CONFIG.contractAddress,
        simulationMode: this.simulationMode,
        storageType: 'fully_decentralized'
      };
    } catch (error) {
      return {
        isConnected: false,
        error: error.message,
        simulationMode: this.simulationMode,
        storageType: 'fully_decentralized'
      };
    }
  }
}

export const ethereumService = new MultiNodeEthereumService();
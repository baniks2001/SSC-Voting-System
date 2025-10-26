import Web3 from 'web3';
import { SHA256 } from 'crypto-js';

// Ethereum connection setup
let web3;
let contract;
let account;

// Replace with your actual contract address and ABI
const contractAddress = 'YOUR_CONTRACT_ADDRESS_HERE';
const contractABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_studentId", "type": "string"},
      {"internalType": "string", "name": "_receiptId", "type": "string"},
      {"internalType": "string", "name": "_votes", "type": "string"},
      {"internalType": "uint256", "name": "_timestamp", "type": "uint256"}
    ],
    "name": "storeVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_receiptId", "type": "string"}],
    "name": "getVote",
    "outputs": [
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const initWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      account = accounts[0];
      
      contract = new web3.eth.Contract(contractABI, contractAddress);
      return { success: true, account };
    } catch (error) {
      return { success: false, error: 'User denied account access' };
    }
  } else {
    return { success: false, error: 'Please install MetaMask' };
  }
};

export const storeVoteOnBlockchain = async (studentId, votes) => {
  try {
    if (!contract) {
      await initWeb3();
    }

    // Generate receipt ID (hash of studentId + timestamp)
    const timestamp = Date.now();
    const receiptId = SHA256(studentId + timestamp).toString();
    
    // Convert votes to JSON string if it's an object
    const votesData = typeof votes === 'object' ? JSON.stringify(votes) : votes;

    const transaction = await contract.methods
      .storeVote(studentId, receiptId, votesData, timestamp)
      .send({ from: account });

    return {
      success: true,
      receiptId,
      transactionHash: transaction.transactionHash,
      timestamp
    };
  } catch (error) {
    console.error('Error storing vote on blockchain:', error);
    return { success: false, error: error.message };
  }
};

export const getVoteFromBlockchain = async (receiptId) => {
  try {
    if (!contract) {
      await initWeb3();
    }

    const voteData = await contract.methods.getVote(receiptId).call();
    return {
      studentId: voteData[0],
      receiptId: voteData[1],
      votes: voteData[2],
      timestamp: parseInt(voteData[3])
    };
  } catch (error) {
    console.error('Error retrieving vote from blockchain:', error);
    return null;
  }
};

export const getCurrentAccount = () => account;
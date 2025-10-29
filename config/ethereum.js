import dotenv from 'dotenv';
dotenv.config();

export const ETHEREUM_CONFIG = {
  nodes: [
    {
      name: "node1",
      rpcUrl: process.env.ETHEREUM_NODE1_URL || "http://localhost:8545",
      wsUrl: "ws://localhost:8546",
      chainId: parseInt(process.env.ETHEREUM_CHAIN_ID) || 1337,
      account: process.env.ETHEREUM_NODE1_ACCOUNT || "0x7e5fde38f1233b19e4b7653a5a335a1e3b97a9e1",
      privateKey: process.env.ETHEREUM_NODE1_PRIVATE_KEY || "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
      password: process.env.ETHEREUM_NODE1_PASSWORD || "password123"
    },
    {
      name: "node2", 
      rpcUrl: process.env.ETHEREUM_NODE2_URL || "http://localhost:8547",
      wsUrl: "ws://localhost:8548",
      chainId: parseInt(process.env.ETHEREUM_CHAIN_ID) || 1337,
      account: process.env.ETHEREUM_NODE2_ACCOUNT || "0x8e6fde38f1233b19e4b7653a5a335a1e3b97a9e2",
      privateKey: process.env.ETHEREUM_NODE2_PRIVATE_KEY || "b2c3d4e5f6789012345678901234567890123456789012345678901234567891",
      password: process.env.ETHEREUM_NODE2_PASSWORD || "password123"
    }
  ],
  contractAddress: process.env.VOTING_CONTRACT_ADDRESS || "",
  gasLimit: parseInt(process.env.ETHEREUM_GAS_LIMIT) || 6721975,
  gasPrice: parseInt(process.env.ETHEREUM_GAS_PRICE) || 20000000000,
  fallbackTimeout: 3000
};
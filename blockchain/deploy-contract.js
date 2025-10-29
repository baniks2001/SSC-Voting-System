const Web3 = require('web3');
const { ETHEREUM_CONFIG } = require('../config/ethereum.js');

async function deployContract() {
  console.log('🚀 Deploying Voting Contract...');
  
  // Use first node for deployment
  const node = ETHEREUM_CONFIG.nodes[0];
  const web3 = new Web3(node.rpcUrl);
  
  const contractABI = [/* Your contract ABI */];
  const contractBytecode = '0x...'; // Your contract bytecode
  
  const contract = new web3.eth.Contract(contractABI);
  
  const deployTx = contract.deploy({
    data: contractBytecode,
    arguments: [] // constructor arguments
  });
  
  const gas = await deployTx.estimateGas({ from: node.account });
  
  const signedTx = await web3.eth.accounts.signTransaction({
    data: deployTx.encodeABI(),
    gas: gas,
    gasPrice: ETHEREUM_CONFIG.gasPrice
  }, node.privateKey);
  
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  
  console.log('✅ Contract deployed at:', receipt.contractAddress);
  console.log('📝 Update VOTING_CONTRACT_ADDRESS in your .env file');
}

deployContract().catch(console.error);
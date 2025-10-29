import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NODE_URL = 'http://localhost:8545';
const ARTIFACTS_PATH = path.resolve(__dirname, '../artifacts/Voting.json');

async function deployContract() {
    try {
        console.log('🚀 Starting contract deployment...');
        
        const web3 = new Web3(NODE_URL);
        
        // Wait for node to be ready
        console.log('⏳ Waiting for node to be ready...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const isListening = await web3.eth.net.isListening();
        if (!isListening) {
            throw new Error('Cannot connect to Ethereum node at ' + NODE_URL);
        }
        console.log('✅ Connected to Ethereum node');

        console.log('🔧 Developer mode detected - automatic mining enabled');

        // Check for compiled contract
        if (!fs.existsSync(ARTIFACTS_PATH)) {
            throw new Error('Compiled contract not found. Run npm run compile-contract first.');
        }

        const contractData = JSON.parse(fs.readFileSync(ARTIFACTS_PATH, 'utf8'));
        const abi = contractData.abi;
        const bytecode = contractData.bytecode;

        if (!abi || !bytecode) {
            throw new Error('Invalid contract data in artifacts');
        }

        // Get accounts
        const accounts = await web3.eth.getAccounts();
        console.log('📝 Available accounts:', accounts);

        if (accounts.length === 0) {
            throw new Error('No accounts available. Make sure nodes are properly initialized.');
        }

        const adminAccount = accounts[0];
        const balance = await web3.eth.getBalance(adminAccount);

        console.log('👤 Using account:', adminAccount);
        console.log('💰 Account balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');

        const VotingContract = new web3.eth.Contract(abi);

        console.log('⏳ Deploying contract...');
        const deployTx = VotingContract.deploy({
            data: '0x' + bytecode,
            arguments: []
        });

        console.log('📦 Estimating gas...');
        const gas = await deployTx.estimateGas({ from: adminAccount });
        console.log('⛽ Estimated gas:', gas.toString());

        console.log('🔄 Sending deployment transaction...');
        console.log('⏳ Developer mode will automatically mine this transaction...');
        
        const contractInstance = await deployTx.send({
            from: adminAccount,
            gas: gas,
            gasPrice: '1000000000' // 1 gwei
        });

        console.log('✅ Contract deployed successfully!');
        console.log('📝 Contract address:', contractInstance.options.address);
        
        // Get the transaction details separately since receipt might be undefined
        if (contractInstance.transactionHash) {
            console.log('🔗 Transaction hash:', contractInstance.transactionHash);
            
            // Wait a bit and get the transaction receipt
            await new Promise(resolve => setTimeout(resolve, 2000));
            const receipt = await web3.eth.getTransactionReceipt(contractInstance.transactionHash);
            if (receipt) {
                console.log('📦 Block number:', receipt.blockNumber);
            }
        }

        const deploymentInfo = {
            address: contractInstance.options.address,
            transactionHash: contractInstance.transactionHash || 'unknown',
            deployer: adminAccount,
            blockNumber: 'unknown', // Developer mode sometimes doesn't provide this
            timestamp: new Date().toISOString(),
            abi: abi,
            networkId: 1337
        };

        const deploymentPath = path.resolve(__dirname, '../artifacts/deployment-info.json');
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

        console.log('💾 Deployment info saved to artifacts/deployment-info.json');
        console.log('🎉 Contract is ready for voting!');

        return contractInstance;

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        console.log('💡 Troubleshooting:');
        console.log('   - Make sure Node 1 is running in developer mode');
        console.log('   - Wait for "Using developer account" message');
        console.log('   - Check that accounts are available');
        process.exit(1);
    }
}

deployContract();

import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fullDeployment() {
    try {
        console.log('🎯 FULL CONTRACT DEPLOYMENT');
        console.log('============================');
        
        const web3 = new Web3('http://localhost:8545');
        
        // Wait for node
        console.log('\\n⏳ Checking node connection...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const isListening = await web3.eth.net.isListening();
        if (!isListening) {
            throw new Error('❌ Cannot connect to node at http://localhost:8545');
        }
        console.log('✅ Node is listening');

        // Check accounts
        console.log('\\n👤 Checking accounts...');
        const accounts = await web3.eth.getAccounts();
        console.log('Available accounts:', accounts);
        
        if (accounts.length === 0) {
            throw new Error('❌ No accounts found');
        }

        const adminAccount = accounts[0];
        const balance = await web3.eth.getBalance(adminAccount);
        console.log('Using account:', adminAccount);
        console.log('Balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');

        // Check compiled contract
        console.log('\\n📦 Checking compiled contract...');
        const artifactsPath = path.resolve(__dirname, '../artifacts/Voting.json');
        if (!fs.existsSync(artifactsPath)) {
            throw new Error('❌ Compiled contract not found. Run: npm run compile-contract');
        }
        
        const contractData = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
        const abi = contractData.abi;
        const bytecode = contractData.bytecode;
        console.log('✅ Contract compiled - ABI length:', abi.length);
        console.log('✅ Bytecode length:', bytecode.length);

        // Ensure artifacts directory exists
        const artifactsDir = path.resolve(__dirname, '../artifacts');
        if (!fs.existsSync(artifactsDir)) {
            fs.mkdirSync(artifactsDir, { recursive: true });
        }

        // Deploy contract
        console.log('\\n🚀 DEPLOYING CONTRACT...');
        const VotingContract = new web3.eth.Contract(abi);
        
        const deployTx = VotingContract.deploy({
            data: '0x' + bytecode,
            arguments: []
        });

        console.log('⛽ Estimating gas...');
        const gas = await deployTx.estimateGas({ from: adminAccount });
        console.log('Gas estimate:', gas.toString());

        console.log('📤 Sending transaction...');
        const contractInstance = await deployTx.send({
            from: adminAccount,
            gas: gas,
            gasPrice: '1000000000'
        });

        console.log('\\n✅ CONTRACT DEPLOYED SUCCESSFULLY!');
        console.log('==================================');
        console.log('📝 Contract address:', contractInstance.options.address);
        console.log('👤 Deployed by:', adminAccount);
        
        // Save deployment info with better error handling
        const deploymentInfo = {
            address: contractInstance.options.address,
            transactionHash: contractInstance.transactionHash || 'unknown',
            deployer: adminAccount,
            timestamp: new Date().toISOString(),
            abi: abi,
            networkId: 1337
        };

        const deploymentPath = path.resolve(artifactsDir, 'deployment-info.json');
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        console.log('💾 Deployment info saved to:', deploymentPath);

        // Verify the deployment
        console.log('\\n🔍 VERIFYING DEPLOYMENT...');
        const code = await web3.eth.getCode(contractInstance.options.address);
        if (code && code !== '0x') {
            console.log('✅ Contract code verified!');
            console.log('📏 Code size:', code.length, 'bytes');
        } else {
            throw new Error('❌ Contract code not found at address');
        }

        console.log('\\n🎉 DEPLOYMENT COMPLETE!');
        console.log('=======================');
        console.log('Your voting contract is ready at:');
        console.log('📍', contractInstance.options.address);
        console.log('\\nNext: Run npm run test-contract to test voting functions');

        return contractInstance;

    } catch (error) {
        console.error('\\n❌ DEPLOYMENT FAILED:', error.message);
        console.log('\\n💡 Troubleshooting:');
        console.log('1. Make sure Node 1 is running (npm run node1)');
        console.log('2. Wait for "Using developer account" message');
        console.log('3. Check that accounts are available');
        console.log('4. Ensure contract is compiled (npm run compile-contract)');
        process.exit(1);
    }
}

fullDeployment();

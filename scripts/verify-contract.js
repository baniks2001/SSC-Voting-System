import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyDeployment() {
    console.log('🔍 VERIFYING CONTRACT DEPLOYMENT');
    console.log('================================');
    
    try {
        const web3 = new Web3('http://localhost:8545');
        
        // Check deployment info
        const deploymentPath = path.resolve(__dirname, '../artifacts/deployment-info.json');
        if (!fs.existsSync(deploymentPath)) {
            console.log('❌ No deployment info found. Please deploy the contract first.');
            console.log('💡 Run: npm run deploy-contract');
            return;
        }

        const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        
        console.log('\\n📄 DEPLOYMENT INFO:');
        console.log('📍 Contract:', deploymentInfo.address);
        console.log('👤 Deployer:', deploymentInfo.deployer);
        console.log('🕒 Deployed:', deploymentInfo.timestamp);
        console.log('🌐 Network:', deploymentInfo.networkId);

        // Verify contract code
        console.log('\\n🔎 CHECKING CONTRACT CODE...');
        const code = await web3.eth.getCode(deploymentInfo.address);
        if (code && code !== '0x') {
            console.log('✅ Contract code found!');
            console.log('📏 Code size:', code.length, 'bytes');
        } else {
            console.log('❌ No contract code at address');
            return;
        }

        // Test contract interaction
        console.log('\\n🧪 TESTING CONTRACT INTERACTION...');
        const contract = new web3.eth.Contract(deploymentInfo.abi, deploymentInfo.address);
        
        try {
            const admin = await contract.methods.admin().call();
            console.log('👑 Admin:', admin);
            
            const candidatesCount = await contract.methods.candidatesCount().call();
            console.log('📊 Candidates count:', candidatesCount.toString());
            
            const electionStatus = await contract.methods.getElectionStatus().call();
            console.log('🗳️ Election - Started:', electionStatus[0], 'Ended:', electionStatus[1]);
            
            console.log('\\n🎉 CONTRACT IS FULLY FUNCTIONAL!');
            console.log('================================');
            console.log('Your voting system is ready to use!');
            console.log('\\nNext steps:');
            console.log('1. Run: npm run test-contract (to test voting)');
            console.log('2. Integrate with your React frontend');
            console.log('3. Start voting!');
            
        } catch (error) {
            console.log('⚠️ Contract interaction test failed:', error.message);
        }

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

verifyDeployment();

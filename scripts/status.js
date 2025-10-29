import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkStatus() {
    console.log('📊 VOTING SYSTEM STATUS');
    console.log('======================');
    
    try {
        const web3 = new Web3('http://localhost:8545');
        const deploymentPath = path.resolve(__dirname, '../artifacts/deployment-info.json');
        
        if (!fs.existsSync(deploymentPath)) {
            console.log('❌ Contract not deployed');
            return;
        }

        const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        const contract = new web3.eth.Contract(deploymentInfo.abi, deploymentInfo.address);
        
        console.log('📍 Contract:', deploymentInfo.address);
        
        const candidatesCount = await contract.methods.candidatesCount().call();
        console.log('👥 Candidates:', candidatesCount.toString());
        
        const electionStatus = await contract.methods.getElectionStatus().call();
        console.log('🗳️ Election:', electionStatus[0] ? (electionStatus[1] ? 'Ended' : 'Active') : 'Not Started');
        
        const accounts = await web3.eth.getAccounts();
        console.log('👤 Available accounts:', accounts.length);
        
        console.log('\\n✅ SYSTEM STATUS: OPERATIONAL');
        console.log('Ready for voting! 🎉');
        
    } catch (error) {
        console.log('❌ Status check failed:', error.message);
    }
}

checkStatus();

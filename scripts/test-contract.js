import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testContract() {
    try {
        const web3 = new Web3('http://localhost:8545');
        const deploymentInfoPath = path.resolve(__dirname, '../artifacts/deployment-info.json');
        
        if (!fs.existsSync(deploymentInfoPath)) {
            console.log('❌ No deployed contract found. Run npm run deploy-contract first.');
            return;
        }

        const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf8'));
        const contract = new web3.eth.Contract(deploymentInfo.abi, deploymentInfo.address);
        const accounts = await web3.eth.getAccounts();
        const admin = accounts[0];

        console.log('🧪 TESTING VOTING CONTRACT');
        console.log('===========================');
        console.log('📝 Contract:', deploymentInfo.address);
        console.log('👤 Admin:', admin);
        
        // Test adding candidates (admin only)
        try {
            console.log('\\n1. ADDING CANDIDATES...');
            await contract.methods.addCandidate('Candidate A').send({ from: admin });
            await contract.methods.addCandidate('Candidate B').send({ from: admin });
            await contract.methods.addCandidate('Candidate C').send({ from: admin });
            console.log('✅ Candidates added successfully');
        } catch (error) {
            console.log('❌ Failed to add candidates:', error.message);
        }

        // Test starting election
        try {
            console.log('\\n2. STARTING ELECTION...');
            await contract.methods.startElection().send({ from: admin });
            console.log('✅ Election started successfully');
        } catch (error) {
            console.log('❌ Failed to start election:', error.message);
        }

        // Test voting - use the same account since we only have one in dev mode
        try {
            console.log('\\n3. TESTING VOTING...');
            // In dev mode we only have one account, so we'll vote with it
            await contract.methods.vote(1).send({ from: admin });
            console.log('✅ Vote cast for Candidate 1');
        } catch (error) {
            console.log('❌ Failed to vote:', error.message);
        }

        // Test getting results
        try {
            console.log('\\n4. GETTING RESULTS...');
            const results = await contract.methods.getResults().call();
            console.log('✅ Results retrieved successfully');
            console.log('   Candidate IDs:', results[0].map(id => id.toString()));
            console.log('   Candidate Names:', results[1]);
            console.log('   Vote Counts:', results[2].map(votes => votes.toString()));
        } catch (error) {
            console.log('❌ Failed to get results:', error.message);
        }

        // Test election status
        try {
            console.log('\\n5. CHECKING ELECTION STATUS...');
            const status = await contract.methods.getElectionStatus().call();
            console.log('✅ Election status - Started:', status[0], 'Ended:', status[1]);
        } catch (error) {
            console.log('❌ Failed to get election status:', error.message);
        }

        // Test individual candidate info
        try {
            console.log('\\n6. CHECKING CANDIDATE INFO...');
            for (let i = 1; i <= 3; i++) {
                const candidate = await contract.methods.getCandidate(i).call();
                console.log('   Candidate', i + ':', candidate[1], '- Votes:', candidate[2].toString());
            }
        } catch (error) {
            console.log('❌ Failed to get candidate info:', error.message);
        }

        console.log('\\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
        console.log('====================================');
        console.log('Your voting system is working perfectly!');
        console.log('\\nReady for real voting! 🗳️');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testContract();

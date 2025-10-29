import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupAccounts() {
    const web3 = new Web3('http://localhost:8545');
    
    try {
        console.log('🔑 Setting up accounts for voting...');
        
        // Wait for node to be ready
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const accounts = await web3.eth.getAccounts();
        console.log('📝 Available accounts:', accounts);
        
        if (accounts.length === 0) {
            console.log('❌ No accounts found. The nodes need to be started with pre-funded accounts.');
            return;
        }
        
        // Check balances
        for (let i = 0; i < accounts.length; i++) {
            const balance = await web3.eth.getBalance(accounts[i]);
            console.log(\   Account \: \ - \ ETH\);
        }
        
        // Save account info for the dapp
        const accountInfo = {
            admin: accounts[0],
            voters: accounts.slice(1, 6), // Use next 5 accounts as voters
            timestamp: new Date().toISOString()
        };
        
        const accountPath = path.resolve(__dirname, '../artifacts/account-info.json');
        fs.writeFileSync(accountPath, JSON.stringify(accountInfo, null, 2));
        
        console.log('✅ Account info saved to artifacts/account-info.json');
        console.log('👤 Admin account:', accountInfo.admin);
        console.log('🗳️  Voter accounts:', accountInfo.voters);
        
    } catch (error) {
        console.error('❌ Account setup failed:', error.message);
    }
}

setupAccounts();

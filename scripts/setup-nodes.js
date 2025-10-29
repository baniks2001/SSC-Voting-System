import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

async function setupBlockchain() {
    console.log('🚀 Setting up blockchain nodes...');
    
    try {
        // Kill any existing nodes
        console.log('🛑 Stopping any running nodes...');
        try {
            await execAsync('taskkill /IM geth.exe /F');
        } catch (e) {
            // Ignore errors if no processes to kill
        }
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Start nodes
        console.log('🔧 Starting Node 1...');
        const node1Process = exec('cd blockchain && start-node1.bat', { detached: true });
        
        console.log('⏳ Waiting for Node 1 to start...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        console.log('🔧 Starting Node 2...');
        const node2Process = exec('cd blockchain && start-node2.bat', { detached: true });
        
        console.log('⏳ Waiting for nodes to initialize...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        // Test connection
        console.log('🔌 Testing connection to Node 1...');
        const web3 = new Web3('http://localhost:8545');
        
        let retries = 10;
        while (retries > 0) {
            try {
                const listening = await web3.eth.net.isListening();
                if (listening) {
                    console.log('✅ Node 1 is listening!');
                    break;
                }
            } catch (error) {
                console.log('⏳ Waiting for node to respond... (' + retries + ' retries left)');
                await new Promise(resolve => setTimeout(resolve, 3000));
                retries--;
            }
        }
        
        if (retries === 0) {
            throw new Error('Node failed to start within timeout');
        }
        
        // Check accounts
        const accounts = await web3.eth.getAccounts();
        console.log('📝 Available accounts:', accounts.length);
        
        if (accounts.length > 0) {
            for (let i = 0; i < accounts.length; i++) {
                const balance = await web3.eth.getBalance(accounts[i]);
                console.log('   Account ' + i + ': ' + accounts[i] + ' - Balance: ' + web3.utils.fromWei(balance, 'ether') + ' ETH');
            }
        } else {
            console.log('❌ No accounts found. Checking miner status...');
            const isMining = await web3.eth.isMining();
            console.log('⛏️  Mining status:', isMining);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        return false;
    }
}

setupBlockchain();

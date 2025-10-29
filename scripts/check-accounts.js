import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkAccounts() {
    console.log('Checking accounts on Node 1...');
    
    const web3 = new Web3('http://localhost:8545');
    
    try {
        // Check connection
        const listening = await web3.eth.net.isListening();
        console.log('Node is listening:', listening);
        
        // Get accounts
        const accounts = await web3.eth.getAccounts();
        console.log('Available accounts:', accounts);
        console.log('Account count:', accounts.length);
        
        if (accounts.length > 0) {
            for (let i = 0; i < accounts.length; i++) {
                const balance = await web3.eth.getBalance(accounts[i]);
                console.log('   Account ' + i + ': ' + accounts[i] + ' - Balance: ' + web3.utils.fromWei(balance, 'ether') + ' ETH');
            }
        } else {
            console.log('No accounts available. The unlock might have failed.');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkAccounts();

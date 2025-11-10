import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';

console.log('🔧 Setting up accounts for mining...');

// Create password file
if (!existsSync('password.txt')) {
    writeFileSync('password.txt', 'password123');
    console.log('✅ Created password.txt');
}

// Import accounts with private keys
try {
    console.log('📝 Setting up Node 1 account...');
    const privateKey1 = '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
    writeFileSync('node1_key.txt', privateKey1);
    execSync(`geth --datadir node1 account import --password password.txt node1_key.txt`, { stdio: 'inherit' });
    
    console.log('📝 Setting up Node 2 account...');
    const privateKey2 = '6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1';
    writeFileSync('node2_key.txt', privateKey2);
    execSync(`geth --datadir node2 account import --password password.txt node2_key.txt`, { stdio: 'inherit' });
    
    console.log('✅ Accounts setup complete!');
} catch (error) {
    console.log('ℹ️  Accounts may already exist:', error.message);
}
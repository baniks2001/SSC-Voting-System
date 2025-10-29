const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

console.log('🚀 Starting 2 Ethereum Nodes for Decentralized Voting System...');

// Use the correct path since scripts are now in blockchain folder
const scriptPath = __dirname;

// Start Node 1
console.log('🔧 Starting Node 1...');
const node1 = spawn('sh', ['start-node1.sh'], {
  cwd: scriptPath,
  stdio: 'inherit'
});

// Start Node 2 after a short delay
setTimeout(() => {
  console.log('🔧 Starting Node 2...');
  const node2 = spawn('sh', ['start-node2.sh'], {
    cwd: scriptPath,
    stdio: 'inherit'
  });
}, 5000);

console.log('✅ Nodes starting on:');
console.log('   Node 1: http://localhost:8545');
console.log('   Node 2: http://localhost:8547');
console.log('   Prefunded Accounts:');
console.log('   - 7e5fde38f1233b19e4b7653a5a335a1e3b97a9e1 (Node 1)');
console.log('   - 8e6fde38f1233b19e4b7653a5a335a1e3b97a9e2 (Node 2)');
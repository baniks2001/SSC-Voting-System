#!/bin/bash

echo "📊 Blockchain Information"

# Get account info
ACCOUNT_FILE=$(ls data/keystore/ 2>/dev/null | head -1)
if [ -z "$ACCOUNT_FILE" ]; then
    echo "❌ No accounts found"
else
    ACCOUNT_ADDRESS=$(echo $ACCOUNT_FILE | grep -o '[a-fA-F0-9]\{40\}')
    echo "✅ Account: 0x$ACCOUNT_ADDRESS"
fi

# Test connection to running node
echo "🔌 Testing connection to node..."
curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":1}' \
  http://localhost:8545 > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Node is running on port 8545"
    
    # Get basic info
    node << 'EOF'
    const Web3 = require('web3');
    const web3 = new Web3('http://localhost:8545');
    
    async function getInfo() {
        try {
            const accounts = await web3.eth.getAccounts();
            const blockNumber = await web3.eth.getBlockNumber();
            
            if (accounts.length > 0) {
                const balance = await web3.eth.getBalance(accounts[0]);
                console.log("📦 Current block: " + blockNumber);
                console.log("💰 Balance: " + web3.utils.fromWei(balance, 'ether') + " ETH");
                console.log("👤 Available accounts: " + accounts.length);
            }
        } catch (error) {
            console.log("❌ Could not connect to node: " + error.message);
        }
    }
    getInfo();
EOF
else
    echo "❌ Node is not running or not accessible"
    echo "💡 Start the node with: ./start.sh"
fi
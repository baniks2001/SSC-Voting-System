#!/bin/bash

echo "🚀 Setting up Ethereum blockchain in existing directory..."

# Check if we're in the right directory
if [ ! -d "." ]; then
    echo "❌ Please run this script from your blockchain directory"
    exit 1
fi

# Create PoS-compatible genesis.json
cat > genesis.json << 'EOF'
{
  "config": {
    "chainId": 1337,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "berlinBlock": 0,
    "londonBlock": 0,
    "mergeNetsplitBlock": 0,
    "terminalTotalDifficulty": 0,
    "terminalTotalDifficultyPassed": true
  },
  "alloc": {},
  "difficulty": "0x1",
  "gasLimit": "0x1C9C380"
}
EOF
echo "✅ Created PoS-compatible genesis.json"

# Remove existing chaindata to start fresh
if [ -d "data/geth" ]; then
    echo "🔄 Removing existing blockchain data..."
    rm -rf data/geth
fi

# Initialize blockchain
echo "📦 Initializing blockchain..."
geth --datadir ./data init genesis.json

if [ $? -eq 0 ]; then
    echo "✅ Blockchain initialized successfully!"
else
    echo "❌ Failed to initialize blockchain"
    exit 1
fi

# Check if account already exists
if [ -d "data/keystore" ] && [ "$(ls -A data/keystore 2>/dev/null)" ]; then
    echo "✅ Account already exists"
    ACCOUNT_FILE=$(ls data/keystore/ | head -1)
    ACCOUNT_ADDRESS=$(echo $ACCOUNT_FILE | grep -o '[a-fA-F0-9]\{40\}')
    echo "📝 Existing account: 0x$ACCOUNT_ADDRESS"
else
    # Create new account automatically
    echo "👤 Creating new account for voting system..."
    
    # Create a secure password
    PASSWORD="voting-system-password-$(date +%s)"
    echo $PASSWORD > password.txt
    echo "🔐 Generated password and saved to password.txt"
    
    # Create the account
    geth --datadir ./data --password password.txt account new
    
    if [ $? -eq 0 ]; then
        ACCOUNT_FILE=$(ls data/keystore/ | head -1)
        ACCOUNT_ADDRESS=$(echo $ACCOUNT_FILE | grep -o '[a-fA-F0-9]\{40\}')
        echo "✅ Account created: 0x$ACCOUNT_ADDRESS"
    else
        echo "❌ Failed to create account automatically"
        echo "💡 Please create account manually when prompted:"
        geth --datadir ./data account new
        if [ $? -eq 0 ]; then
            ACCOUNT_FILE=$(ls data/keystore/ | head -1)
            ACCOUNT_ADDRESS=$(echo $ACCOUNT_FILE | grep -o '[a-fA-F0-9]\{40\}')
            echo "✅ Account created: 0x$ACCOUNT_ADDRESS"
            echo "Please enter the password you used:"
            read -s MANUAL_PASSWORD
            echo $MANUAL_PASSWORD > password.txt
            echo "🔐 Password saved to password.txt"
        else
            echo "❌ Failed to create account"
            exit 1
        fi
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo "📋 Summary:"
echo "   - Chain ID: 1337"
echo "   - Account: 0x$ACCOUNT_ADDRESS"
echo "   - Network: Private Ethereum"
echo ""
echo "Next: Run ./start.sh to start the node"
#!/bin/bash

echo "🚀 Setting up Ethereum blockchain in existing directory..."

# Check if we're in the right directory
if [ ! -d "." ]; then
    echo "❌ Please run this script from your blockchain directory"
    exit 1
fi

# Create minimal genesis.json
cat > genesis.json << 'EOF'
{
  "config": {
    "chainId": 1337
  },
  "difficulty": "0x400",
  "gasLimit": "0x8000000"
}
EOF
echo "✅ Created genesis.json"

# Remove existing chaindata to start fresh (optional)
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
    echo "💡 Try: rm -rf data/geth and run setup again"
    exit 1
fi

# Check if account already exists
if [ -d "data/keystore" ] && [ "$(ls -A data/keystore 2>/dev/null)" ]; then
    echo "✅ Account already exists"
    ACCOUNT_FILE=$(ls data/keystore/ | head -1)
    ACCOUNT_ADDRESS=$(echo $ACCOUNT_FILE | grep -o '[a-fA-F0-9]\{40\}')
    echo "📝 Existing account: 0x$ACCOUNT_ADDRESS"
else
    # Create new account
    echo "👤 Creating new account for voting system..."
    echo "Please enter a password for your account:"
    read -s PASSWORD
    echo $PASSWORD > password.txt
    
    geth --datadir ./data --password password.txt account new
    
    if [ $? -eq 0 ]; then
        ACCOUNT_FILE=$(ls data/keystore/ | head -1)
        ACCOUNT_ADDRESS=$(echo $ACCOUNT_FILE | grep -o '[a-fA-F0-9]\{40\}')
        echo "✅ Account created: 0x$ACCOUNT_ADDRESS"
    else
        echo "❌ Failed to create account"
        rm -f password.txt
        exit 1
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo "Next: Run ./start.sh to start the node"
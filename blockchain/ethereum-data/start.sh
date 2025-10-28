#!/bin/bash

echo "🔗 Starting Ethereum node from current directory..."

# Check if setup is complete
if [ ! -d "data/geth" ]; then
    echo "❌ Blockchain not initialized. Run ./setup.sh first."
    exit 1
fi

# Get account address dynamically
ACCOUNT_FILE=$(ls data/keystore/ 2>/dev/null | head -1)
if [ -z "$ACCOUNT_FILE" ]; then
    echo "❌ No accounts found. Run ./setup.sh first."
    exit 1
fi

# Extract account address from keystore file name
ACCOUNT_ADDRESS=$(echo $ACCOUNT_FILE | grep -o '[a-fA-F0-9]\{40\}')
ACCOUNT_ADDRESS="0x$ACCOUNT_ADDRESS"

echo "📝 Account: $ACCOUNT_ADDRESS"
echo "🌐 Starting on: http://localhost:8545"
echo "🔗 Chain ID: 1337"
echo "📡 Sync mode: full"
echo "🔓 Account will be unlocked"
echo ""

# Check if password file exists
if [ ! -f "password.txt" ]; then
    echo "❌ password.txt not found"
    echo "💡 Creating default password file..."
    echo "voting-system-password-1761640036" > password.txt
    echo "✅ Created password.txt with your password"
fi

echo "🔐 Using password from password.txt"

# Start geth with ALL necessary APIs including personal
echo "🚀 Starting Geth with account unlocking..."
exec geth --datadir ./data \
  --networkid 1337 \
  --http \
  --http.addr "0.0.0.0" \
  --http.port 8545 \
  --http.api "web3,eth,net,personal,miner,admin,txpool" \
  --http.corsdomain "*" \
  --syncmode "full" \
  --nodiscover \
  --allow-insecure-unlock \
  --unlock "$ACCOUNT_ADDRESS" \
  --password ./password.txt \
  --mine \
  --miner.etherbase "$ACCOUNT_ADDRESS" \
  --verbosity 3
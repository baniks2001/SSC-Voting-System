#!/bin/bash

echo "🔗 Starting Ethereum node from current directory..."

# Check if setup is complete
if [ ! -d "data/geth" ]; then
    echo "❌ Blockchain not initialized. Run ./setup.sh first."
    exit 1
fi

# Get account address
ACCOUNT_FILE=$(ls data/keystore/ 2>/dev/null | head -1)
if [ -z "$ACCOUNT_FILE" ]; then
    echo "❌ No accounts found. Run ./setup.sh first."
    exit 1
fi

ACCOUNT_ADDRESS=$(echo $ACCOUNT_FILE | grep -o '[a-fA-F0-9]\{40\}')
ACCOUNT_ADDRESS="0x$ACCOUNT_ADDRESS"

echo "📝 Account: $ACCOUNT_ADDRESS"
echo "🌐 Starting on: http://localhost:8545"
echo "🔗 Chain ID: 1337"
echo "📡 Sync mode: full"
echo ""

# Start geth without deprecated flags
exec geth --datadir ./data \
    --networkid 1337 \
    --http \
    --http.addr "0.0.0.0" \
    --http.port 8545 \
    --http.api "web3,eth,net" \
    --http.corsdomain "*" \
    --syncmode "full" \
    --nodiscover
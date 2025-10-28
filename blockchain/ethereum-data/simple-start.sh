#!/bin/bash

echo "🔗 Simple Ethereum Node Starter"

# Check if setup was done
if [ ! -f "genesis.json" ] || [ ! -d "data/keystore" ]; then
    echo "❌ Please run ./setup.sh first"
    exit 1
fi

# Get account
ACCOUNT_FILE=$(ls data/keystore/ | head -1)
ACCOUNT=$(echo $ACCOUNT_FILE | grep -o '[a-fA-F0-9]\{40\}')
echo "Account: 0x$ACCOUNT"

# Simple geth command
echo "Starting Geth (this may take a moment)..."
geth --datadir ./data --networkid 1337 --http --http.port 8545 --http.api "web3,eth,net" --http.corsdomain "*" --allow-insecure-unlock --mine --miner.threads 1 --nodiscover
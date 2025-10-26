#!/bin/bash
echo "Starting Ethereum private network..."

# Check if genesis exists, create if not
if [ ! -f "genesis.json" ]; then
    cat > genesis.json << 'EOF'
{
  "config": {
    "chainId": 1337
  },
  "difficulty": "0x400",
  "gasLimit": "0x8000000"
}
EOF
    echo "Created genesis.json"
fi

# Remove existing chain data to ensure clean start
if [ -d "data/geth" ]; then
    echo "Removing existing blockchain data..."
    rm -rf data/geth
fi

# Initialize blockchain
echo "Initializing blockchain..."
geth --datadir ./data init genesis.json

# Start geth
echo "Starting geth node..."
exec geth --datadir ./data --networkid 1337 --http --http.port 8545 --http.api "web3,eth,net,miner" --nodiscover console
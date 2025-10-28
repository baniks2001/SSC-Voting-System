#!/bin/bash

echo "🔄 Resetting blockchain data..."

read -p "⚠️  This will delete ALL blockchain data. Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Reset cancelled"
    exit 1
fi

# Backup keystore only
if [ -d "data/keystore" ]; then
    echo "💾 Backing up keystore..."
    mkdir -p backup
    cp -r data/keystore backup/ 2>/dev/null || true
fi

# Remove data directory
echo "🗑️  Removing blockchain data..."
rm -rf data/geth data/chaindata

# Re-initialize blockchain
echo "📦 Re-initializing blockchain..."
geth --datadir ./data init genesis.json

# Restore keystore if backed up
if [ -d "backup/keystore" ]; then
    echo "💾 Restoring keystore..."
    mkdir -p data/keystore
    cp -r backup/keystore/* data/keystore/ 2>/dev/null || true
    rm -rf backup
fi

echo "✅ Reset complete!"
echo "💡 Run ./start.sh to start the node"
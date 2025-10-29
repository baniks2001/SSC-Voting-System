@echo off
echo 🚀 Starting Ethereum Node 1...

REM Initialize if needed
if not exist "node1\geth" (
    echo 📦 Initializing Node 1 with genesis block...
    geth --datadir node1 init node1\genesis.json
)

echo 🔑 Starting Node 1...
geth --datadir node1 --networkid 1337 --port 30303 --http --http.port 8545 --http.addr 0.0.0.0 --http.corsdomain "*" --http.api "web3,eth,net,personal,admin,debug" --ipcdisable --allow-insecure-unlock --unlock "0x7e5fde38f1233b19e4b7653a5a335a1e3b97a9e1" --password password.txt console

pause
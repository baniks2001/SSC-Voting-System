@echo off
title Ethereum Node 2 - Port 8547
echo ========================================
echo    NODE 2 - ETHEREUM DEV NODE
echo ========================================
echo.
echo Starting Node 2 with DATA PERSISTENCE...
echo HTTP: http://localhost:8547
echo Data Dir: node2
echo.

REM Create data directory if it doesn't exist
if not exist "node2" mkdir node2

REM Initialize if first time
if not exist "node2\geth\chaindata" (
    echo [INIT] Initializing Node 2 with genesis block...
    geth --datadir node2 init genesis.json
    if errorlevel 1 (
        echo [ERROR] Failed to initialize Node 2
        pause
        exit /b 1
    )
)

echo [START] Launching Geth for Node 2 with persistent data...
echo.

geth --datadir node2 ^
     --networkid 1337 ^
     --port 30304 ^
     --authrpc.port 8552 ^
     --http ^
     --http.port 8547 ^
     --http.addr 0.0.0.0 ^
     --http.corsdomain "*" ^
     --http.api "web3,eth,net,admin,debug,txpool,miner,personal" ^
     --ws ^
     --ws.port 8548 ^
     --ws.addr 0.0.0.0 ^
     --ws.api "web3,eth,net,admin,debug,personal" ^
     --syncmode "full" ^
     --gcmode "archive" ^
     --cache 1024 ^
     --maxpeers 10 ^
     --bootnodes "enode://dd33a17c185bcde4b275164810ebb23a0374034937d7d6f4b19fa42c5c0bdeb170d1dacd1fed67b89a00eb091b0b18a7486af3cc19ec07821eb4a74054ab6a00@127.0.0.1:30303" ^
     --nat "any" ^
     --metrics ^
     --pprof ^
     --pprof.addr 0.0.0.0 ^
     --pprof.port 6061 ^
     --ipcdisable ^
     --mine ^
     --miner.etherbase "0x8e6fde38f1233b19e4b7653a5a335a1e3b97a9e2" ^
     --miner.gasprice 0 ^
     --miner.gaslimit 30000000 ^
     --unlock "0x8e6fde38f1233b19e4b7653a5a335a1e3b97a9e2" ^
     --password password.txt ^
     console

echo.
echo [INFO] Node 2 has been shut down.
echo Data preserved in: node2\geth\chaindata
echo Press any key to close this window...
pause >nul
@echo off
title Ethereum Node 1 - Port 8545
echo ========================================
echo    NODE 1 - ETHEREUM DEV NODE
echo ========================================
echo.
echo Starting Node 1 with DATA PERSISTENCE...
echo HTTP: http://localhost:8545
echo Data Dir: node1
echo.

REM Create data directory if it doesn't exist
if not exist "node1" mkdir node1

REM Initialize if first time
if not exist "node1\geth\chaindata" (
    echo [INIT] Initializing Node 1 with genesis block...
    geth --datadir node1 init genesis.json
    if errorlevel 1 (
        echo [ERROR] Failed to initialize Node 1
        pause
        exit /b 1
    )
)

echo [START] Launching Geth for Node 1 with persistent data...
echo.

geth --datadir node1 ^
     --networkid 1337 ^
     --port 30303 ^
     --authrpc.port 8551 ^
     --http ^
     --http.port 8545 ^
     --http.addr 0.0.0.0 ^
     --http.corsdomain "*" ^
     --http.api "web3,eth,net,admin,debug,txpool,miner,personal" ^
     --ws ^
     --ws.port 8546 ^
     --ws.addr 0.0.0.0 ^
     --ws.api "web3,eth,net,admin,debug,personal" ^
     --syncmode "full" ^
     --gcmode "archive" ^
     --cache 1024 ^
     --maxpeers 10 ^
     --bootnodes "enode://318132573e47aaa472e94c255b2852c9d27bad24a680fc6d3606219dc817b6ce686bbaede7fdfd75d91cb7cb7e573fae01d10956b54bf3f0312a6a1ce62c4c6f@127.0.0.1:30304" ^
     --nat "any" ^
     --metrics ^
     --pprof ^
     --pprof.addr 0.0.0.0 ^
     --pprof.port 6060 ^
     --ipcdisable ^
     --mine ^
     --miner.etherbase "0x7e5fde38f1233b19e4b7653a5a335a1e3b97a9e1" ^
     --miner.gasprice 0 ^
     --miner.gaslimit 30000000 ^
     --unlock "0x7e5fde38f1233b19e4b7653a5a335a1e3b97a9e1" ^
     --password password.txt ^
     console

echo.
echo [INFO] Node 1 has been shut down.
echo Data preserved in: node1\geth\chaindata
echo Press any key to close this window...
pause >nul
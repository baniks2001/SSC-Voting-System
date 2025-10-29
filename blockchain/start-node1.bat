@echo off
echo ========================================
echo ?? NODE 1 - DEVELOPER MODE
echo ========================================
echo.
echo ?? Creating account with unlimited ETH...
echo ??  Starting automatic mining...
echo ?? HTTP: http://localhost:8545
echo.
geth --dev --datadir node1 --http --http.port 8545 --http.addr 0.0.0.0 --http.corsdomain "*" --http.api "web3,eth,net,personal,miner,admin,debug" --ipcdisable console
echo.
pause

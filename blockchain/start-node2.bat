@echo off  
echo ========================================
echo ?? NODE 2 - DEVELOPER MODE
echo ========================================
echo.
echo ?? Creating account with unlimited ETH...
echo ??  Starting automatic mining...
echo ?? HTTP: http://localhost:8547
echo.
geth --dev --datadir node2 --http --http.port 8547 --http.addr 0.0.0.0 --http.corsdomain "*" --http.api "web3,eth,net,personal,miner,admin,debug" --ipcdisable console
echo.
pause

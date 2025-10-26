import Web3 from 'web3';

export const initializeWeb3 = async (): Promise<Web3 | null> => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return new Web3(window.ethereum);
    } catch (error) {
      console.error('User denied account access');
      return null;
    }
  } else {
    console.log('Please install MetaMask!');
    return null;
  }
};

export const getCurrentAccount = async (web3: Web3): Promise<string> => {
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
};

export const getNetworkId = async (web3: Web3): Promise<number> => {
  const networkId = await web3.eth.net.getId();
  return Number(networkId); // Convert bigint to number
};

export const getBlockNumber = async (web3: Web3): Promise<number> => {
  const blockNumber = await web3.eth.getBlockNumber();
  return Number(blockNumber); // Convert bigint to number
};

export const getBalance = async (web3: Web3, address: string): Promise<string> => {
  const balanceWei = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balanceWei, 'ether');
};

export const sendTransaction = async (
  web3: Web3, 
  from: string, 
  to: string, 
  value: string
): Promise<any> => {
  const transaction = {
    from,
    to,
    value: web3.utils.toWei(value, 'ether'),
    gas: 21000
  };

  return await web3.eth.sendTransaction(transaction);
};

// Smart contract interaction helper
export const callContractMethod = async (
  web3: Web3,
  contractAddress: string,
  abi: any[],
  methodName: string,
  args: any[] = [],
  from?: string
): Promise<any> => {
  const contract = new web3.eth.Contract(abi, contractAddress);
  return await contract.methods[methodName](...args).call({ from });
};

// Send transaction to smart contract
export const sendContractTransaction = async (
  web3: Web3,
  contractAddress: string,
  abi: any[],
  methodName: string,
  args: any[] = [],
  from: string,
  value: string = '0'
): Promise<any> => {
  const contract = new web3.eth.Contract(abi, contractAddress);
  const transaction = contract.methods[methodName](...args);
  
  const gas = await transaction.estimateGas({ from, value });
  
  return await transaction.send({
    from,
    value,
    gas: Number(gas) // Convert bigint to number
  });
};
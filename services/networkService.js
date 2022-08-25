import { getExchangeContract, getTokenContract } from "./web3Service";
import EnvConfig from "../configs/env";
import detectEthereumProvider from '@metamask/detect-provider';

export const loadWeb3 = async () => {
  ethereum.enable()
  let web3;
  const provider = await detectEthereumProvider();

  if (provider) {
    web3 = new Web3(provider);
    return web3;
  }
};

export const getAccount = async () => {
  const provider = await detectEthereumProvider();
  const accounts = await provider.request({
    method: 'eth_accounts'
  })
  if (accounts.length) {
    return (accounts[0]);
  }
  return;
}
export const getExchangeContractProvider = async (abiOfToken, addressOfToken) => {
  const web3 = await loadWeb3();
  if (!web3) {
    return false;
  }
  const tokenContract = new web3.eth.Contract(abiOfToken, addressOfToken);
  return tokenContract;
};
export async function doSwap(srcTokenAddress, destTokenAddress, account, amount, amountEth) {
  await window.ethereum.enable()
  const exchangeContract = await getExchangeContractProvider(EnvConfig.EXCHANGE_CONTRACT_ABI, EnvConfig.EXCHANGE_CONTRACT_ADDRESS)
  console.log(exchangeContract)
  const sellerAddress = await getAccount();
  const exTx = await exchangeContract.methods
    .exchangeTokens(srcTokenAddress, destTokenAddress, amountEth.toString())
  console.log(exTx);
  return exTx.send({ from: sellerAddress, value: amountEth.toString() }).on('transactionHash', function (hash) {
    console.log("hash:");
    console.log(hash);
    return hash
  })
}
export async function doApprove(tokenAddress, amount, spender, web3, fn) {
  await window.ethereum.enable()
  web3 = new Web3(window.ethereum)
  const sellerAddress = await getAccount();
  const tokenContract = await getExchangeContractProvider(EnvConfig.TOKEN_TA_ABI, tokenAddress);
  console.log(amount);
  return await tokenContract.methods.approve(spender, amount.toString()).send({ from: sellerAddress }).on('transactionHash', function (hash) {
    console.log("hash:");
    console.log(hash);
    return hash
  })
}

export async function doTransfer(srcTokenAddress, receiver, amount) {
  await window.ethereum.enable()
  web3 = new Web3(window.ethereum)
  const sellerAddress = await getAccount();
  const tokenContract = await getExchangeContractProvider(EnvConfig.TOKEN_TA_ABI, srcTokenAddress);
  return await tokenContract.methods.transfer(receiver, amount.toString()).send({ from: sellerAddress }).on('transactionHash', function (hash) {
    console.log("hash:");
    console.log(hash);
    return hash
  })
}


export function getTransferABI(data) {
  /*TODO: Get Transfer ABI*/
  let minABI = [
    // transfer
    {
      "constant": false,
      "inputs": [
        {
          "name": "_to",
          "type": "address"
        },
        {
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "type": "function"
    }
  ];
  return minABI;
}



export function getAllowance(srcTokenAddress, address, spender) {
  /*TODO: Get current allowance for a token in user wallet*/
}

/* Get Exchange Rate from Smart Contract */
export async function getExchangeRate(srcTokenAddress, destTokenAddress, srcAmount) {
  const exchangeContract = getExchangeContract();

  return new Promise((resolve, reject) => {
    exchangeContract.methods.getExchangeRate(srcTokenAddress, destTokenAddress, srcAmount).call().then((result) => {
      console.log("result: ", result);

      resolve(result)
    }, (error) => {
      reject(error);
    })
  })
}

export async function getTokenBalances(tokenAddress, _walletAddress, fn) {
  /*TODO: Get Token Balance*/
  let walletAddress = _walletAddress;
  // The minimum ABI to get ERC20 Token balance
  let minABI = EnvConfig.TOKEN_ABI;
  // Get ERC20 Token contract instance
  let contract = web3.eth.contract(minABI).at(tokenAddress);

  let balanceTemp = await contract.balanceOf(walletAddress, (error, balance) => {
    // console.log('balance1 ' + balance);
    // return balance;
    fn(balance);
  });
}
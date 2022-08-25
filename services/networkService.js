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
  exTx.send({ from: sellerAddress, value: amountEth.toString() })
}

export function doSwaps(srcTokenAddress, destTokenAddress, account, amount, amountEth) {
  window.ethereum.enable()
  let web3 = new Web3(window.ethereum)
  const exchangeContract = new web3.eth.Contract(EnvConfig.EXCHANGE_CONTRACT_ABI, EnvConfig.EXCHANGE_CONTRACT_ADDRESS)
  console.log(exchangeContract)
  const sellerAddress = web3.eth.getAccounts().then(accounts => {
    console.log(`Updating USER from ${this.currentUser} to ${accounts[0]}`)
    return accounts[0]
   })
  const exTx = exchangeContract.methods
    .exchangeTokens(srcTokenAddress, destTokenAddress, amount.toString())
    .send({ from: sellerAddress }).then(console.log)
  console.log(exTx);
}
export function calculateEstimateGasExchangeToken(srcTokenAddress, destTokenAddress, account, amount, web3, fn) {
  const exchangeContract = web3.eth.contract(EnvConfig.EXCHANGE_CONTRACT_ABI).at(EnvConfig.EXCHANGE_CONTRACT_ADDRESS);
  exchangeContract.exchangeTokens.estimateGas(srcTokenAddress, destTokenAddress, amount.toString(), { from: account, value: amount.toString() },
    function (result, error) {
      fn(error, result);
    }
  )
}

export function calculateEstimateGasApprove(srcTokenAddress, amount, spender, web3, fn) {
  const tokenContract = web3.eth.contract(EnvConfig.TOKEN_ABI).at(srcTokenAddress);
  tokenContract.approve.estimateGas(spender, amount,
    function (result, error) {
      fn(error, result);
    }
  )
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

export function doApprove(tokenAddress, amount, spender, web3, fn) {
  /*TODO: Get Approve ABI*/
  // const tokenContract = getTokenContract(tokenAddress);
  var web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER));
  const tokenContract = new web3.eth.Contract(EnvConfig.TOKEN_ABI).at(tokenAddress);
  return new Promise((resolve, reject) => {
    tokenContract.approve(spender, amount.toString(),
      function (result, error) {
        fn(error, result);
      }
    )
  })
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
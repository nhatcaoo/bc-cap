import {
  getExchangeRate, getTokenBalances,
  doApprove, doSwap,
} from "./services/networkService";
import EnvConfig from "./configs/env";
import { getWeb3Instance } from "./services/web3Service";
import BigNumber from "./node_modules/bignumber.js"
var balanceEth;
var balanceTa;
var balanceTb;
var account;
var currentSrcToken;
var amountSrcToken;
var nativeToken = EnvConfig.TOKENS[0];
let web3;

// $(window).on('load', function () {
//   window.ethereum.autoRefreshOnNetworkChange = false;
//   ethereum.autoRefreshOnNetworkChange = false;
// });
$(document).ready(function () {
  window.ethereum.autoRefreshOnNetworkChange = false;
  ethereum.autoRefreshOnNetworkChange = false;
})
// interval get information in wallet
function doInterval() {
  getAddress();
  // getAmountEth();
  //getAmountToken();
}

function getAddress() {
  if (web3 != null) {

    // console.log(web3.currentProvider.selectedAddress);
    $('#accountInfor').removeClass('d-none');
    $('#accountInforTransfer').removeClass('d-none');
    let accountInfor = web3.currentProvider.selectedAddress;
    account = accountInfor;

    let compressAccount = accountInfor.substring(0, 10) + "..." + accountInfor.substring(accountInfor.length - 5, accountInfor.length);
    // console.log("Address: " + compressAccount);

    $('#addressInfor').html("Address: " + compressAccount);
    $('#addressInforTransfer').html("Address: " + compressAccount);
    /*
    let balanceEth = web3.eth.getBalance(accountInfor) / Math.pow(10, 18);
    if (currentSrcToken.symbol === 'ETH') {
      $('#amountInfor').html($('#selected-src-symbol').text() + ": " + balanceEth);
      $('#amountInforTransfer').html($('#selected-transfer-token').text() + ": " + balanceEth);
      amountSrcToken = balanceEth;
    }

    var setValueTa = function (value) {
      balanceTa = value;
    }
    var setValueTb = function (value) {
      balanceTb = value;
    }
    getTokenBalances('TA', account, setValueTa);
    getTokenBalances('TB', account, setValueTb);
    if (currentSrcToken !== undefined && currentSrcToken.symbol === 'AT') {
      $('#amountInfor').html($('#selected-src-symbol').text() + ": " + balanceTa / Math.pow(10, 18));
      $('#amountInforTransfer').html($('#selected-transfer-token').text() + ": " + balanceTa / Math.pow(10, 18));
      amountSrcToken = balanceTa / Math.pow(10, 18);
    }
    if (currentSrcToken !== undefined && currentSrcToken.symbol === 'BT') {
      $('#amountInfor').html($('#selected-src-symbol').text() + ": " + balanceTb / Math.pow(10, 18));
      $('#amountInforTransfer').html($('#selected-transfer-token').text() + ": " + balanceTb / Math.pow(10, 18));
      amountSrcToken = balanceTb / Math.pow(10, 18);
    }
    */
  }
}
function getAmountEth() {
  if (web3.currentProvider.selectedAddress != null && currentSrcToken !== undefined) {
    web3.eth.getBalance(web3.currentProvider.selectedAddress, (err, wei) => {
      // balance = web3.utils.fromWei(wei, 'ether') 
      if (wei !== 'undefined') {
        // console.log($('#selected-src-symbol').text() + ": " + wei / Math.pow(10, 18));
        balanceEth = wei / Math.pow(10, 18);
        if (currentSrcToken.symbol === 'ETH') {
          $('#amountInfor').html($('#selected-src-symbol').text() + ": " + wei / Math.pow(10, 18));
          $('#amountInforTransfer').html($('#selected-transfer-token').text() + ": " + wei / Math.pow(10, 18));
          amountSrcToken = wei / Math.pow(10, 18);
        }
      }
      // return wei/Math.pow(10,18);
    });
  }
}
function getAmountToken() {

  if (web3.currentProvider.selectedAddress != null) {
    var setValueTa = function (value) {
      balanceTa = value;
    }
    var setValueTb = function (value) {
      balanceTb = value;
    }
    const srcToken = findTokenBySymbol($('#selected-src-symbol').text());
    const destToken = findTokenBySymbol($('#selected-dest-symbol').text());

    getTokenBalances(findTokenBySymbol('AT').address, account, setValueTa);
    getTokenBalances(findTokenBySymbol('BT').address, account, setValueTb);

    function setAmountInfo(currentDisplay) {
      $('#amountInfor').html($('#selected-src-symbol').text() + ": " + currentDisplay / Math.pow(10, 18));
      $('#amountInforTransfer').html($('#selected-transfer-token').text() + ": " + currentDisplay / Math.pow(10, 18));
      amountSrcToken = currentDisplay / Math.pow(10, 18);
    }
    if (currentSrcToken !== undefined && currentSrcToken.symbol === 'AT') {
      setAmountInfo(balanceTa);
    }
    if (currentSrcToken !== undefined && currentSrcToken.symbol === 'BT') {
      setAmountInfo(balanceTb);
    }
  }
}

setInterval(doInterval, 100); // Time in milliseconds


// validate input in transfer tab
async function alertErrorTransferTab(errorMessage) {
  // $('.alert').show('fade');
  $('#messageErrorTransfer').html(errorMessage);
  console.log('error')
  $('#alert-transfer-tab').removeClass('fade');
  await timeout(4000);
  $('#alert-transfer-tab').addClass('fade');
}
function isValidNumberInputSourceTransfer() {
  return (!isNaN($('#transfer-source-amount').val()));
}
function isValidAddressInputAddressTransfer() {
  return getWeb3Instance().utils.isAddress($('#transfer-address').val());
}
function isInputInRangeTransferTab() {
  let number = $('#transfer-source-amount').val();
  let max = amountSrcToken;
  if (number <= 0 || number > max) {
    return false;
  }
  return true;
}
function validateTransfer() {
  if (!isValidNumberInputSourceTransfer()) {
    alertErrorTransferTab('Invalid number');
    return false;
  }
  if (!isValidAddressInputAddressTransfer()) {
    alertErrorTransferTab('Invalid address');
    return false;
  }
  if (!isInputInRangeTransferTab()) {
    alertErrorTransferTab('Please enter number greater than 0, less than current balance');
    return false;
  }
  return true
}


//set up modal transaction status
function setModal(textColor, statusTx, transactionAddress) {
  function removeClass(index, className) {
    return (className.match(/\btext-\S+/g) || []).join(' ');
  }
  $('#contain-status-modal').removeClass(removeClass);
  if (transactionAddress != null) {
    let addressTxCompress = transactionAddress.substring(0, 10) + "..." + transactionAddress.substring(transactionAddress.length - 5, transactionAddress.length);
    $('#transaction-hash-modal').html(addressTxCompress);
    $('#link-to-ropsten').attr('href', 'https://ropsten.etherscan.io/tx/' + transactionAddress);
    $('#link-to-ropsten').removeClass('d-none');
  } else {
    $('#transaction-hash-modal').html("Processing");
    if (!$('#link-to-ropsten').hasClass('d-none')) {
      $('#link-to-ropsten').addClass('d-none');
    }
  }

  $('#contain-status-modal').addClass(textColor);
  $('#name-status-modal').html(statusTx);
  if (statusTx === 'Success') {
    $('#icon-success-modal').removeClass('d-none');
    $('#spinner-status-modal').addClass('d-none');
  } else {
    if (!$('#icon-success-modal').hasClass('d-none')) {
      $('#icon-success-modal').addClass('d-none');
    }
    if ($('#spinner-status-modal').hasClass('d-none')) {
      $('#spinner-status-modal').removeClass('d-none');
    }

  }
}

function setApproveModal(textColor, statusTx, transactionAddress) {
  function removeClass(index, className) {
    return (className.match(/\btext-\S+/g) || []).join(' ');
  }
  $('#contain-status-approve-mix-modal').removeClass(removeClass);
  if (transactionAddress != null) {
    let addressTxCompress = transactionAddress.substring(0, 10) + "..." + transactionAddress.substring(transactionAddress.length - 5, transactionAddress.length);
    $('#transaction-approve-mix-modal').html(addressTxCompress);
    $('#link-to-ropsten-approve-mix-modal').attr('href', 'https://ropsten.etherscan.io/tx/' + transactionAddress);
    $('#link-to-ropsten-approve-mix-modal').removeClass('d-none');
  } else {
    $('#transaction-approve-mix-modal').html("Processing");
    if (!$('#link-to-ropsten-approve-mix-modal').hasClass('d-none')) {
      $('#link-to-ropsten-approve-mix-modal').addClass('d-none');
    }
  }

  $('#contain-status-approve-mix-modal').addClass(textColor);
  $('#name-status-approve-mix-modal').html(statusTx);
  if (statusTx === 'Success') {
    $('#icon-success-approve-mix-modal').removeClass('d-none');
    $('#spinner-status-approve-mix-modal').addClass('d-none');
  } else {
    if (!$('#icon-success-approve-mix-modal').hasClass('d-none')) {
      $('#icon-success-approve-mix-modal').addClass('d-none');
    }
    if ($('#spinner-status-approve-mix-modal').hasClass('d-none')) {
      $('#spinner-status-approve-mix-modal').removeClass('d-none');
    }

  }
}
function setSwapModal(textColor, statusTx, transactionAddress) {
  function removeClass(index, className) {
    return (className.match(/\btext-\S+/g) || []).join(' ');
  }
  $('#contain-status-swap-mix-modal').removeClass(removeClass);
  if (transactionAddress != null) {
    let addressTxCompress = transactionAddress.substring(0, 10) + "..." + transactionAddress.substring(transactionAddress.length - 5, transactionAddress.length);
    $('#transaction-swap-mix-modal').html(addressTxCompress);
    $('#link-to-ropsten-swap-mix-modal').attr('href', 'https://ropsten.etherscan.io/tx/' + transactionAddress);
    $('#link-to-ropsten-swap-mix-modal').removeClass('d-none');
  } else {
    $('#transaction-swap-mix-modal').html("Processing");
    if (!$('#link-to-ropsten-swap-mix-modal').hasClass('d-none')) {
      $('#link-to-ropsten-swap-mix-modal').addClass('d-none');
    }
  }

  $('#contain-status-swap-mix-modal').addClass(textColor);
  $('#name-status-swap-mix-modal').html(statusTx);
  if (statusTx === 'Success') {
    $('#icon-success-swap-mix-modal').removeClass('d-none');
    $('#spinner-status-swap-mix-modal').addClass('d-none');
  } else {
    if (!$('#icon-success-swap-mix-modal').hasClass('d-none')) {
      $('#icon-success-swap-mix-modal').addClass('d-none');
    }
    if ($('#spinner-status-swap-mix-modal').hasClass('d-none')) {
      $('#spinner-status-swap-mix-modal').removeClass('d-none');
    }

  }
}
// process when click transfer button in transfer tab
$('#transferButton').click(function () {
  if (!validateTransfer()) {
    return;
  }
  let amountToken = $('#transfer-source-amount').val() + " " + $('#selected-transfer-token').html();
  let toAddress = $('#transfer-address').val();
  let compressAccount = toAddress.substring(0, 6) + "..." + toAddress.substring(toAddress.length - 5, toAddress.length);
  $('#amount-transfer-modal').html(amountToken);
  $('#to-address-modal').html(compressAccount);

  let transactionObject = {
    from: account,
    to: $('#transfer-address').val(),
    value: web3.toWei(Number($('#transfer-source-amount').val()), "ether")
  };

  function calculateGasFee(transactionObject) {
    let gasPrice;
    let gasEstimate;
    let gasFee;
    console.log(transactionObject);
    function setGasPrice(err, value) {
      gasPrice = value;
      changGasFee();
      console.log("price main: " + gasPrice);
    }
    function setGasEstimate(err, value) {
      gasEstimate = value;
      changGasFee();
      console.log("estimate main: " + gasEstimate);
    }
    function changGasFee() {
      gasFee = gasPrice * gasEstimate / Math.pow(10, 18);
      console.log("GAS FEE: " + gasFee);
      if (!isNaN(gasFee)) {
        $('#gas-fee-transfer').html(gasFee);
      }
    }
    // web3.eth.getGasPrice((err, result) => setGasPrice(err, result));
    web3.eth.estimateGas(transactionObject, (err, result) => setGasEstimate(err, result));
  }
  calculateGasFee(transactionObject);

  $('#confirm-transfer-modal').modal();

});
$('#confirm-transfer-button').click(function () {
  $('#confirm-transfer-modal').modal('hide');

  // $('#contain-status-modal').addClass('text-secondary');
  // $('#name-status-modal').html('Broadcasting');
  $('#status-transfer-modal').modal('show');
  setModal('text-secondary', 'Broadcasting');



  if (account != null && account !== 'undefined') {
    if (currentSrcToken.symbol === 'ETH') {

      let transactionObject = {
        from: account,
        to: $('#transfer-address').val(),
        value: web3.toWei(Number($('#transfer-source-amount').val()), "ether")
      };




      web3.eth.sendTransaction(transactionObject, function (err, transactionHash) {
        if (!err) {
          console.log(transactionHash + " success");
          setModal('text-primary', "Broadcasted", transactionHash);

          let check = function (err, result) {
            console.log("result transaction: " + result);
            console.log("error transaction: " + err);
            if (result != null) {
              setModal('text-success', "Success", transactionHash);
              clearInterval(intevalReceipt);
            }
          }

          let intevalReceipt = setInterval(function () {
            // console.log('here');
            web3.eth.getTransactionReceipt(transactionHash, (err, result) => check(err, result))
          }, 2000);


        } else {
          console.log(err);
        }
      });

    } else {
      let tokenAddress = currentSrcToken.address;
      let toAddress = $('#transfer-address').val();
      let amount = Number($('#transfer-source-amount').val());
      let minABI = EnvConfig.TOKEN_ABI;

      // Get ERC20 Token contract instance
      let contract = web3.eth.contract(minABI).at(tokenAddress);
      // calculate ERC20 token amount
      let value = amount * Math.pow(10, 18);
      // call transfer function
      contract.transfer(toAddress, value, (err, txHash) => checkStatus(err, txHash));
    }

  }
  function checkStatus(err, txHash) {
    if (txHash != null && txHash != undefined) {
      setModal('text-primary', "Broadcasted", txHash);
    }
    var check = function (err, result) {
      console.log("result transaction: " + result);
      console.log("error transaction: " + err);
      if (result != null) {
        setModal('text-success', "Success", txHash);
        clearInterval(intevalReceipt);
      }
    }

    var intevalReceipt = setInterval(function () {
      // console.log('here');
      web3.eth.getTransactionReceipt(txHash, (err, result) => check(err, result))
    }, 2000);
  }
})

// process when click swap button in swap tab
$('#swap-button').click(function () {
  if (!isValidNumberInputSourceSwap()) {
    alertError("Invalid number");
    return;
  }
  if (!isInputInRange()) {
    alertError("Amount must greater than 0, less than current amount");
    return;
  }

  let rate = "1 " + $('#rate-src-symbol').html() + " = " + $('#exchange-rate').html() + " " + $('#rate-dest-symbol').html();

  let sourceSwap = $('#swap-source-amount').val() + ' ' + $('#selected-src-symbol').html();
  let destSwap = $('#amount-dest-swap').html() + ' ' + $('#selected-dest-symbol').html();
  $('#source-swap').html(sourceSwap)
  $('#dest-swap').html(destSwap);
  $('#rate-modal').html(rate);

  $('#amount-approve').html(sourceSwap)
  $('#source-swap-after-approve').html(sourceSwap)
  $('#dest-swap-after-approve').html(destSwap);
  $('#rate-modal-after-approve').html(rate);
  let compressAccount = account.substring(0, 10) + "..." + account.substring(account.length - 5, account.length);
  $('#spender-approve').html(compressAccount);

  $('#source-swap-mix-modal').html(sourceSwap)
  $('#dest-swap-mix-modal').html(destSwap);
  $('#rate-mix-modal').html(rate);


  let gasEstimate;
  let gasPrice;
  let gasFee;
  function takeEstimateGas(result, error) {
    gasEstimate = result;
    changGasFee();
  }
  function setGasPrice(err, value) {
    gasPrice = value;
    changGasFee();
  }
  function changGasFee() {
    gasFee = gasPrice * gasEstimate / Math.pow(10, 18);
    if (!isNaN(gasFee)) {
      $('#gas-fee-swap').html(gasFee);
      $('#gas-fee-approve').html(gasFee);
    }
  }
  const srcToken = findTokenBySymbol($('#selected-src-symbol').text());
  const destToken = findTokenBySymbol($('#selected-dest-symbol').text());
  const amount = $('#swap-source-amount').val();
  //  web3.eth.getGasPrice((err, result) => setGasPrice(err, result));

  if (srcToken.address === nativeToken.address) {
    // calculateEstimateGasExchangeToken(srcToken.address, destToken.address, account, amount * Math.pow(10, 18).toString(), web3, takeEstimateGas);
    $('#confirm-swap-modal').modal();
    return;
  }
  calculateEstimateGasApprove(destToken.address, amount * Math.pow(10, 18).toString(), account, web3, takeEstimateGas);
  $('#confirm-approve-modal').modal();
})

$('#confirm-approve-button').click(function () {
  $('#confirm-approve-modal').modal('hide');
  $('#status-mix-modal').modal('show');
  setApproveModal('text-secondary', 'Broadcasting');
  $('#section-swap').css("display", "none");

  const srcToken = findTokenBySymbol($('#selected-src-symbol').text());
  const destToken = findTokenBySymbol($('#selected-dest-symbol').text());
  const amount = $('#swap-source-amount').val();

  let fn = (transactionHash, error) => {
    console.log('doing approve!');
    let fn2 = (transactionHash, error) => {
      console.log('here');
      console.log('tx: ' + transactionHash);
      console.log('err: ' + error);
    }
    if (!error) {
      console.log('transaction hash approve: ' + transactionHash);
      let addressTxCompress = transactionHash.substring(0, 10) + "..." + transactionHash.substring(transactionHash.length - 5, transactionHash.length);

      setApproveModal('text-primary', "Broadcasted", transactionHash);
      $('#transaction-approve-mix-modal').html(addressTxCompress);
      let check = function (err, result) {
        if (result != null) {
          setApproveModal('text-success', "Success", transactionHash);
          clearInterval(intevalReceipt);
          $('#section-swap').css("display", "block");

          function calculateGasSwap() {
            let gasEstimate;
            let gasPrice;
            let gasFee;
            function takeEstimateGas(result, error) {
              gasEstimate = result;
              changGasFee();
            }
            function setGasPrice(err, value) {
              gasPrice = value;
              changGasFee();
            }
            function changGasFee() {
              gasFee = gasPrice * gasEstimate / Math.pow(10, 18);
              if (!isNaN(gasFee)) {
                $('#gas-fee-swap-mix-modal').html(gasFee);
              }
            }
            const srcToken = findTokenBySymbol($('#selected-src-symbol').text());
            const destToken = findTokenBySymbol($('#selected-dest-symbol').text());
            const amount = $('#swap-source-amount').val();
            //  web3.eth.getGasPrice((err, result) => setGasPrice(err, result));
            //calculateEstimateGasExchangeToken(srcToken.address, destToken.address, account, amount * Math.pow(10, 18).toString(), web3, takeEstimateGas);

          }
          calculateGasSwap();
          $('#confirm-swap-mix-modal').modal();

        }
      }
      let intevalReceipt = setInterval(function () {
        // console.log('here');
        web3.eth.getTransactionReceipt(transactionHash, (err, result) => check(err, result))
      }, 2000);

      // doSwap(srcToken.address, destToken.address, account, amount * Math.pow(10, 18).toString(), 0, web3, fn2);
    } else {
      console.log("Error approve: " + error);
    }
  }
  doApprove(destToken.address, amount * Math.pow(10, 18).toString(), EnvConfig.EXCHANGE_CONTRACT_ADDRESS, web3, fn);

})

$('#confirm-swap-button-mix-modal').click(async function () {
  $('#confirm-swap-mix-modal').modal('hide');
  const srcToken = findTokenBySymbol($('#selected-src-symbol').text());
  const destToken = findTokenBySymbol($('#selected-dest-symbol').text());
  const amount = $('#swap-source-amount').val();
  setSwapModal('text-secondary', 'Broadcasting');
  let fn = (transactionHash, error) => {
    console.log('doing swap!');
    if (!error) {
      console.log('transaction hash swap: ' + transactionHash);
      let addressTxCompress = transactionHash.substring(0, 10) + "..." + transactionHash.substring(transactionHash.length - 5, transactionHash.length);

      setSwapModal('text-primary', "Broadcasted", transactionHash);
      $('#transaction-swap-mix-modal').html(addressTxCompress);
      let check = function (err, result) {
        if (result != null) {
          setSwapModal('text-success', "Success", transactionHash);
          clearInterval(intevalReceipt);
        }
      }
      let intevalReceipt = setInterval(function () {
        // console.log('here');
        web3.eth.getTransactionReceipt(transactionHash, (err, result) => check(err, result))
      }, 2000);
    } else {
      console.log("Error approve: " + error);
    }
  }
  await doSwap(srcToken.address, destToken.address, account, amount * Math.pow(10, 18).toString(), 0, web3, fn);
})

$('#confirm-swap-button').click(async function () {
  $('#confirm-swap-modal').modal('hide');
  const srcToken = findTokenBySymbol($('#selected-src-symbol').text());
  const destToken = findTokenBySymbol($('#selected-dest-symbol').text());
  const amount = $('#swap-source-amount').val();
  if (srcToken.address !== nativeToken.address && destToken.address !== nativeToken.address) {
    //transfer between 2 token
  } else if (destToken.address === nativeToken.address) {
    // swap token to eth
    // never happen
    console.log('dasdasdasdasdasdasdas');
    $('#status-mix-modal').modal('show');
    setApproveModal('text-secondary', 'Broadcasting');
    $('#section-swap').css("display", "none");
    let fn = (transactionHash, error) => {
      console.log('doing approve!');
      let fn2 = (transactionHash, error) => {
        console.log('here');
        console.log('tx: ' + transactionHash);
        console.log('err: ' + error);
      }
      if (!error) {
        console.log('transaction hash approve: ' + transactionHash);
        setApproveModal('text-primary', "Broadcasted", transactionHash);

        let check = function (err, result) {
          if (result != null) {
            setApproveModal('text-success', "Success", transactionHash);
            clearInterval(intevalReceipt);
            $('#section-swap').css("display", "block");

            $('#confirm-swap-after-approve-modal').modal();

          }
        }
        let intevalReceipt = setInterval(function () {
          console.log('here');
          web3.eth.getTransactionReceipt(transactionHash, (err, result) => check(err, result))
        }, 2000);

        // doSwap(srcToken.address, destToken.address, account, amount * Math.pow(10, 18).toString(), 0, web3, fn2);
      } else {
        console.log("Error approve: " + error);
      }
    }
    doApprove(srcToken.address, amount * Math.pow(10, 18).toString(), EnvConfig.EXCHANGE_CONTRACT_ADDRESS, web3, fn);

  } else if (srcToken.address === nativeToken.address) {
    // swap eth to token

    $('#status-transfer-modal').modal('show');
    setModal('text-secondary', 'Broadcasting');

    let fn = (transactionHash, error) => {
      console.log('process');
      if (!error) {
        setModal('text-primary', "Broadcasted", transactionHash);
        let check = function (err, result) {
          if (result != null) {
            setModal('text-success', "Success", transactionHash);
            clearInterval(intevalReceipt);
          }
        }
        let intevalReceipt = setInterval(function () {
          getWeb3Instance.eth.getTransactionReceipt(transactionHash, (err, result) => check(err, result))
        }, 2000);
      } else {
        console.log("error callback: " + error);
      }
    }
    await doSwap(srcToken.address, destToken.address, account, amount * Math.pow(10, 18).toString(), amount * Math.pow(10, 18).toString(), fn);
  }
});

//set stack modal display
$('.modal').on('show.bs.modal', function (event) {
  var idx = $('.modal:visible').length;
  $(this).css('z-index', 1040 + (10 * idx));
});
$('.modal').on('shown.bs.modal', function (event) {
  var idx = ($('.modal:visible').length) - 1; // raise backdrop after animation.
  $('.modal-backdrop').not('.stacked').css('z-index', 1039 + (10 * idx));
  $('.modal-backdrop').not('.stacked').addClass('stacked');
});



function timeout(ms) {
  return new Promise(res => setTimeout(res, ms));
}
//validate input in swap tab
async function alertError(errorMessage) {
  // $('.alert').show('fade');
  $('#messageError').html(errorMessage);
  console.log('error')
  $('#alert-swap-tab').removeClass('fade');
  await timeout(4000);
  $('#alert-swap-tab').addClass('fade');
}
function isValidNumberInputSourceSwap() {
  return (!isNaN($('#swap-source-amount').val()));
}
function isInputInRange() {
  let number = $('#swap-source-amount').val();
  let max = amountSrcToken;
  if (number <= 0 || number > max) {
    return false;
  }
  return true;
}

$(function () {
  initiateProject();


  function initiateProject() {
    const defaultSrcSymbol = EnvConfig.TOKENS[0].symbol;
    const defaultDestSymbol = EnvConfig.TOKENS[1].symbol;
    currentSrcToken = EnvConfig.TOKENS[0];
    initiateDropdown();
    initiateSelectedToken(defaultSrcSymbol, defaultDestSymbol);
    initiateDefaultRate(defaultSrcSymbol, defaultDestSymbol);
  }

  $('.search-token-input').on('input', function () {
    let pattern = $(this).val();
    $('.dropdown__item').each(function (index, value) {
      if (!$(this).html().includes(pattern, 0)) {
        $(this).addClass('d-none');
      } else {
        if ($(this).hasClass('d-none')) {
          $(this).removeClass('d-none');
        }
      }
    })
  })
  function initiateDropdown() {
    let dropdownTokens = '';
    let listTokens = [];
    dropdownTokens += '<div><input class="search-token-input" style="width: 40px;"/></div>'
    EnvConfig.TOKENS.forEach((token) => {
      listTokens.push(token);
      dropdownTokens += `<div class="dropdown__item">${token.symbol}</div>`;
    });

    $('.dropdown__content').html(dropdownTokens);
  }

  function initiateSelectedToken(srcSymbol, destSymbol) {
    $('#selected-src-symbol').html(srcSymbol);
    $('#selected-dest-symbol').html(destSymbol);
    $('#rate-src-symbol').html(srcSymbol);
    $('#rate-dest-symbol').html(destSymbol);
    $('#selected-transfer-token').html(srcSymbol);
  }

  function initiateDefaultRate(srcSymbol, destSymbol) {
    const srcToken = findTokenBySymbol(srcSymbol);
    const destToken = findTokenBySymbol(destSymbol);
    // const defaultSrcAmount = (Math.pow(10, 18)).toString();
    // const defaultSrcAmount = "1";
    const defaultSrcAmount = BigNumber(10).pow(18);

    getExchangeRate(srcToken.address, destToken.address, defaultSrcAmount.toString()).then((result) => {
      // const rate = result / Math.pow(10, 18);
      const rate = BigNumber(result).div(Math.pow(10, 18)).toString();
      $('#exchange-rate').html(rate);
    }).catch((error) => {
      console.log(error);
      $('#exchange-rate').html(0);
    });
  }
  // On changing token from dropdown.
  $(document).on('click', '.dropdown__item', function () {
    const selectedSymbol = $(this).html();
    $(this).parent().siblings('.dropdown__trigger').find('.selected-target').html(selectedSymbol);
    /* TODO: Implement changing rate for Source and Dest Token here. */
    //reset input amount
    $('#swap-source-amount').val('');
    $('#transfer-source-amount').val('');
    $('#amount-dest-swap').text('0');
    $('#amount-dest-transfer').text('0');

    $('.search-token-input').val('');
    $('.dropdown__item').each(function (index, value) {
      if ($(this).hasClass('d-none')) {
        $(this).removeClass('d-none');
      }
    })
    updateRateSwap();
  });
  function updateRateSwap() {

    const srcToken = findTokenBySymbol($('#selected-src-symbol').text());
    const destToken = findTokenBySymbol($('#selected-dest-symbol').text());
    const srcTransferToken = findTokenBySymbol($('#selected-transfer-token').text());

    if ($('#tab_swap').hasClass('tab__item--active')) {
      currentSrcToken = srcToken;
    } else {
      currentSrcToken = srcTransferToken;
    }
    $('#rate-src-symbol').html($('#selected-src-symbol').text());
    $('#rate-dest-symbol').html($('#selected-dest-symbol').text());
    if (srcToken.address === destToken.address) {
      $('#exchange-rate').html(1);
    } else {
      getExchangeRate(srcToken.address, destToken.address, Math.pow(10, 18).toString()).then((result) => {
        const rate = result / Math.pow(10, 18);
        $('#exchange-rate').html(rate);
      }).catch((error) => {
        console.log(error);
        $('#exchange-rate').html(0);
      });
    }

  };

  // Import Metamask
  $('#import-metamask').on('click', function () {
    /* TODO: Importing wallet by Metamask goes here. */

    window.ethereum.enable().then(
      () => {
        console.log('ok');
        connectMetamask();
      },
      error => {
        console.log('not ok')
      }
    )
  });
  $('#import-private-key').on('click', function () {
    // let fn = function () {
    //   console.log();
    // }
    // web3.eth.accounts.wallet.add('C87509A1C067BBDE78BEB793E6FA76530B6382A4C0241E5E4A9EC0A0F44DC0D3', fn);
    // web3.eth.register('0x233CCbD98AEdc04F27A9148c8933400eed076F9a',

    const privateKey = 'C87509A1C067BBDE78BEB793E6FA76530B6382A4C0241E5E4A9EC0A0F44DC0D3';
    const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);

  })
  
  // ethereum.autoRefreshOnNetworkChange = false;
  // window.ethereum.autoRefreshOnNetworkChange = false;
  async function connectMetamask() {
    
      await window.ethereum.enable();
      web3 = new Web3(window.ethereum);
      // startApp(provider); // initialize your app

  }
  // Handle on Source Amount Changed
  $('#swap-source-amount').on('input change', function () {
    /* TODO: Fetching latest rate with new amount */
    /* TODO: Updating dest amount */
    if (isNaN($('#swap-source-amount').val())) {
      return;
    }
    $('#amount-dest-swap').html(Number($('#exchange-rate').text()) * Number($('#swap-source-amount').val()));
  });

  // Handle on click token in Token Dropdown List
  $('.dropdown__item').on('click', function () {
    $(this).parents('.dropdown_left').removeClass('dropdown--active');
    /* TODO: Select Token logic goes here */
  });

  // Handle on Swap Now button clicked
  $('#swap-button').on('click', function () {
    const modalId = $(this).data('modal-id');
    $(`#${modalId}`).addClass('modal--active');
  });

  // Tab Processing
  $('.tab__item').on('click', function () {
    const contentId = $(this).data('content-id');
    $('.tab__item').removeClass('tab__item--active');
    $(this).addClass('tab__item--active');

    if (contentId === 'swap') {
      $('#swap').addClass('active');
      $('#transfer').removeClass('active');
    } else {
      $('#transfer').addClass('active');
      $('#swap').removeClass('active');
    }
  });

  $('#change-src-dest').on('click', function () {
    let srcToken = $('#selected-src-symbol').text();
    let destToken = $('#selected-dest-symbol').text();

    $('#selected-src-symbol').html(destToken);
    $('#selected-dest-symbol').html(srcToken);

    $('#swap-source-amount').val('');
    $('#amount-dest-swap').text('0');

    updateRateSwap();
  });
  // Dropdown Processing
  $('.dropdown__trigger').on('click', function () {
    var currentElement = this;
    $('.dropdown__trigger').each(function () {
      if (currentElement !== $(this)[0] && $(this).parent().hasClass('dropdown--active')) {
        $(this).parent().toggleClass('dropdown--active');
      }
    });
    $('.search-token-input').val('');
    $('.dropdown__item').each(function (index, value) {
      if ($(this).hasClass('d-none')) {
        $(this).removeClass('d-none');
      }
    })
    $(this).parent().toggleClass('dropdown--active');
  });

  // Close Modal
  $('.modal').on('click', function (e) {
    if (e.target !== this) return;
    $(this).removeClass('modal--active');
  });
});

function findBalanceDisplay(tokenSymbol) {
  if (tokenSymbol === 'ETH') {
    return balanceEth;
  } else if (tokenSymbol === 'AT') {
    return balanceTa;
  } else {
    return balanceTb;
  }
}
$('#25-percent-transfer').click(function () {
  let balanceDisplay;
  balanceDisplay = findBalanceDisplay($('#selected-transfer-token').html());
  if (!isNaN(balanceDisplay)) {
    $('#transfer-source-amount').val(balanceDisplay * 0.25);
  }
});
$('#50-percent-transfer').click(function () {
  let balanceDisplay;
  balanceDisplay = findBalanceDisplay($('#selected-transfer-token').html());
  if (!isNaN(balanceDisplay)) {
    $('#transfer-source-amount').val(balanceDisplay * 0.5);
  }
});
$('#100-percent-transfer').click(function () {
  let balanceDisplay;
  balanceDisplay = findBalanceDisplay($('#selected-transfer-token').html());
  if (!isNaN(balanceDisplay)) {
    $('#transfer-source-amount').val(balanceDisplay);
  }
});
function findTokenBySymbol(symbol) {
  return EnvConfig.TOKENS.find(token => token.symbol === symbol);
}
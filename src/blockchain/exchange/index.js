import web3 from "../web3";
import ContratInterface, {
  contractAddress,
} from "../interface/routertInterface";
import tokenInterface from "../interface/tokenInterface";
import factoryInterface from "../interface/factoryInterface";


export const swap = async (
  amountIn,
  amountOutMin,
  path,
  userAddress,
  deadline,
  walletType,
  exchangeType
) => {
  try {
    let myContract = await ContratInterface(walletType);
    let receipt;

    if (exchangeType === "ETHtoToken") {
      receipt = await myContract.methods
        .swapExactETHForTokensSupportingFeeOnTransferTokens(
          amountOutMin,
          path,
          userAddress,
          deadline
        )
        .send({ from: userAddress, value: amountIn });
    } else if (exchangeType === "tokenToEth") {
      receipt = await myContract.methods
        .swapExactTokensForETHSupportingFeeOnTransferTokens(
          amountIn,
          amountOutMin,
          path,
          userAddress,
          deadline
        )
        // .estimateGas({ from: userAddress });
        .send({ from: userAddress });
    } else if (exchangeType === "tokenToToken") {
      if (
        path[0] !== "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" &&
        path[1] !== "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      ) {
        path[2] = path[1];
        path[1] = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
      }
      receipt = await myContract.methods
        .swapExactTokensForTokensSupportingFeeOnTransferTokens(
          amountIn,
          amountOutMin,
          path,
          userAddress,
          deadline
        )
        .send({ from: userAddress });
    }

    return receipt;
  } catch (error) {
    console.log(error);
  }
};

export const getQuote = async (amount, path, walletType, quoteType) => {
  try {
    let myContract = await ContratInterface(walletType);
    let receipt;
    console.log(amount, path, walletType, quoteType)

    if (quoteType === "amountIn") {
      if (
        path[0] !== "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" &&
        path[1] !== "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      ) {
        path[2] = path[1];
        path[1] = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
      }
      receipt = await myContract.methods.getAmountsIn(amount, path).call();
    } else if (quoteType === "amountOut") {
      if (
        path[0] !== "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" &&
        path[1] !== "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      ) {
        path[2] = path[1];
        path[1] = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
      }
      receipt = await myContract.methods.getAmountsOut(amount, path).call();
    }

    return receipt;
  } catch (error) {
    console.log(error);
  }
};

export const Approve = async (walletType, userAddress, address) => {
  try {
    let myContract = await tokenInterface(walletType, address);

    let receipt = await myContract.methods
      .approve(
        contractAddress,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      )
      .send({ from: userAddress });

    return receipt;
  } catch (error) {
    console.log(error);
  }
};

export const checkAllowance = async (walletType, userAddress, address) => {
  if(userAddress){
    try {
      let myContract = await tokenInterface(walletType, address);
      let receipt = await myContract.methods
        .allowance(userAddress, contractAddress)
        .call();
  
      return receipt;
    } catch (error) {
      console.log(error);
    }
  }else {
    console.log("no user")
  }
  
};

export const checkBalance = async (walletType, userAddress, address) => {
  try {
    let myContract = await tokenInterface(walletType, address);
    let receipt = await myContract.methods.balanceOf(userAddress).call();

    return receipt;
  } catch (error) {
    console.log(error);
  }
};

export const getNativeBalance = async (userAddress) => {
  try {
    let balance = await web3.eth.getBalance(userAddress);

    return balance;
  } catch (error) {
    console.log(error);
  }
};

export const getPair = async (tokenA, tokenB, walletType) => {
  let myContract = await factoryInterface(walletType);
  let pairAddress = await myContract.methods.getPair(tokenA, tokenB).call();
  let pairContract = await tokenInterface(walletType, pairAddress);
  // tokenA = await pairContract.methods.token0().call();
  // tokenB = await pairContract.methods.token1().call();
  let tokenAcontract = await tokenInterface(walletType, tokenA);
  let tokenBcontract = await tokenInterface(walletType, tokenB);
  let supply = await pairContract.methods.totalSupply().call();
  let tokenAreserve = await tokenAcontract.methods
    .balanceOf(pairAddress)
    .call();
  let tokenBreserve = await tokenBcontract.methods
    .balanceOf(pairAddress)
    .call();

  return { pairAddress, tokenAreserve, tokenBreserve, supply };
};








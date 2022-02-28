import React, { useEffect, useState } from "react";
import { useWeb3Context } from "web3-react";
import { ethers } from "ethers";
import { InfuraProvider } from "@ethersproject/providers";

import Factory from "../abi/factory.json";
import Router from "../abi/route2.json";
import Pair from "../abi/pair.json";
import Popup from "./common/Popup";

import Erc20 from "../abi/erc20.json";
import { useContract } from "../utils/useContract";
import { tokens } from "../blockchain/tokenList.json";
import Select from "./common/Select";
import {
  swap,
  getPair,
  getQuote,
  Approve,
  checkAllowance,
  checkBalance,
  getNativeBalance,
} from "../blockchain/exchange";
import Moralis from "moralis";

const C_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const C_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const C_PAIR = "0x3139Ffc91B99aa94DA8A2dc13f1fC36F9BDc98eE";
const C_ERC20 = "0xa2327a938Febf5FEC13baCFb16Ae10EcBc4cbDCF";

const USDP = "0x8e870d67f660d95d5be530380d0ec0bd388289e1";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

// [0x8e870d67f660d95d5be530380d0ec0bd388289e1, 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48]

const Swap = ({ walletType, userAddress, setPopupShowed }) => {
  const factoryContract = useContract(C_FACTORY, Factory);
  const routerContract = useContract(C_ROUTER, Router);
  const pairContract = useContract(C_PAIR, Pair);
  const erc20 = useContract(C_ERC20, Erc20);

  console.log("[erc20]", erc20);

  const context = useWeb3Context();
  const { active, networkId } = context;
  window.acc = factoryContract;
  const [isLoading, setIsLoading] = useState(false);
  const [settingSlippage, isSettingSlippage] = useState(false);
  const [inBalance, setInBalance] = useState("");
  const [outBalance, setOutBalance] = useState("");
  const [enoughAllowance, setEnoughAllowance] = useState(true);
  const [balance, setBalance] = useState(null);
  const [sendAmount, setSendAmount] = useState(0);
  const [reserve, setReserve] = useState({ r0: null, r1: null });
  const [pairPrice, setPairPrice] = useState(0);
  const [trade, setTrade] = useState({
    amountIn: "",
    amountOut: "",
    amountOutMin: "",
    slippage: "0.5",
    tokenIn: {
      name: "ETH",
      selected: true,
      symbol: "ETH",
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      decimals: 18,
      logoURI:
        "https://assets.trustwalletapp.com/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
    },
    tokenOut: {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      name: "Tether",
      symbol: "USDT",
      decimals: 6,
      logoURI:
        "https://assets.trustwalletapp.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
    },
  });

  useEffect(() => {
    console.log(tokens, "tokens");
    if (pairContract) {
      pairContract
        .getReserves()
        .then((res) => setReserve({ r0: res._reserve0, r1: res._reserve1 }))
        .catch((err) => console.log("[pair err]", err));
    }
  }, [pairContract]);

  // useEffect(() => {
  //   console.log('[uni]', factoryContract);
  //   if (factoryContract) {
  //     factoryContract.getPair(USDT, MOCHI).then(res => console.log('[pair res]', res)).catch(err => console.log('[err]', err));
  //   }
  // }, [factoryContract]);

  const setValue = async (num, side) => {
    if (side === "from") {
      const value = Number(num * 10 ** trade.tokenIn.decimals).toString();
      let amountOut = await quote(value, side);
      let amountOutMin = ((100 - trade.slippage) * amountOut) / 100;
      setTrade({ ...trade, amountIn: num, amountOut, amountOutMin });
    } else {
      const value = Number(num * 10 ** trade.tokenOut.decimals).toString();
      let amountIn = await quote(value, side);
      let amountOutMin = ((100 - trade.slippage) * num) / 100;
      setTrade({ ...trade, amountOut: num, amountIn, amountOutMin });
    }
  };

  const changeSides = async () => {
    let tokenOut = trade.tokenIn;
    let tokenIn = trade.tokenOut;
    setTrade({
      ...trade,
      amountIn: "",
      amountOut: "",
      amountOutMin: "",
      tokenIn,
      tokenOut,
    });
  };

  //amount, path, walletType, quoteType
  const quote = async (value, side) => {
    if (value <= 0) {
      return 0;
    }
    if (side === "from") {
      let result = await getQuote(
        value,
        [trade.tokenIn.address, trade.tokenOut.address],
        walletType,
        "amountOut"
      );
      console.log(result);
      return (
        result[result.length - 1] /
        10 ** trade.tokenOut.decimals
      ).toFixed(4);
    } else if (side === "to") {
      let result = await getQuote(
        value,
        [trade.tokenIn.address, trade.tokenOut.address],
        walletType,
        "amountIn"
      );
      return (result[0] / 10 ** trade.tokenIn.decimals).toFixed(4);
    }
  };

  const checkTokenAllowance = async () => {
    if (trade.tokenIn.name === "ETH") {
      setEnoughAllowance(true);
    } else {
      let allowance = await checkAllowance(
        walletType,
        userAddress,
        trade.tokenIn.address
      );

      if (allowance < 1) {
        setEnoughAllowance(false);
      } else {
        setEnoughAllowance(true);
      }
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    let receipt = await Approve(walletType, userAddress, trade.tokenIn.address);
    if (receipt) {
      checkTokenAllowance();
    }
    setIsLoading(false);
  };

  const setTokens = (token, side) => {
    if (side === "from") {
      setTrade({ ...trade, tokenIn: token, amountIn: "0", amountOut: "0" });
    } else {
      setTrade({ ...trade, tokenOut: token, amountIn: "0", amountOut: "0" });
    }
  };

  const initSwap = async () => {
    setIsLoading(true);
    let amountIn = truncateToDecimals(trade.amountIn * 10 ** trade.tokenIn.decimals,0);
    let amountOutMin = truncateToDecimals(trade.amountOutMin * 10 ** trade.tokenOut.decimals,0);
    let exchangeType;
    if (trade.tokenIn.name === "ETH") {
      exchangeType = "ETHtoToken";
    } else if (trade.tokenOut.name === "ETH") {
      exchangeType = "tokenToEth";
    } else {
      exchangeType = "tokenToToken";
    }

    let receipt = await swap(
      amountIn,
      amountOutMin,
      [trade.tokenIn.address, trade.tokenOut.address],
      userAddress,
      Date.now() + 1000 * 60 * 10,
      walletType,
      exchangeType
    );

    if (receipt) {
      console.log(receipt);
      getUserBalance();
    }
    setIsLoading(false);
  };

  const getUserBalance = async () => {
    if (userAddress) {
      let inBalance;
      let outBalance;
      if (trade.tokenIn.name === "ETH") {
        inBalance = await getNativeBalance(userAddress);
      } else {
        inBalance = await checkBalance(
          walletType,
          userAddress,
          trade.tokenIn.address
        );
      }
      if (trade.tokenOut.name === "ETH") {
        outBalance = await getNativeBalance(userAddress);
      } else {
        outBalance = await checkBalance(
          walletType,
          userAddress,
          trade.tokenOut.address
        );
      }

      console.log(
        "in",
        inBalance / 10 ** trade.tokenIn.decimals,
        "out",
        outBalance / 10 ** trade.tokenOut.decimals
      );

      setInBalance(inBalance / 10 ** trade.tokenIn.decimals);
      setOutBalance(outBalance / 10 ** trade.tokenOut.decimals);
    }
  };

  function truncateToDecimals(num, dec) {
    const calcDec = Math.pow(10, dec);
    return Math.trunc(num * calcDec) / calcDec;
  }

  useEffect(() => {
    checkTokenAllowance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trade.tokenIn]);

  useEffect(() => {
    getUserBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trade.tokenIn, trade.tokenOut, userAddress]);

  return (
    <>
      <h1 className="title-h1">MOCHISWAP</h1>
      <div>
        <div className="px-4 py-4 bg-white rounded-20">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="title">Swap</h2>
            <div className="d-flex ml-auto">
              {/* <button className="p-0 border-0 bg-transparent hover-op">
                <i className="material-icons color-icon">history</i>
              </button> */}
              <button
                className="p-0 border-0 bg-transparent hover-op"
                style={{ marginLeft: 18 }}
                onClick={() => isSettingSlippage(true)}
              >
                <i className="material-icons material-icons-outlined color-icon">
                  settings
                </i>
              </button>
            </div>
          </div>

          <div className="bg-card rounded-12 mt-4">
            <div className="d-flex justify-content-between align-items-center px-12x py-10x">
              <div className="subtitle">From</div>
              <div className="text-balance">
                Balance:{" "}
                <span className="numbers">
                  {Number(inBalance).toFixed(4)}
                </span>{" "}
                {trade.tokenIn.symbol}
              </div>
            </div>
            <hr className="m-0 color-line" />
            <div className="px-12x py-10x d-flex align-items-center">
              {/* <div className="size-32">IMG</div> */}
              {/* <img src="/bnb.png" alt="" className="size-32" /> */}
              <Select
                side={"from"}
                selected={trade.tokenIn}
                setTokens={setTokens}
                list={tokens}
                className="ml-2 font-weight-bold text-token mr-3"
              ></Select>
              <input
                value={trade.amountIn}
                onChange={(e) => setValue(e.target.value, "from")}
                type="number"
                className="input-field ml-auto numbers"
                placeholder="Enter Amount"
              />
            </div>
          </div>

          <div className="d-flex w-100 justify-content-center my-3">
            <i onClick={changeSides} className="material-icons">
              arrow_downward
            </i>
          </div>

          <div className="bg-card rounded-12 mt-4">
            <div className="d-flex justify-content-between align-items-center px-12x py-10x">
              <div className="subtitle">To</div>
              <div className="text-balance">
                Balance:{" "}
                <span className="numbers">
                  {Number(outBalance ).toFixed(4)}
                </span>{" "}
                {trade.tokenOut.symbol}
              </div>
            </div>
            <hr className="m-0 color-line" />
            <div className="px-12x py-10x d-flex align-items-center">
              {/* <div className="size-32">IMG</div> */}
              {/* <img src="/mochi.png" alt="" className="size-32" /> */}
              <Select
                side={"to"}
                selected={trade.tokenOut}
                setTokens={setTokens}
                list={tokens}
                className="ml-2 font-weight-bold text-token mr-3"
              ></Select>
              <input
                value={trade.amountOut}
                onChange={(e) => setValue(e.target.value, "to")}
                type="number"
                className="input-field ml-auto numbers"
                placeholder="Enter Amount"
              />
            </div>
          </div>

          <div style={{ marginTop: 40 }}>
            {userAddress ? (
              <button
                disabled={
                  enoughAllowance
                    ? Number(trade.amountIn) >= Number(inBalance)
                    : false
                }
                onClick={
                  !enoughAllowance ? () => handleApprove() : () => initSwap()
                }
                className="w-100 btn-connect border-0 text-white d-flex justify-content-center align-items-center hover-op"
              >
                <div>
                  <i className="material-icons text-white">swap_vert</i>
                </div>
                <div className="btn-text ml-2">
                  {" "}
                  {!enoughAllowance
                    ? "Approve Token"
                    : Number(trade.amountIn) <= Number(inBalance)
                    ? "Swap"
                    : "Insufficient Funds"}
                </div>
              </button>
            ) : (
              <button
                onClick={() => setPopupShowed(true)}
                className="w-100 btn-connect border-0 text-white d-flex justify-content-center align-items-center hover-op"
              >
                <div className="btn-text ml-2">Connect Wallet</div>
              </button>
            )}
          </div>
        </div>
      </div>
      <Popup
        popupShowed={settingSlippage}
        setPopupShowed={isSettingSlippage}
        className={"popup--connect"}
      >
       
          <div className="slippage-box">
            <h3>Slippage</h3>
            <input
              value={trade.slippage}
              onChange={(e) => setTrade({ ...trade, slippage: e.target.value })}
              type="number"
              className="input-field numbers"
              placeholder="Enter Slippage"
            />
          
          <button  onClick={() => isSettingSlippage(false)} className="btn-connecter border-0 text-wallet slippage-button">
            Accept
          </button>
        </div>
      </Popup>
    </>
  );
};

export default Swap;

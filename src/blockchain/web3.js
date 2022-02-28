const Web3 = require("web3");

let web3;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  web3 = new Web3(Web3.givenProvider);
} else {
  const provider = new Web3.providers.HttpProvider(
    "https://rpc.ankr.com/eth"
  );
  web3 = new Web3(provider);
}

export default web3;

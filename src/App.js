import './App.css';
import { useState } from 'react';
import Swap from './components/Swap';
import WalletConnect from './components/WalletConnect';
import ConnectPopup from "./components/ConnectPopup";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";

const METAMASK = "MetaMask";
const WALETCONNECT = "WalletConnect";

function App() {

  const [isConnected, setConnected] = useState(false);
  const [popupShowed, setPopupShowed] = useState(false);
  const [userAddress, setUserAddress] = useState("")
  const [walletType, setWalletType] = useState("")
  const activateWalletConnect =async () => {
    
  }

  const connectWalletConnect = async () => {
    try {
      const provider = new WalletConnectProvider({
        rpc: {
          1: "https://rpc.ankr.com/eth",
        },
        chainId: 1,
        infuraId: null,
      });
  
      await provider.enable();
      const web3 = new Web3(provider);
  
      const accounts = await web3.eth.getAccounts();

      setUserAddress(accounts[0]);
      setWalletType(WALETCONNECT);
      setPopupShowed(false);
    } catch (error) {
      console.log(error)
    }
    
  }

  const connectMetamask = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setUserAddress(accounts[0]);

      window.localStorage.setItem("userAddress", accounts[0]);

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      if (chainId !== "0x1") {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x1" }],
        });
      }

      window.ethereum.on("accountsChanged", function (accounts) {
        setUserAddress(accounts[0]);
      });

      window.ethereum.on("chainChanged", (_chainId) =>
        window.location.reload()
      );
      setPopupShowed(false);
      setWalletType(METAMASK);
    } catch (error) {
      console.log(error);
    }
  }

  const disconnectWallet = async () => {
    if (walletType === WALETCONNECT) {
      const provider = new WalletConnectProvider({
        rpc: {
          1: "https://rpc.ankr.com/eth",
        },
        chainId: 1,
        infuraId: null,
      });
      await provider.disconnect();
    } 

    setUserAddress("");
  };

  return (
    <div className="App w-100 d-flex flex-column justify-content-center align-items-center py-5">
      <WalletConnect disconnectWallet={disconnectWallet} userAddress={userAddress} setPopupShowed={setPopupShowed} setConnected={setConnected} />

      <div className='mt-3 main-container'>
        <Swap   setPopupShowed={setPopupShowed} userAddress={userAddress}  walletType={walletType} />
      </div>
      <ConnectPopup
      
        connectMetamask={connectMetamask}
        connectWalletConnect={connectWalletConnect}
        popupShowed={popupShowed}
        setPopupShowed={setPopupShowed}
        className="popup--connect"
      />
    </div>
  );
}

export default App;

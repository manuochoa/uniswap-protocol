import React from "react";
import Popup from "./common/Popup";

import metamask from "../images/icons/metamask.png";
import wc from "../images/icons/wc.png";
import { useWeb3Context } from "web3-react";


export default function ConnectPopup({
  connectMetamask,
  connectWalletConnect,
  popupShowed,
  setPopupShowed,
  className,
}) {

  const context = useWeb3Context();

  const { active, connectorName, account, networkId } = context;

  

  return (
    <Popup
      popupShowed={popupShowed}
      setPopupShowed={setPopupShowed}
      className={className}
    >
      <div className="popup__inner">
        <button
          className="remove popup__remove"
          onClick={() => setPopupShowed(false)}
        />
        <h1 className="popup__title">Connect Wallet</h1>
        <ul className="popup__buttons">
          <li className="popup__buttons-item">
            <button onClick={connectMetamask} className="popup__button">
              <span>Metamask</span>
              <img
                src={metamask}
                alt="Metamask"
                className="popup__button-icon"
              />
            </button>
          </li>
          <li className="popup__buttons-item">
            <button onClick={connectWalletConnect} className="popup__button">
              <span>WalletConnect</span>
              <img
                src={wc}
                alt="WalletConnect"
                className="popup__button-icon"
              />
            </button>
          </li>
        </ul>
        <div className="popup__row">
          <span className="popup__text">New to Blockchain?</span>
          <a href="/" className="popup__text popup__text--link">
            Learn more about wallets
          </a>
        </div>
      </div>
    </Popup>
  );
}

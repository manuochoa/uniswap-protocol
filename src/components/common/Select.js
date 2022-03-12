import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import notFound from "../../img/notFound.svg";
import Moralis from "moralis";
const serverUrl = "https://il4hsrq5ab2i.moralisweb3.com:2053/server";
const appId = "3RsVK4dZSBxm5p5EnkN9iWooV64bQtoIPbDInCeZ";
Moralis.start({ serverUrl, appId });
// import Enlarge from "../../icons/Enlarge";

export default function Select({
  side,
  setTokens,
  selected,
  className,
  list,
  callback,
}) {
  const [tokenList, setTokenList] = useState(list);
  const [opened, setOpened] = useState(false);
  const [newToken, setNewToken] = useState("");
  const [tokenNotListed, setTokenNotListed] = useState(false);

  function toggleSelect() {
    setOpened((state) => !opened);
  }

  async function searchInput(e) {
    setTokenNotListed(false);
    setNewToken(e);
    let isAddress = ethers.utils.isAddress(e);
    let temp = [];
    if (isAddress) {
      let token = list.find(
        (el) => el.address.toUpperCase() === e.toUpperCase()
      );
      if (token) {
        temp.push(token);
      } else {
        const options = {
          chain: "eth",
          addresses: e.toLowerCase(),
        };
        const tokenMetadata = await Moralis.Web3API.token.getTokenMetadata(
          options
        );

        if (tokenMetadata) {
          temp.push(tokenMetadata[0]);
          setTokenNotListed(true);
        }

        console.log(tokenMetadata, "moralis token");
      }
      console.log(token, "token");
    } else {
      list.map((el) => {
        if (el.symbol.toUpperCase().includes(e.toUpperCase())) {
          temp.push(el);
        }
      });
    }

    console.log("isAddress", isAddress);
    setTokenList(temp);
  }

  useEffect(() => {
    function handleDocumentClick() {
      // if (opened) {
      //   toggleSelect();
      // }
    }

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  useEffect(() => {
    setTokenList(list);
  }, [list]);

  return (
    <div className={"select " + (className || "") + (opened ? " opened" : "")}>
      <button className="select__button" onClick={toggleSelect}>
        <img
          src={selected.logoURI ? selected.logoURI : notFound}
          alt=""
          className="select__button-icon"
        />
        <span className="select__button-text">{selected.symbol}</span>
        {/* <Enlarge className="select__button-arrows" /> */}
      </button>
      <ul className="select__list">
        <li>
          <input
            value={newToken}
            onChange={(e) => searchInput(e.target.value)}
            onPaste={(e) => searchInput(e.target.value)}
            type="text"
            className="input-field ml-auto numbers"
            placeholder="Enter Token Symbol or Address"
          />
        </li>
        {tokenList.map((item, index) => {
          return (
            <li className="select__item" key={index}>
              <button
                className="select__item-button"
                onClick={() => {
                  setTokens(tokenList[index], side);
                  toggleSelect();
                }}
              >
                <img
                  src={item.logoURI ? item.logoURI : notFound}
                  alt=""
                  className="select__button-icon"
                />
                <span>{item.symbol}</span>
              </button>
            </li>
          );
        })}
        {tokenNotListed && (
          <li className="not-listed">
            This token is not on our list, trade at your own risk
          </li>
        )}
      </ul>
    </div>
  );
}

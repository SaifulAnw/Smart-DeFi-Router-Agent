import React, { useState, useEffect, createContext } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  CHECK_WALLET_CONNECTED,
  CONNECT_WALLET,
  TOKEN_ICO_CONTRACT,
  ERC20_CONTRACT,
  ERC20,
  GET_BALANCE,
  CHECK_ACCOUNT_BALANCE,
  addTokenToMetamask,
} from "../context/constants";

export const TOKEN_ICO_Context = createContext();

export const TokenICOProvider = ({ children }) => {
  const DAPP_NAME = "TOKEN ICO DAPP";
  const currency = "ETH";
  const network = "Holesky";

  const [loader, setLoader] = useState(false);
  const [account, setAccount] = useState("");
  const [count, setCount] = useState(0);

  const notifySuccess = (message) => {
    toast.success(message, { duration: 2000 });
  };

  const notifyError = (message) => {
    toast.error(message, { duration: 4000 });
  };

  // Contract Functions
  const TOKEN_ICO = async () => {
    try {
      const address = await CHECK_WALLET_CONNECTED();
      if (address) {
        setLoader(true);
        setAccount(address);
        const contract = await TOKEN_ICO_CONTRACT();
        const tokenDetails = await contract.getTokenDetails();
        const contractOwner = await contract.owner();
        const soldTokens = await contract.soldTokens();

        const ethBal = await GET_BALANCE();
        const token = {
          tokenBal: ethers.utils.formatEther(tokenDetails.balance.toString()),
          name: tokenDetails.name,
          symbol: tokenDetails.symbol,
          supply: ethers.utils.formatEther(tokenDetails.supply.toString()),
          tokenPrice: ethers.utils.formatEther(
            tokenDetails.tokenPrice.toString()
          ),
          tokenAddr: tokenDetails.tokenAddr,
          matic: ethBal,
          address: address.toLowerCase(),
          owner: contractOwner.toLowerCase(),
          soldTokens: ethers.utils.formatEther(soldTokens.toString()),
        };
        setLoader(false);
        return token;
      }
    } catch (err) {
      console.log(err);
      setLoader(false);
      notifyError("Failed to fetch token details");
    }
  };

  const BUY_TOKEN = async (amount) => {
    try {
      setLoader(true);
      const address = await CHECK_WALLET_CONNECTED();
      if (address) {
        const contract = await TOKEN_ICO_CONTRACT();
        const tokenDetails = await contract.getTokenDetails();

        const availableTokens = ethers.utils.formatEther(
          tokenDetails.balance.toString()
        );

        if (availableTokens >= amount) {
          const price = ethers.utils.formatEther(
            tokenDetails.tokenPrice.toString()
          );

          const payAmount = ethers.utils.parseUnits(
            (Number(price) * Number(amount)).toString(),
            "ether"
          );

          const transaction = await contract.buyToken(Number(amount), {
            value: payAmount.toString(),
            gasLimit: ethers.utils.hexlify(8000000),
          });

          await transaction.wait();
          setLoader(false);
          notifySuccess("Token Purchased Successfully!");
          window.location.reload();
        } else {
          setLoader(false);
          notifyError("Not enough tokens available for purchase.");
        }
      }
    } catch (err) {
      console.log(err);
      notifyError("Transaction Failed!");
      setLoader(false);
    }
  };

  const TOKEN_WITHDRAW = async () => {
    try {
      setLoader(true);
      const address = await CHECK_WALLET_CONNECTED();
      if (address) {
        const contract = await TOKEN_ICO_CONTRACT();
        const tokenDetails = await contract.getTokenDetails();
        const availableToken = ethers.utils.formatEther(
          tokenDetails.balance.toString()
        );

        if (availableToken > 0) {
          const transaction = await contract.withdrawAllTokens();
          await transaction.wait();
          setLoader(false);
          notifySuccess("Transaction completed successfully!");
          window.location.reload();
        } else {
          setLoader(false);
          notifyError("No tokens available to withdraw");
        }
      }
    } catch (err) {
      console.log(err);
      setLoader(false);
      notifyError("Withdrawal failed!");
    }
  };

  const UPDATE_TOKEN = async (_address) => {
    try {
      setLoader(true);
      const address = await CHECK_WALLET_CONNECTED();
      if (address) {
        const contract = await TOKEN_ICO_CONTRACT();
        const transaction = await contract.updateToken(_address);
        await transaction.wait();
        setLoader(false);
        notifySuccess("Token Updated Successfully!");
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
      setLoader(false);
      notifyError("Token update failed!");
    }
  };

  const UPDATE_TOKEN_PRICE = async (price) => {
    try {
      setLoader(true);
      const address = await CHECK_WALLET_CONNECTED();
      if (address) {
        const contract = await TOKEN_ICO_CONTRACT();
        const payAmount = ethers.utils.parseUnits(price.toString(), "ether");

        const transaction = await contract.updateTokenSalePrice(payAmount);
        await transaction.wait();
        setLoader(false);
        notifySuccess("Price Updated Successfully!");
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
      setLoader(false);
      notifyError("Price update failed!");
    }
  };

  const DONATE = async (amount) => {
    try {
      setLoader(true);
      const address = await CHECK_WALLET_CONNECTED();
      if (address) {
        const contract = await TOKEN_ICO_CONTRACT();
        const payAmount = ethers.utils.parseUnits(amount.toString(), "ether");

        const transaction = await contract.transferToOwner(payAmount, {
          value: payAmount.toString(),
          gasLimit: ethers.utils.hexlify(8000000),
        });
        await transaction.wait();
        setLoader(false);
        notifySuccess("Donation successful!");
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
      setLoader(false);
      notifyError("Donation failed!");
    }
  };

  const TRANSFER_ETHER = async (transfer) => {
    try {
      setLoader(true);
      const { _receiver, _address } = transfer;
      const address_from = await CHECK_WALLET_CONNECTED();
      if (address_from) {
        const contract = await TOKEN_ICO_CONTRACT();
        const payAmount = ethers.utils.parseUnits(
          _receiver.toString(),
          "ether"
        );

        const transaction = await contract.transferEther(_address, payAmount, {
          value: payAmount.toString(),
          gasLimit: ethers.utils.hexlify(8000000),
        });
        await transaction.wait();
        setLoader(false);
        notifySuccess("Transfer successful!");
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
      setLoader(false);
      notifyError("Transfer failed!");
    }
  };

  const TRANSFER_TOKEN = async (transfer) => {
    try {
      setLoader(true);
      const { _tokenAddress, _sendTo, _amount } = transfer;
      const address_from = await CHECK_WALLET_CONNECTED();
      if (address_from) {
        const contract = await ERC20_CONTRACT(_tokenAddress);
        const payAmount = ethers.utils.parseUnits(_amount.toString(), "ether");

        const transaction = await contract.transfer(_sendTo, payAmount, {
          gasLimit: ethers.utils.hexlify(8000000),
        });
        await transaction.wait();
        setLoader(false);
        notifySuccess("Token transfer successful!");
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
      setLoader(false);
      notifyError("Token transfer failed!");
    }
  };

  return (
    <TOKEN_ICO_Context.Provider
      value={{
        TOKEN_ICO,
        BUY_TOKEN,
        TOKEN_WITHDRAW,
        UPDATE_TOKEN,
        UPDATE_TOKEN_PRICE,
        DONATE,
        TRANSFER_ETHER,
        TRANSFER_TOKEN,
        CONNECT_WALLET,
        ERC20,
        CHECK_ACCOUNT_BALANCE,
        setAccount,
        setLoader,
        addTokenToMetamask,
        currency,
        account,
        loader,
        DAPP_NAME,
        network,
      }}
    >
      {children}
    </TOKEN_ICO_Context.Provider>
  );
};

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
  CONTRACT_ADDRESS,
  getCurrentNetwork,
} from "../context/constants";

export const TOKEN_ICO_Context = createContext();

export const TokenICOProvider = ({ children }) => {
  const DAPP_NAME = "TOKEN ICO DAPP";
  const currency = "ETH";
  const network = "sepolia";

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
      if (!address) {
        console.log("No wallet connected");
        return null;
      }

      setLoader(true);

      // Get current network info
      const currentNetwork = await getCurrentNetwork();
      if (currentNetwork) {
        console.log(
          `Connected to network: ${currentNetwork.name} (Chain ID: ${currentNetwork.chainId})`
        );
      }

      const contract = await TOKEN_ICO_CONTRACT();

      if (!contract) {
        setLoader(false);
        console.log("Failed to connect to contract");
        return null;
      }

      // Verify contract exists by checking if code exists at the address
      let contractExists = true;
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const code = await provider.getCode(CONTRACT_ADDRESS);

          if (code === "0x" || code === "0x0") {
            contractExists = false;
            setLoader(false);
            const networkInfo = currentNetwork
              ? `${currentNetwork.name} (Chain ID: ${currentNetwork.chainId})`
              : "current network";
            console.log(
              `⚠️ Contract not deployed at ${CONTRACT_ADDRESS} on ${networkInfo}`
            );
            console.log(`💡 Expected network: ${network}`);
            console.log(
              `💡 Please deploy your contract to ${network} or update the CONTRACT_ADDRESS in context/constants.js`
            );
            notifyError(
              `Contract not found on ${networkInfo}. Please deploy the contract first.`
            );
            return null;
          }
        } catch (codeCheckError) {
          console.log(
            "⚠️ Could not verify contract existence (RPC issue), continuing anyway..."
          );
          // Continue anyway - the actual contract call will fail if it doesn't exist
        }
      }

      const tokenDetails = await contract.getTokenDetails();
      const contractOwner = await contract.owner();
      const soldTokens = await contract.soldTokens();

      const ethBal = await GET_BALANCE();
      const token = {
        tokenBal: ethers.formatEther(tokenDetails.balance.toString()),
        name: tokenDetails.name,
        symbol: tokenDetails.symbol,
        supply: ethers.formatEther(tokenDetails.supply.toString()),
        tokenPrice: ethers.formatEther(tokenDetails.tokenPrice.toString()),
        tokenAddr: tokenDetails.tokenAddr,
        matic: ethBal,
        address: address.toLowerCase(),
        owner: contractOwner.toLowerCase(),
        soldTokens: ethers.formatEther(soldTokens.toString()),
      };
      setLoader(false);
      return token;
    } catch (err) {
      console.log("TOKEN_ICO Error:", err);
      setLoader(false);

      if (err.code === "CALL_EXCEPTION") {
        console.log(`❌ Contract call failed at address: ${CONTRACT_ADDRESS}`);
        console.log(`📍 Current network: ${network}`);
        console.log(`💡 Solution: Deploy your contracts to ${network} network`);
        console.log(
          `💡 Or update CONTRACT_ADDRESS in context/constants.js with the correct deployed address`
        );
        notifyError(
          `Contract not deployed. Please deploy to ${network} network first.`
        );
      } else if (err.code === "UNKNOWN_ERROR") {
        console.log(`⚠️ RPC Error - possibly network connectivity issue`);
        notifyError(
          "Network error. Please check MetaMask connection and try again."
        );
      } else {
        notifyError(
          "Failed to fetch token details. Please ensure contract is deployed."
        );
      }
      return null;
    }
  };

  const BUY_TOKEN = async (amount) => {
    try {
      setLoader(true);
      const address = await CHECK_WALLET_CONNECTED();
      if (address) {
        const contract = await TOKEN_ICO_CONTRACT();
        const tokenDetails = await contract.getTokenDetails();

        const availableTokens = ethers.formatEther(
          tokenDetails.balance.toString()
        );

        if (availableTokens >= amount) {
          const price = ethers.formatEther(tokenDetails.tokenPrice.toString());

          const payAmount = ethers.parseUnits(
            (Number(price) * Number(amount)).toString(),
            "ether"
          );

          const transaction = await contract.buyToken(Number(amount), {
            value: payAmount.toString(),
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
        const availableToken = ethers.formatEther(
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
        const payAmount = ethers.parseUnits(price.toString(), "ether");

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
        const payAmount = ethers.parseUnits(amount.toString(), "ether");

        const transaction = await contract.transferToOwner(payAmount, {
          value: payAmount.toString(),
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
        const payAmount = ethers.parseUnits(_receiver.toString(), "ether");

        const transaction = await contract.transferEther(_address, payAmount, {
          value: payAmount.toString(),
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
        const payAmount = ethers.parseUnits(_amount.toString(), "ether");

        const transaction = await contract.transfer(_sendTo, payAmount);
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

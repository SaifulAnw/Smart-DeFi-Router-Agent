import { ethers } from "ethers";
import Web3Modal from "web3modal";

// Internal Imports
import tokenICO from "./TokenICO.json";
import erc20 from "./ERC20.json";

export const TOKEN_ADDRESS = "0x033043c2DA7Fa1f4227e3BA4835A58092A95A5F2";
export const ERC20_ABI = erc20.abi;
export const OWNER_ADDRESS = "0xfec13f54150e2edf64a07a8bbe8672e10a35e9cd";
export const CONTRACT_ADDRESS = "0x0788A9c94094D6e5549D2C16EE24e14CcB0a28aC";
export const CONTRACT_ABI = tokenICO.abi;

// networks object to store network configurations
const networks = {
  sepolia: {
    chainId: `0x${Number(11155111).toString(16)}`,
    chainName: "Sepolia Testnet",
    nativeCurrency: {
      name: "Sepolia ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [
      "https://ethereum-sepolia-rpc.publicnode.com",
      "https://rpc.sepolia.org",
      "https://rpc2.sepolia.org",
    ],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  holesky: {
    chainId: `0x${Number(17000).toString(16)}`,
    chainName: "Holesky Testnet",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [
      "https://rpc.holesky.ethpandaops.io",
      "https://ethereum-holesky-rpc.publicnode.com",
      "https://holesky.gateway.tenderly.co",
    ],
    blockExplorerUrls: ["https://holesky.etherscan.io"],
  },
  polygon_mumbai: {
    chainId: `0x${Number(80001).toString(16)}`,
    chainName: "Polygon Mumbai",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.ankr.com/polygon_mumbai"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
  },
  polygon: {
    chainId: `0x${Number(137).toString(16)}`,
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.ankr.com/polygon"],
    blockExplorerUrls: ["https://polygonscan.com/"],
  },
  bsc: {
    chainId: `0x${Number(56).toString(16)}`,
    chainName: "Binance Smart Chain Mainnet",
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.ankr.com/bsc"],
    blockExplorerUrls: ["https://bscscan.com"],
  },
  base_mainnet: {
    chainId: `0x${Number(8453).toString(16)}`,
    chainName: "Base Mainnet",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.base.org/"],
    blockExplorerUrls: ["https://basescan.org"],
  },
  base_sepolia: {
    chainId: `0x${Number(84532).toString(16)}`,
    chainName: "Base Sepolia",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
  },
  arc_testnet: {
    chainId: `0x${Number(5042002).toString(16)}`,
    chainName: "Arc Testnet",
    nativeCurrency: {
      name: "USDC",
      symbol: "USDC",
      decimals: 6,
    },
    rpcUrls: [
      "https://rpc.testnet.arc.network",
      "https://rpc.blockdaemon.testnet.arc.network",
      "https://rpc.drpc.testnet.arc.network",
      "https://rpc.quicknode.testnet.arc.network",
    ],
    blockExplorerUrls: ["https://testnet.arcscan.app"],
  },
  localhost: {
    chainId: `0x${Number(31337).toString(16)}`,
    chainName: "localhost",
    nativeCurrency: {
      name: "GO",
      symbol: "GO",
      decimals: 18,
    },
    rpcUrls: ["http://127.0.0.1:8545/"],
    blockExplorerUrls: ["http://localhost:8545"],
  },
};

// Changing the networks
const changeNetwork = async ({ networkName }) => {
  try {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    
    // First, try to switch to the network if it already exists
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: networks[networkName].chainId }],
      });
      console.log(`✅ Switched to ${networkName} network`);
    } catch (switchError) {
      // This error code means the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        console.log(`Adding ${networkName} network to MetaMask...`);
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              ...networks[networkName],
            },
          ],
        });
        console.log(`✅ Added and switched to ${networkName} network`);
      } else {
        throw switchError;
      }
    }
  } catch (error) {
    console.error("Network switch error:", error.message);
    throw error;
  }
};

export const handleNetworkSwitch = async (networkName = "sepolia") => {
  await changeNetwork({ networkName });
};

// Helper function to get current network
export const getCurrentNetwork = async () => {
  try {
    if (!window.ethereum) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name,
    };
  } catch (error) {
    console.log("Error getting network:", error);
    return null;
  }
};

export const CHECK_WALLET_CONNECTED = async () => {
  if (!window.ethereum) return console.log("Install Metamask");
  await handleNetworkSwitch("sepolia");

  const account = await window.ethereum.request({ method: "eth_accounts" });

  if (account.length) {
    return account[0];
  } else {
    console.log("Please Install Metamask & Connect, Reload");
  }
};

export const CONNECT_WALLET = async () => {
  try {
    if (!window.ethereum) return console.log("Install Metamask");
    await handleNetworkSwitch("sepolia");
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    return accounts[0];
  } catch (error) {
    console.log(error.message);
  }
};

const fetchContract = (address, abi, signerOrProvider) =>
  new ethers.Contract(address, abi, signerOrProvider);

export const TOKEN_ICO_CONTRACT = async () => {
  try {
    // Check if window and ethereum are available
    if (typeof window === "undefined") {
      console.log("Window is not defined");
      return null;
    }

    if (!window.ethereum) {
      console.log("Please install MetaMask");
      return null;
    }

    // Check if ethers is properly loaded
    if (!ethers || !ethers.BrowserProvider) {
      console.log("Ethers library not properly loaded");
      return null;
    }

    // Use ethers v6 syntax - BrowserProvider instead of Web3Provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = fetchContract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    return contract;
  } catch (error) {
    console.log("TOKEN_ICO_CONTRACT Error:", error.message || error);
    return null;
  }
};

export const ERC20_CONTRACT = async (address) => {
  try {
    // Check if window and ethereum are available
    if (typeof window === "undefined") {
      console.log("Window is not defined");
      return null;
    }

    if (!window.ethereum) {
      console.log("Please install MetaMask");
      return null;
    }

    // Check if ethers is properly loaded
    if (!ethers || !ethers.BrowserProvider) {
      console.log("Ethers library not properly loaded");
      return null;
    }

    // Use ethers v6 syntax - BrowserProvider instead of Web3Provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const tokenAddress = address || TOKEN_ADDRESS;
    const contract = fetchContract(tokenAddress, ERC20_ABI, signer);
    return contract;
  } catch (error) {
    console.log("ERC20_CONTRACT Error:", error.message);
    return null;
  }
};

export const ERC20 = async () => {
  try {
    // Check if window and ethereum are available
    if (typeof window === "undefined") {
      console.log("Window is not defined");
      return null;
    }

    if (!window.ethereum) {
      console.log("Please install MetaMask");
      return null;
    }

    // Check if ethers is properly loaded
    if (!ethers || !ethers.BrowserProvider) {
      console.log("Ethers library not properly loaded");
      return null;
    }

    // Use ethers v6 syntax - BrowserProvider instead of Web3Provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = fetchContract(TOKEN_ADDRESS, ERC20_ABI, signer);
    const network = await provider.getNetwork();
    const userAddress = await signer.getAddress();
    const balance = await contract.balanceOf(userAddress);
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const decimals = await contract.decimals();
    const address = await contract.getAddress();

    const token = {
      address: address,
      name: name,
      symbol: symbol,
      decimals: decimals,
      supply: ethers.formatEther(totalSupply.toString()),
      balance: ethers.formatEther(balance.toString()),
      chainId: network.chainId,
    };

    console.log(token);
    return token;
  } catch (error) {
    console.log("ERC20 Error:", error.message);
    return null;
  }
};

export const GET_BALANCE = async () => {
  try {
    // Check if window and ethereum are available
    if (typeof window === "undefined") {
      console.log("Window is not defined");
      return "0";
    }

    if (!window.ethereum) {
      console.log("Please install MetaMask");
      return "0";
    }

    // Check if ethers is properly loaded
    if (!ethers || !ethers.BrowserProvider) {
      console.log("Ethers library not properly loaded");
      return "0";
    }

    // Use ethers v6 syntax - BrowserProvider instead of Web3Provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const nativeBalance = await provider.getBalance(signer.address);
    return ethers.formatEther(nativeBalance.toString());
  } catch (error) {
    console.log("GET_BALANCE Error:", error.message);
    return "0";
  }
};

export const CHECK_ACCOUNT_BALANCE = async (ADDRESS) => {
  try {
    // Check if window and ethereum are available
    if (typeof window === "undefined") {
      console.log("Window is not defined");
      return "0";
    }

    if (!window.ethereum) {
      console.log("Please install MetaMask");
      return "0";
    }

    // Check if ethers is properly loaded
    if (!ethers || !ethers.BrowserProvider) {
      console.log("Ethers library not properly loaded");
      return "0";
    }

    // Use ethers v6 syntax - BrowserProvider instead of Web3Provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    const maticBal = await provider.getBalance(ADDRESS);

    return ethers.formatEther(maticBal.toString());
  } catch (error) {
    console.log("CHECK_ACCOUNT_BALANCE Error:", error.message);
    return "0";
  }
};

const tokenImage =
  "https://www.daulathussain.com/wp-content/uploads/2024/05/theblockchaincoders.jpg";

export const addTokenToMetamask = async () => {
  if (window.ethereum) {
    try {
      const tokenDetails = await ERC20();
      const tokenDecimals = tokenDetails?.decimals || 18;
      const tokenAddress = TOKEN_ADDRESS;
      const tokenSymbol = tokenDetails?.symbol || "TKN";

      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      });

      if (wasAdded) {
        return "Token added";
      } else {
        return "Token not added";
      }
    } catch (error) {
      console.log(error);
      return "Failed to add token";
    }
  } else {
    return "Metamask not found";
  }
};

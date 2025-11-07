import { ethers } from "ethers";
import Web3Modal from "web3modal";

// Internal Imports
import tokenICO from "./TokenICO.json";
import erc20 from "./ERC20.json";

export const TOKEN_ADDRESS = "0x033043c2DA7Fa1f4227e3BA4835A58092A95A5F2";
export const ERC20_ABI = erc20.abi;
export const OWNER_ADDRESS = "0xfec13f54150e2edf64a07a8bbe8672e10a35e9cd";
export const CONTRACT_ADDRESS = "0x8Ba3dC1769b1b5df651500A66ff56ac350F1F85a";
export const CONTRACT_ABI = tokenICO.abi;

// networks object to store network configurations
const networks = {
  sepolia: {
    chainId: `0x${Number(11155111).toString(16)}`,
    chainName: "Sepolia",
    nativeCurrency: {
      name: "SepoliaETH",
      symbol: "SepoliaETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.infura.io/v3/"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  holesky: {
    chainId: `0x${Number(17000).toString(16)}`,
    chainName: "Holesky",
    nativeCurrency: {
      name: "holesky",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.ankr.com/eth_holesky"],
    blockExplorerUrls: ["https://holesky.etherscan.io/"],
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
    chainId: `0x${Number(1244).toString(16)}`,
    chainName: "Arc Testnet",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.arc.gmi.sh"],
    blockExplorerUrls: ["https://testnet.arcscan.net"],
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
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          ...networks[networkName],
        },
      ],
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const handleNetworkSwitch = async (networkName = "holesky") => {
  await changeNetwork({ networkName });
};

export const CHECK_WALLET_CONNECTED = async () => {
  if (!window.ethereum) return console.log("Install Metamask");
  await handleNetworkSwitch();

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
    await handleNetworkSwitch();
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
    if (!window.ethereum) {
      console.log("Please install MetaMask");
      return null;
    }
    
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    
    if (!connection) {
      console.log("Failed to connect to wallet");
      return null;
    }
    
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    return contract;
  } catch (error) {
    console.log("TOKEN_ICO_CONTRACT Error:", error.message);
    return null;
  }
};

export const ERC20_CONTRACT = async (address) => {
  try {
    if (!window.ethereum) {
      console.log("Please install MetaMask");
      return null;
    }
    
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    
    if (!connection) {
      console.log("Failed to connect to wallet");
      return null;
    }
    
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
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
    if (!window.ethereum) {
      console.log("Please install MetaMask");
      return null;
    }
    
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    
    if (!connection) {
      console.log("Failed to connect to wallet");
      return null;
    }
    
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(TOKEN_ADDRESS, ERC20_ABI, signer);
    const network = await provider.getNetwork();
    const userAddress = await signer.getAddress();
    const balance = await contract.balanceOf(userAddress);
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const decimals = await contract.decimals();
    const address = contract.address;

    const token = {
      address: address,
      name: name,
      symbol: symbol,
      decimals: decimals,
      supply: ethers.utils.formatEther(totalSupply.toString()),
      balance: ethers.utils.formatEther(balance.toString()),
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
    if (!window.ethereum) {
      console.log("Please install MetaMask");
      return "0";
    }
    
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    
    if (!connection) {
      console.log("Failed to connect to wallet");
      return "0";
    }
    
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const nativeBalance = await signer.getBalance();
    return ethers.utils.formatEther(nativeBalance.toString());
  } catch (error) {
    console.log("GET_BALANCE Error:", error.message);
    return "0";
  }
};

export const CHECK_ACCOUNT_BALANCE = async (ADDRESS) => {
  try {
    if (!window.ethereum) {
      console.log("Please install MetaMask");
      return "0";
    }
    
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    
    if (!connection) {
      console.log("Failed to connect to wallet");
      return "0";
    }
    
    const provider = new ethers.providers.Web3Provider(connection);

    const maticBal = await provider.getBalance(ADDRESS);

    return ethers.utils.formatEther(maticBal.toString());
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

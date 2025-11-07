# 🚀 Quick Deployment Guide - Holesky Network

## Current Status
- **Network**: Holesky (Chain ID: 17000) ✅ Connected
- **Contract Address**: `0x8Ba3dC1769b1b5df651500A66ff56ac350F1F85a`
- **Status**: ⚠️ **NOT DEPLOYED** - Contract needs to be deployed to Holesky

## ⚡ Quick Fix Options

### Option 1: Deploy Contracts to Holesky (Recommended)

#### Step 1: Get Holesky Test ETH
Get free test ETH from these faucets:
- https://holesky-faucet.pk910.de/
- https://faucet.quicknode.com/ethereum/holesky
- https://cloud.google.com/application/web3/faucet/ethereum/holesky

#### Step 2: Set Up Hardhat for Holesky

Create or update `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    holesky: {
      url: "https://rpc.ankr.com/eth_holesky",
      accounts: [process.env.PRIVATE_KEY], // Add your private key in .env
      chainId: 17000
    }
  }
};
```

#### Step 3: Create .env File

```bash
# Create .env file (DON'T COMMIT THIS!)
echo "PRIVATE_KEY=your_metamask_private_key_here" > .env
```

**⚠️ IMPORTANT**: Add `.env` to your `.gitignore` file!

#### Step 4: Deploy the Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to Holesky
npx hardhat run scripts/deploy.js --network holesky
```

#### Step 5: Update Contract Addresses

After deployment, you'll get new addresses. Update them in `context/constants.js`:

```javascript
export const TOKEN_ADDRESS = "YOUR_NEW_ERC20_ADDRESS";
export const CONTRACT_ADDRESS = "YOUR_NEW_ICO_CONTRACT_ADDRESS";
```

---

### Option 2: Use Already Deployed Contracts (If Available)

If you have contracts already deployed on Holesky:

1. Find your deployed contract addresses
2. Update `context/constants.js`:
   ```javascript
   export const TOKEN_ADDRESS = "your_erc20_token_address";
   export const CONTRACT_ADDRESS = "your_ico_contract_address";
   ```
3. Refresh your DApp

---

### Option 3: Switch to a Network Where Contracts Are Deployed

If you have contracts on another network (e.g., Sepolia):

1. **Switch MetaMask** to that network
2. **Update** `context/index.js`:
   ```javascript
   const network = "sepolia"; // or your network name
   ```
3. **Ensure CONTRACT_ADDRESS** in `constants.js` matches that network

---

## 📋 Deployment Script Example

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying to Holesky...");

  // Deploy ERC20 Token
  const Token = await hre.ethers.getContractFactory("ERC20Token");
  const token = await Token.deploy("MyToken", "MTK", 1000000);
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // Deploy ICO Contract
  const TokenICO = await hre.ethers.getContractFactory("TokenICO");
  const tokenICO = await TokenICO.deploy(token.address, hre.ethers.utils.parseEther("0.001"));
  await tokenICO.deployed();
  console.log("TokenICO deployed to:", tokenICO.address);

  console.log("\n=== UPDATE THESE IN context/constants.js ===");
  console.log("TOKEN_ADDRESS:", token.address);
  console.log("CONTRACT_ADDRESS:", tokenICO.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

## 🔍 Verify Deployment

After deploying, verify on Holesky Etherscan:
- Token Contract: `https://holesky.etherscan.io/address/YOUR_TOKEN_ADDRESS`
- ICO Contract: `https://holesky.etherscan.io/address/YOUR_ICO_ADDRESS`

---

## ⚠️ Common Issues

### "insufficient funds for intrinsic transaction cost"
- **Solution**: Get more test ETH from the faucets above

### "network does not support ENS"
- **Solution**: This is normal on testnets, ignore this warning

### "cannot estimate gas"
- **Solution**: Check that your contract constructor parameters are correct

---

## 📝 Checklist

- [ ] Got Holesky test ETH
- [ ] Created `hardhat.config.js` with Holesky network
- [ ] Created `.env` with PRIVATE_KEY (and added to .gitignore!)
- [ ] Compiled contracts (`npx hardhat compile`)
- [ ] Deployed contracts (`npx hardhat run scripts/deploy.js --network holesky`)
- [ ] Updated CONTRACT_ADDRESS and TOKEN_ADDRESS in `context/constants.js`
- [ ] Verified contracts on Holesky Etherscan
- [ ] Refreshed the DApp

---

## 🆘 Need Help?

If deployment fails, check:
1. Do you have enough Holesky ETH? (Check MetaMask)
2. Is your private key in .env correct?
3. Are your contracts in the `contracts/` folder?
4. Did you run `npx hardhat compile` first?

Check the console for detailed error messages!

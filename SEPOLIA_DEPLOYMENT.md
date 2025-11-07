# 🚀 Deploy to Sepolia Network - Quick Guide

## ✅ Network Configuration Updated

Your DApp is now configured to use **Sepolia Testnet**.

---

## 📋 Quick Deployment Steps

### Step 1: Switch MetaMask to Sepolia

1. Open MetaMask
2. Click the network dropdown at the top
3. Select **Sepolia Test Network**
   - If you don't see it, click "Show test networks" in settings

### Step 2: Get Sepolia Test ETH

Visit any of these faucets (you'll need at least 0.1 ETH):
- 🚰 **Alchemy**: https://www.alchemy.com/faucets/ethereum-sepolia
- 🚰 **Sepolia Faucet**: https://sepoliafaucet.com/
- 🚰 **Google Cloud**: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- 🚰 **Infura**: https://www.infura.io/faucet/sepolia

### Step 3: Set Up Environment

```bash
# Create .env file from example
cp .env.example .env
```

Edit `.env` and add your private key:
```bash
PRIVATE_KEY=your_metamask_private_key_without_0x
```

**To get your private key:**
1. MetaMask → Click 3 dots → Account Details
2. Click "Show Private Key"
3. Enter password and copy the key

### Step 4: Deploy Contracts

```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

Expected output:
```
✅ ERC20 Token deployed to: 0xABC123...
✅ TokenICO Contract deployed to: 0xDEF456...
```

### Step 5: Update Contract Addresses

Copy the deployed addresses and update `context/constants.js`:

```javascript
export const TOKEN_ADDRESS = "0xYOUR_ERC20_TOKEN_ADDRESS";
export const CONTRACT_ADDRESS = "0xYOUR_ICO_CONTRACT_ADDRESS";
```

### Step 6: Verify on Sepolia Etherscan

Check your deployments:
- **Token**: `https://sepolia.etherscan.io/address/YOUR_TOKEN_ADDRESS`
- **ICO**: `https://sepolia.etherscan.io/address/YOUR_ICO_ADDRESS`

### Step 7: Test Your DApp

1. Refresh your browser
2. Make sure MetaMask is on Sepolia
3. Connect your wallet
4. Start using your ICO DApp! 🎉

---

## 🔍 Sepolia Network Details

- **Chain ID**: 11155111
- **RPC URL**: https://rpc.sepolia.org
- **Explorer**: https://sepolia.etherscan.io
- **Currency**: SepoliaETH

---

## 🐛 Troubleshooting

### "insufficient funds for intrinsic transaction cost"
**Solution**: Get more Sepolia ETH from the faucets above

### "network does not support ENS"
**Solution**: This is normal, just a warning - ignore it

### Deployment takes too long
**Solution**: Sepolia can be slow. Wait 2-3 minutes. Check on Sepolia Etherscan

### "Invalid address" error
**Solution**: Make sure you updated both TOKEN_ADDRESS and CONTRACT_ADDRESS in constants.js

---

## ✅ Checklist

Before using your DApp:

- [ ] MetaMask connected to Sepolia network
- [ ] Have Sepolia test ETH (check balance)
- [ ] Created `.env` file with private key
- [ ] Ran `npx hardhat run scripts/deploy.js --network sepolia`
- [ ] Updated `TOKEN_ADDRESS` in `context/constants.js`
- [ ] Updated `CONTRACT_ADDRESS` in `context/constants.js`
- [ ] Verified contracts on Sepolia Etherscan
- [ ] Refreshed browser and connected wallet

---

## 🎯 Expected Console Messages

After deployment and page refresh, you should see:
```
✅ Connected to network: sepolia (Chain ID: 11155111)
```

If you see this instead:
```
⚠️ Contract not deployed at [address] on sepolia
```

Then you need to deploy the contracts first (Step 4 above).

---

## 📞 Need Help?

Check the browser console for detailed messages:
- Network info
- Contract addresses being used
- Specific error messages with solutions

Good luck! 🚀

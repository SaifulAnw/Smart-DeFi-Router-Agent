# Token ICO DApp Setup Guide

## ⚠️ Important: Network Configuration

This DApp is configured to work on the **Sepolia Testnet**.

### Current Contract Addresses:
- **Token ICO Contract**: `0x8Ba3dC1769b1b5df651500A66ff56ac350F1F85a`
- **ERC20 Token Contract**: `0x033043c2DA7Fa1f4227e3BA4835A58092A95A5F2`
- **Expected Network**: Sepolia (Chain ID: 11155111)

## 🔧 Setup Steps

### 1. Connect MetaMask to Sepolia Network

**Option A: Automatic Network Switch**
- The app will automatically prompt you to switch to Sepolia when you connect your wallet
- Click "Switch Network" when prompted

**Option B: Manual Setup**
If the automatic switch doesn't work, add Sepolia manually:
1. Open MetaMask
2. Click the network dropdown at the top
3. Click "Add Network" or "Add Network Manually"
4. Enter the following details:
   - **Network Name**: Sepolia
   - **RPC URL**: `https://sepolia.infura.io/v3/` or `https://rpc.sepolia.org`
   - **Chain ID**: 11155111
   - **Currency Symbol**: ETH
   - **Block Explorer**: https://sepolia.etherscan.io

### 2. Get Sepolia Test ETH

You need test ETH to interact with the contract:
- **Sepolia Faucet 1**: https://sepoliafaucet.com/
- **Sepolia Faucet 2**: https://www.alchemy.com/faucets/ethereum-sepolia
- **Sepolia Faucet 3**: https://cloud.google.com/application/web3/faucet/ethereum/sepolia

### 3. Verify Contract Deployment

Before using the app, verify the contracts are deployed:
1. Visit: https://sepolia.etherscan.io/address/0x8Ba3dC1769b1b5df651500A66ff56ac350F1F85a
2. Check if the contract code exists
3. If not, you need to deploy the contracts first

## 🚀 Deploying Contracts (If Not Deployed)

If the contracts aren't deployed on Sepolia, you'll need to:

1. **Compile the contracts**:
   ```bash
   # Navigate to your project directory
   npx hardhat compile
   ```

2. **Deploy to Sepolia**:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

3. **Update the contract addresses** in `context/constants.js`:
   ```javascript
   export const TOKEN_ADDRESS = "YOUR_ERC20_TOKEN_ADDRESS";
   export const CONTRACT_ADDRESS = "YOUR_ICO_CONTRACT_ADDRESS";
   ```

## 🐛 Troubleshooting

### Error: "Contract not found on current network"
**Solution**: 
- Make sure you're connected to Sepolia network in MetaMask
- Check the console for current network information
- Verify the contract is deployed at the specified address

### Error: "CALL_EXCEPTION"
**Cause**: The contract doesn't exist at the specified address on your current network

**Solution**:
1. Check your current network in MetaMask
2. Switch to Sepolia network
3. OR deploy the contract to your current network
4. OR update the `CONTRACT_ADDRESS` in `context/constants.js`

### Error: "Missing revert data"
**Cause**: Contract call failed - usually means contract is not deployed

**Solution**:
- Deploy the contracts to Sepolia
- OR update the network configuration to match where your contracts are deployed

## 📝 Changing Networks

To use a different network (e.g., Holesky, Polygon Mumbai):

1. Edit `context/index.js`:
   ```javascript
   const network = "holesky"; // Change this to your desired network
   ```

2. Make sure your contracts are deployed on that network

3. Update the contract addresses in `context/constants.js`

## ✅ Verification Checklist

Before running the app, ensure:
- [ ] MetaMask is installed
- [ ] Connected to Sepolia network
- [ ] Have test ETH in your wallet
- [ ] Contracts are deployed at the specified addresses
- [ ] Contract addresses in `constants.js` are correct

## 🔗 Useful Links

- **Sepolia Etherscan**: https://sepolia.etherscan.io
- **MetaMask**: https://metamask.io
- **Hardhat Documentation**: https://hardhat.org/docs

---

**Need Help?** Check the browser console for detailed error messages and network information.

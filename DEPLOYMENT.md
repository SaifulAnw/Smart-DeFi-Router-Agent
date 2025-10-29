# Deployment Records

## HelloArchitect Contract

### ARC Testnet Deployment

**Deployment Date:** October 29, 2025

| Parameter | Value |
|-----------|-------|
| Contract | HelloArchitect |
| Address | `0x1D737aE96186151D09F485c55c02BBDd27904fdD` |
| Network | ARC Testnet |
| Chain ID | 5042002 |
| RPC URL | https://rpc.testnet.arc.network |
| Block Number | 8346004 |
| Transaction Hash | `0x217c0be8fdecd6158bd6cb5478ccb0a1a1d4ebd404eec433dcffa22e73c6648e` |
| Gas Used | 442,954 |
| Deployment Cost | 0.350819568 ETH |

### Block Explorer

- **Transaction:** `https://testnet.arcscan.com/tx/0x217c0be8fdecd6158bd6cb5478ccb0a1a1d4ebd404eec433dcffa22e73c6648e`
- **Contract:** `https://testnet.arcscan.com/address/0x1D737aE96186151D09F485c55c02BBDd27904fdD`

### Contract Functions

- `getGreeting()` - Returns the current greeting (view function)
- `setGreeting(string newGreeting)` - Updates the greeting and emits an event

### Quick Interactions

```bash
# Get current greeting
cast call 0x1D737aE96186151D09F485c55c02BBDd27904fdD "getGreeting()(string)" --rpc-url https://rpc.testnet.arc.network

# Set new greeting (requires private key)
source .env
cast send 0x1D737aE96186151D09F485c55c02BBDd27904fdD "setGreeting(string)" "Your message" \
    --rpc-url $ARC_TESTNET_RPC_URL \
    --private-key $ARC_PRIVATE_KEY

# Or use the interactive script
./interact.sh
```

### Verification Status

❌ **Not Verified** - Sourcify does not support ARC Testnet (Chain ID 5042002) yet.

Manual verification may be possible through ARC's block explorer if they provide that feature.

---

## Future Deployments

Add new deployment records below...


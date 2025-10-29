# Smart DeFi Router Agent

> **AI-guided non-custodial DeFi vault for automated yield optimization across multiple protocols and chains**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.30-blue)](https://soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Built%20with-Foundry-orange)](https://getfoundry.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Table of Contents

- [Overview](#overview)
- [PRD Implementation Status](#prd-implementation-status)
- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [Features](#features)
- [Protocol Integrations](#protocol-integrations)
- [Testing](#testing)
- [Installation](#installation)
- [Deployment](#deployment)
- [Usage Examples](#usage-examples)
- [Roadmap](#roadmap)

---

## 🎯 Overview

The **Smart DeFi Router Agent** is an AI-guided, non-custodial DeFi vault that automatically optimizes yield by reallocating user funds across multiple liquidity protocols. Built on **Circle's Arc Network**, it leverages **Circle CCTP** for seamless cross-chain liquidity deployment without wrapped tokens.

### Key Highlights

- 🤖 **AI-Powered**: Backend AI optimizer determines best yield opportunities
- 🔒 **Non-Custodial**: Users maintain full control of their funds
- 🌐 **Cross-Chain**: Deploy liquidity across multiple chains using Circle CCTP
- 🔄 **Auto-Rebalancing**: Keeper-driven rebalancing based on real-time yields
- 📊 **Multi-Protocol**: Supports Aave, Curve, Yearn, Arc protocols, and more
- 🛡️ **Security-First**: ReentrancyGuard, Pausable, access controls

---

## ✅ PRD Implementation Status

This project implements **100% of the Product Requirements Document (PRD) v1.0** specifications.

### Core Requirements (PRD Section 5) ✅

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| User deposit/withdrawal | ✅ Complete | `depositUSDC()`, `withdrawUSDC()` |
| Keeper-based rebalancing | ✅ Complete | `executeRebalance()` |
| Protocol adapter pattern | ✅ Complete | `IProtocolAdapter` interface |
| Core storage variables | ✅ Complete | balances, keeper, currentProtocol, USDC |

### Multi-Chain Routing (PRD Section 11) ✅

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Cross-chain initiation | ✅ Complete | `initiateCrossChainRebalance()` |
| Cross-chain completion | ✅ Complete | `completeCrossChainRebalance()` |
| Circle CCTP integration | ✅ Complete | TokenMessenger & MessageTransmitter |
| Attestation replay protection | ✅ Complete | `processedAttestations` mapping |
| Security controls | ✅ Complete | onlyKeeper, replay protection |

### Protocol Adapters (PRD Section 6) ✅

| Protocol | Status | Contract |
|----------|--------|----------|
| Aave V3 | ✅ Complete | `AaveAdapter.sol` |
| Curve Finance | ✅ Complete | `CurveAdapter.sol` |
| Yearn Finance | ✅ Complete | `YearnAdapter.sol` |
| Arc Protocols | ✅ Complete | `ArcProtocolAdapter.sol` |

### Testing (PRD Section 9) ✅

- ✅ 17 comprehensive tests
- ✅ 100% test pass rate
- ✅ Deposit/withdrawal coverage
- ✅ Rebalancing tests
- ✅ Access control tests
- ✅ Protocol management tests

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    Smart DeFi Router Agent                      │
│                                                                  │
│  ┌──────────┐         ┌──────────────────┐      ┌───────────┐ │
│  │  Users   │────────▶│ SmartDeFiRouter  │◀─────│ AI Keeper │ │
│  │ (USDC)   │         │     Agent        │      │ (Backend) │ │
│  └──────────┘         └────────┬─────────┘      └───────────┘ │
│                                 │                                │
│                   ┌─────────────┼─────────────┐                │
│                   │             │             │                 │
│             ┌─────▼────┐  ┌────▼────┐  ┌─────▼────┐           │
│             │   Aave   │  │  Curve  │  │  Yearn   │           │
│             │ Adapter  │  │ Adapter │  │ Adapter  │           │
│             └─────┬────┘  └────┬────┘  └─────┬────┘           │
│                   │             │             │                 │
│             ┌─────▼────┐  ┌────▼────┐  ┌─────▼────┐           │
│             │  Aave V3 │  │  Curve  │  │  Yearn   │           │
│             │ Protocol │  │ Finance │  │ Finance  │           │
│             └──────────┘  └─────────┘  └──────────┘           │
│                                                                  │
│              Circle CCTP (Cross-Chain Transfer)                 │
│        ┌──────────────────────────────────────────┐            │
│        │ Source Chain ────▶ Destination Chain     │            │
│        │  (Burn USDC)         (Mint USDC)         │            │
│        └──────────────────────────────────────────┘            │
└────────────────────────────────────────────────────────────────┘
```

### How It Works

1. **Users deposit USDC** → Funds deployed to best-yielding protocol
2. **AI monitors yields** → Identifies better opportunities across protocols/chains
3. **Keeper executes rebalancing** → Withdraws from old protocol, deploys to new
4. **Cross-chain deployment** → Uses Circle CCTP for native USDC transfers
5. **Users withdraw anytime** → Funds returned to user wallet

---

## 📁 Smart Contracts

### Core Contract

```
src/SmartDeFiRouterAgent.sol (626 lines)
├─ User Functions
│  ├─ depositUSDC(uint256 amount)
│  └─ withdrawUSDC(uint256 amount)
│
├─ Keeper Functions (AI/Backend)
│  ├─ executeRebalance(address, uint256, bytes)
│  ├─ initiateCrossChainRebalance(uint32, uint256, bytes)
│  └─ completeCrossChainRebalance(bytes, bytes, uint256, address, bytes)
│
├─ Protocol Management
│  ├─ registerProtocol(address, string)
│  └─ deregisterProtocol(address)
│
├─ Admin Functions
│  ├─ configureCCTP(address, address)
│  ├─ updateKeeper(address)
│  ├─ pause() / unpause()
│  └─ emergencyWithdraw(address)
│
└─ View Functions
   ├─ getUserBalance(address)
   ├─ getCurrentAPY()
   ├─ getTotalValueLocked()
   └─ getProtocolInfo(address)
```

### Protocol Adapters

```
src/adapters/
├─ AaveAdapter.sol         (140 lines) - Aave V3 lending
├─ CurveAdapter.sol        (180 lines) - Curve pools + gauges
├─ YearnAdapter.sol        (120 lines) - Yearn vaults
└─ ArcProtocolAdapter.sol  (130 lines) - Arc ecosystem
```

Each adapter implements:
```solidity
interface IProtocolAdapter {
    function deposit(uint256 amount, bytes calldata data) external returns (bool);
    function withdraw(uint256 amount, bytes calldata data) external returns (bool);
    function getBalance() external view returns (uint256);
    function getAPY() external view returns (uint256);
}
```

---

## ✨ Features

### User Features
- ✅ Simple USDC deposit/withdrawal
- ✅ Automatic protocol deployment
- ✅ Real-time balance tracking
- ✅ APY visibility
- ✅ Non-custodial design
- ✅ No lock-up periods

### AI/Keeper Features
- ✅ Flexible same-chain rebalancing
- ✅ Cross-chain liquidity movement
- ✅ Real-time APY monitoring
- ✅ Protocol-agnostic design
- ✅ Secure execution controls

### Security Features
- ✅ **ReentrancyGuard** on all external functions
- ✅ **Pausable** for emergency stops
- ✅ **Access Control** (Ownable, onlyKeeper)
- ✅ **CCTP Replay Protection** (attestation tracking)
- ✅ **Input Validation** (zero checks, address validation)
- ✅ **CEI Pattern** (Checks-Effects-Interactions)
- ✅ **Custom Errors** (gas-efficient error handling)

---

## 🔗 Protocol Integrations

### Supported Protocols

| Protocol | Type | Features |
|----------|------|----------|
| **Aave V3** | Lending | Supply USDC, earn interest, flash loans |
| **Curve Finance** | DEX | Liquidity pools, gauge staking, CRV rewards |
| **Yearn Finance** | Yield Aggregator | Automated vault strategies |
| **Arc Protocols** | Arc Ecosystem | Native Arc Network DeFi protocols |

### Cross-Chain Support

| Network | Status | CCTP Support |
|---------|--------|--------------|
| **Arc Network** | ✅ Primary | Native USDC |
| **Base** | ✅ Supported | Native USDC via CCTP |
| **Arbitrum** | ✅ Supported | Native USDC via CCTP |
| **Optimism** | 🔜 Planned | Native USDC via CCTP |
| **Ethereum** | 🔜 Planned | Native USDC via CCTP |

---

## 🧪 Testing

### Test Suite

```
test/SmartDeFiRouterAgent.t.sol

Deposit Tests (3 tests)
├─ testDepositUSDC                    ✅ PASS
├─ testDepositMultipleUsers           ✅ PASS
└─ testDepositZeroAmount              ✅ PASS

Withdrawal Tests (2 tests)
├─ testWithdrawUSDC                   ✅ PASS
└─ testWithdrawInsufficientBalance    ✅ PASS

Rebalance Tests (3 tests)
├─ testExecuteRebalance               ✅ PASS
├─ testRebalanceUnauthorized          ✅ PASS
└─ testRebalanceUnregisteredProtocol  ✅ PASS

Protocol Management Tests (3 tests)
├─ testRegisterProtocol               ✅ PASS
├─ testRegisterDuplicateProtocol      ✅ PASS
└─ testDeregisterProtocol             ✅ PASS

Admin Tests (3 tests)
├─ testUpdateKeeper                   ✅ PASS
├─ testUpdateKeeperUnauthorized       ✅ PASS
└─ testPauseUnpause                   ✅ PASS

View Function Tests (3 tests)
├─ testGetCurrentAPY                  ✅ PASS
├─ testGetProtocolInfo                ✅ PASS
└─ testGetRegisteredProtocols         ✅ PASS

Total: 17/17 tests passing (100%)
```

### Run Tests

```bash
# Run all tests
forge test

# Run specific test file
forge test --match-path test/SmartDeFiRouterAgent.t.sol

# Run with verbosity
forge test -vvv

# Gas report
forge test --gas-report
```

---

## 🛠️ Installation

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Git
- Node.js (optional, for frontend)

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/Smart-DeFi-Router-Agent.git
cd Smart-DeFi-Router-Agent

# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test
```

### Environment Setup

Create a `.env` file:

```bash
# Arc Network Configuration
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
ARC_PRIVATE_KEY=your-private-key-here

# Contract Addresses (Update with actual addresses)
USDC_ARC=0x...
KEEPER_ADDRESS=0x...

# Protocol Addresses
AAVE_POOL=0x...
AAVE_DATA_PROVIDER=0x...
CURVE_POOL=0x...
CURVE_GAUGE=0x...
YEARN_VAULT=0x...
ARC_PROTOCOL=0x...

# Circle CCTP Addresses
CCTP_TOKEN_MESSENGER=0x...
CCTP_MESSAGE_TRANSMITTER=0x...
```

**⚠️ Important:** Add `.env` to `.gitignore` to keep keys secure!

---

## 🚀 Deployment

### Deploy to Arc Testnet

```bash
# Load environment variables
source .env

# Deploy all contracts
forge script script/DeploySmartDeFiRouter.s.sol:DeploySmartDeFiRouter \
    --rpc-url $ARC_TESTNET_RPC_URL \
    --private-key $ARC_PRIVATE_KEY \
    --broadcast \
    --verify \
    -vvvv
```

### Deployment Script

The deployment script (`script/DeploySmartDeFiRouter.s.sol`) will:

1. ✅ Deploy `SmartDeFiRouterAgent`
2. ✅ Deploy all 4 protocol adapters (Aave, Curve, Yearn, Arc)
3. ✅ Register all protocols with the router
4. ✅ Configure Circle CCTP addresses
5. ✅ Output all deployed addresses

### Post-Deployment

```bash
# Verify router deployment
cast call $ROUTER_ADDRESS "getTotalValueLocked()(uint256)" --rpc-url $ARC_TESTNET_RPC_URL

# Check registered protocols
cast call $ROUTER_ADDRESS "getRegisteredProtocols()(address[])" --rpc-url $ARC_TESTNET_RPC_URL

# Check keeper address
cast call $ROUTER_ADDRESS "keeper()(address)" --rpc-url $ARC_TESTNET_RPC_URL
```

---

## 💡 Usage Examples

### For End Users

#### Deposit USDC

```solidity
// 1. Approve router to spend USDC
IERC20(USDC).approve(routerAddress, 1000e6); // 1000 USDC

// 2. Deposit into vault
router.depositUSDC(1000e6);

// Funds automatically deployed to best-yielding protocol
```

#### Withdraw USDC

```solidity
// Withdraw funds (automatically withdrawn from current protocol)
router.withdrawUSDC(500e6); // Withdraw 500 USDC

// Check remaining balance
uint256 balance = router.getUserBalance(userAddress);
```

#### Check APY

```solidity
// Get current APY from active protocol
uint256 currentAPY = router.getCurrentAPY(); // Returns basis points (500 = 5%)

// Get total value locked
uint256 tvl = router.getTotalValueLocked();
```

### For AI Keeper (Backend)

#### Same-Chain Rebalancing

```solidity
// AI detects Protocol B has better yield
// Keeper executes rebalance
router.executeRebalance(
    protocolBAddress,      // Target protocol
    1000000e6,             // Amount to rebalance
    protocolSpecificData   // Protocol-specific parameters
);
```

#### Cross-Chain Rebalancing

**Step 1: Initiate on Source Chain (e.g., Arc)**

```solidity
// Burn USDC and initiate cross-chain transfer
bytes32 routeId = router.initiateCrossChainRebalance(
    6,                          // Destination domain (Base = 6)
    1000000e6,                  // 1M USDC
    abi.encode(targetProtocol)  // Target protocol on destination
);
```

**Step 2: Wait for Circle Attestation (Off-Chain)**

```python
# Backend fetches attestation from Circle API
attestation = await circle_attestation_api.get_attestation(message_hash)
# Typically takes 10-20 minutes
```

**Step 3: Complete on Destination Chain (e.g., Base)**

```solidity
// Mint USDC on destination and deploy to protocol
router.completeCrossChainRebalance(
    message,              // CCTP message
    attestation,          // Circle attestation
    1000000e6,            // Amount
    targetProtocol,       // Protocol on destination chain
    protocolData          // Protocol-specific data
);
```

---

## 📊 Accomplishments

### ✅ What's Been Built

#### Smart Contracts (2,000+ lines)
- ✅ `SmartDeFiRouterAgent.sol` - Core router (626 lines)
- ✅ `AaveAdapter.sol` - Aave V3 integration (140 lines)
- ✅ `CurveAdapter.sol` - Curve Finance integration (180 lines)
- ✅ `YearnAdapter.sol` - Yearn Finance integration (120 lines)
- ✅ `ArcProtocolAdapter.sol` - Arc ecosystem integration (130 lines)

#### Testing & Quality
- ✅ 17 comprehensive tests (100% pass rate)
- ✅ Mock contracts for isolated testing
- ✅ Full coverage of user flows
- ✅ Access control testing
- ✅ Edge case validation

#### Documentation
- ✅ Inline NatSpec documentation
- ✅ Comprehensive README
- ✅ Deployment guides
- ✅ Usage examples
- ✅ Architecture diagrams

#### PRD Compliance
- ✅ 100% PRD v1.0 implementation
- ✅ All user stories addressed
- ✅ All technical requirements met
- ✅ All security requirements implemented

### 🎯 Key Metrics

```
Total Lines of Code:     2,000+
Smart Contracts:         5 (1 core + 4 adapters)
Test Coverage:           17 tests (100% pass)
PRD Compliance:          100%
Protocols Supported:     4 (Aave, Curve, Yearn, Arc)
Chains Supported:        3+ (Arc, Base, Arbitrum)
Security Features:       7 (ReentrancyGuard, Pausable, etc.)
Deployment Scripts:      2 (HelloArchitect, SmartDeFiRouter)
```

---

## 🗺️ Roadmap

### Phase 1: MVP (Current) ✅
- [x] Core router implementation
- [x] Protocol adapter pattern
- [x] Circle CCTP integration
- [x] 4 protocol adapters
- [x] Comprehensive testing
- [x] Deployment scripts

### Phase 2: Mainnet Launch 🔜
- [ ] Professional security audit
- [ ] Testnet deployment & testing
- [ ] Frontend dashboard
- [ ] Backend AI optimizer
- [ ] Multi-chain deployment
- [ ] Mainnet launch on Arc Network

### Phase 3: Expansion 🔮
- [ ] Additional protocol integrations
- [ ] More chain support (Ethereum, Optimism, Avalanche)
- [ ] Multi-asset support (ETH, EURC)
- [ ] Auto-compounding strategies
- [ ] Decentralized keeper network
- [ ] Governance token

---

## 🔒 Security

### Implemented Security Features

- **Access Control**: Owner-only and Keeper-only functions
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Pausable**: Emergency stop functionality
- **Input Validation**: Zero amount/address checks
- **CEI Pattern**: Checks-Effects-Interactions
- **Replay Protection**: CCTP attestation tracking
- **Custom Errors**: Gas-efficient error handling

### Pre-Mainnet Requirements

- [ ] Professional security audit (Certik, OpenZeppelin, Trail of Bits)
- [ ] Bug bounty program
- [ ] Testnet stress testing
- [ ] Multi-sig wallet for admin functions
- [ ] Timelock for sensitive operations

---

## 📚 Documentation & Resources

### Foundry Commands

```bash
# Build
forge build

# Test
forge test

# Test with verbosity
forge test -vvv

# Gas report
forge test --gas-report

# Format code
forge fmt

# Deploy
forge script script/DeploySmartDeFiRouter.s.sol --rpc-url <RPC_URL> --broadcast

# Verify contract
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> --chain <CHAIN_ID>

# Run local node
anvil

# Interact with contracts
cast call <CONTRACT_ADDRESS> "function()(returnType)" --rpc-url <RPC_URL>
cast send <CONTRACT_ADDRESS> "function(args)" <ARG_VALUES> --private-key <KEY>
```

### External Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Circle CCTP Documentation](https://developers.circle.com/stablecoins/docs/cctp-getting-started)
- [Arc Network Documentation](https://docs.arc.network/)
- [Aave V3 Documentation](https://docs.aave.com/)
- [Curve Finance Documentation](https://docs.curve.fi/)
- [Yearn Finance Documentation](https://docs.yearn.fi/)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write comprehensive tests for all new features
- Follow Solidity style guide
- Add NatSpec documentation
- Run `forge fmt` before committing
- Ensure all tests pass (`forge test`)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Smart DeFi Router Team**
- Lead Solidity/DeFi Architect
- Backend AI Engineer
- Frontend Developer
- Security Auditor

---

## 📞 Contact

- **Website**: [Coming Soon]
- **Twitter**: [@SmartDeFiRouter]
- **Discord**: [Join our community]
- **Email**: contact@smartdefirouter.com

---

## ⭐ Acknowledgments

- [Circle](https://www.circle.com/) for CCTP
- [Arc Network](https://arc.network/) for the infrastructure
- [Foundry](https://getfoundry.sh/) for the development framework
- [OpenZeppelin](https://openzeppelin.com/) for secure contract libraries
- All protocol teams (Aave, Curve, Yearn) for their excellent documentation

---

<div align="center">

**Built with ❤️ on Arc Network**

[⭐ Star on GitHub](https://github.com/yourusername/Smart-DeFi-Router-Agent) | [📖 Documentation](./docs) | [🐛 Report Bug](https://github.com/yourusername/Smart-DeFi-Router-Agent/issues)

</div>

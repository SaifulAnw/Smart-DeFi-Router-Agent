#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Loaded environment variables from .env"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Check if required variables are set
if [ -z "$ARC_TESTNET_RPC_URL" ] || [ -z "$ARC_PRIVATE_KEY" ]; then
    echo "❌ Error: ARC_TESTNET_RPC_URL or ARC_PRIVATE_KEY not set in .env"
    exit 1
fi

echo "🚀 Deploying HelloArchitect to ARC Testnet..."
echo "📡 RPC URL: $ARC_TESTNET_RPC_URL"

# Deploy the contract
# Note: --verify removed as Sourcify doesn't support ARC Testnet yet
# You can verify manually on ARC's block explorer if available
forge script script/DeployHelloArchitect.s.sol:DeployHelloArchitect \
    --rpc-url $ARC_TESTNET_RPC_URL \
    --private-key $ARC_PRIVATE_KEY \
    --broadcast \
    -vvvv

echo "✅ Deployment complete!"


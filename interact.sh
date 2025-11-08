#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found!"
    exit 1
fi

# Your deployed contract address
CONTRACT_ADDRESS="0x1D737aE96186151D09F485c55c02BBDd27904fdD"

echo "🔗 Interacting with HelloArchitect at: $CONTRACT_ADDRESS"
echo "📡 Network: ARC Testnet"
echo ""

# Function to display menu
show_menu() {
    echo "================================"
    echo "  HelloArchitect Interactions"
    echo "================================"
    echo "1. Get current greeting"
    echo "2. Set new greeting"
    echo "3. View transaction on explorer"
    echo "4. Get contract info"
    echo "5. Exit"
    echo "================================"
}

# Main loop
while true; do
    show_menu
    read -p "Select an option (1-5): " choice
    
    case $choice in
        1)
            echo "📖 Reading greeting..."
            cast call $CONTRACT_ADDRESS "getGreeting()(string)" --rpc-url $ARC_TESTNET_RPC_URL
            echo ""
            ;;
        2)
            read -p "Enter new greeting: " new_greeting
            echo "📝 Setting greeting to: $new_greeting"
            cast send $CONTRACT_ADDRESS "setGreeting(string)" "$new_greeting" \
                --rpc-url $ARC_TESTNET_RPC_URL \
                --private-key $ARC_PRIVATE_KEY
            echo ""
            ;;
        3)
            echo "🌐 Block Explorer URL:"
            echo "https://testnet.arcscan.com/address/$CONTRACT_ADDRESS"
            echo ""
            ;;
        4)
            echo "📊 Contract Information:"
            echo "Address: $CONTRACT_ADDRESS"
            echo "Network: ARC Testnet (Chain ID: 5042002)"
            echo "RPC: $ARC_TESTNET_RPC_URL"
            echo ""
            # Get contract bytecode to verify deployment
            cast code $CONTRACT_ADDRESS --rpc-url $ARC_TESTNET_RPC_URL | head -c 100
            echo "..."
            echo ""
            ;;
        5)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            echo ""
            ;;
    esac
done


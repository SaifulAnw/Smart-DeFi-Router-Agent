import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { RebalancePlan } from "../types";
import { CONFIG } from "../config";


// Minimal ABI; replace with your actual Router ABI
const ROUTER_ABI = [
    "function executeRebalance(address targetProtocol, uint256 amount, bytes data) external",
    "function initiateCrossChainRebalance(address destinationChain, uint256 amount, bytes data) external",
    "function completeCrossChainRebalance(uint256 amount, address targetProtocol, bytes data) external"
];


export function getRouter() {
    const provider = new JsonRpcProvider(CONFIG.rpcUrl);
    const wallet = new Wallet(CONFIG.keeperPrivateKey, provider);
    return new Contract(CONFIG.routerAddress, ROUTER_ABI, wallet);
}


export async function executePlan(plan: RebalancePlan) {
    const router = getRouter();


    // Convert amountUsd → USDC 6 decimals; for demo assume 1 USD = 1 USDC
    const amount = BigInt(Math.round(plan.amountUsd * 1_000_000));


    if (plan.planType === "intra") {
        const tx = await router.executeRebalance(
        // In real code, pass adapter/target address; for demo we pass string name placeholder
        // Replace this with your adapter registry lookup
        /* targetProtocol */ "0xTargetProtocolAdapter",
        amount,
        plan.targetProtocolData
        );
        return await tx.wait();
    }


    // cross-chain (MVP placeholder — requires proper dest chain & CCTP)
    const destinationChain = "0x0000000000000000000000000000000000000000"; // replace
    const tx = await router.initiateCrossChainRebalance(
        destinationChain,
        amount,
        plan.targetProtocolData
    );
    return await tx.wait();
}
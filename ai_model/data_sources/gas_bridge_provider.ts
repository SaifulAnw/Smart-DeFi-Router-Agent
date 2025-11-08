export async function estimateGasUsd(): Promise<number> {
    // Replace with real gas estimator (RPC + USD converter). For testnet demo, static is fine.
    return 6.5;
}


export async function estimateBridgeUsd(): Promise<number> {
    // For intra-chain plan, you may ignore; for cross-chain, include CCTP + dest gas
    return 12.0;
}
export const CONFIG = {
    // Policy thresholds
    minDelta: Number(process.env.MIN_DELTA ?? 0.003), // 30 bps default
    cooldownHours: Number(process.env.COOLDOWN_HOURS ?? 12),
    capPerProtocol: Number(process.env.CAP_PER_PROTOCOL ?? 0.6), // 60%


    // Router execution
    routerAddress: process.env.ROUTER_ADDRESS ?? "0xRouterAddressOnArcTestnet",
    rpcUrl: process.env.ARC_RPC_URL ?? "https://rpc.arc-testnet.example",
    keeperPrivateKey: process.env.KEEPER_PK ?? "0xYOUR_TEST_PRIVATE_KEY",


    // Planner defaults
    defaultMoveUsd: Number(process.env.DEFAULT_MOVE_USD ?? 25_000),
};
export type ProtocolName = "aave" | "curve" | "yearn" | "arc" | string;


export interface Candidate {
    name: ProtocolName;
    apy: number; // e.g., 0.037 = 3.7% APY
    riskPenalty: number; // additive penalty (e.g., 0.001)
}


export interface MarketInputs {
    candidates: Candidate[];
    current: ProtocolName; // current deployed protocol
    tvlToMoveUsd: number; // USD amount to move on rebalance
    gasUsd: number; // estimated gas in USD for intra-chain
    bridgeUsd?: number; // optional additional cost for cross-chain
}


export interface PlanRationale {
    currentScore: number;
    bestScore: number;
    minDelta: number;
    gasUsd: number;
    bridgeUsd?: number;
    tvlToMoveUsd: number;
    inputsPreview: Candidate[];
}


export interface RebalancePlan {
    planType: "intra" | "cross";
    targetProtocol: ProtocolName;
    amountUsd: number;
    targetProtocolData: `0x${string}`; // ABI-encoded adapter params
    rationale: PlanRationale;
}
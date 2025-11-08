import { MarketInputs } from "../types";


export function unitCostPerUsd(gasUsd: number, bridgeUsd: number | undefined, tvlToMoveUsd: number): number {
    const denom = Math.max(1, tvlToMoveUsd);
    return (gasUsd + (bridgeUsd ?? 0)) / denom;
}


export function netScore(apy: number, riskPenalty: number, unitCost: number): number {
    return apy - riskPenalty - unitCost; // higher is better
}


export function scoreAll(inputs: MarketInputs) {
    const unitCost = unitCostPerUsd(inputs.gasUsd, inputs.bridgeUsd, inputs.tvlToMoveUsd);
    return inputs.candidates.map(c => ({
    name: c.name,
    score: netScore(c.apy, c.riskPenalty, unitCost),
    }));
}


export function currentScore(inputs: MarketInputs): number {
    const unitCost = unitCostPerUsd(inputs.gasUsd, inputs.bridgeUsd, inputs.tvlToMoveUsd);
    const cur = inputs.candidates.find(c => c.name === inputs.current);
    if (!cur) return Number.NEGATIVE_INFINITY; // if current not in candidates
    return netScore(cur.apy, cur.riskPenalty, unitCost);
}
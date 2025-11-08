import { MarketInputs, RebalancePlan, PlanRationale } from "../types";
import { scoreAll, currentScore } from "./scorer";
import { passesCap, passesCooldown, passesMinDelta } from "./constraints";
import { CONFIG } from "../config";


export interface PlannerState extends MarketInputs {
    lastRebalanceMs?: number; // persisted by your backend (e.g., JSON file/DB)
    targetShare?: number; // proposed share after rebalance (0..1) for the target protocol
}


export function makePlan(state: PlannerState): RebalancePlan | null {
    const scores = scoreAll(state).sort((a, b) => b.score - a.score);
    const best = scores[0];
    const curScore = currentScore(state);


    const rationale: PlanRationale = {
        currentScore: curScore,
        bestScore: best.score,
        minDelta: CONFIG.minDelta,
        gasUsd: state.gasUsd,
        bridgeUsd: state.bridgeUsd,
        tvlToMoveUsd: state.tvlToMoveUsd,
        inputsPreview: state.candidates,
    };


    // gating
    if (!passesMinDelta(best.score, curScore, CONFIG.minDelta)) return null;
    if (state.lastRebalanceMs && !passesCooldown(state.lastRebalanceMs, Date.now(), CONFIG.cooldownHours)) return null;
    if (state.targetShare && !passesCap(state.targetShare, CONFIG.capPerProtocol)) return null;


    // For MVP, assume intra-chain unless caller sets bridgeUsd > 0
    const planType = state.bridgeUsd && state.bridgeUsd > 0 ? "cross" : "intra";


    // Adapter data to be ABI-encoded outside or pre-encoded and passed in
    const targetProtocolData = "0x" as const; // TODO: supply actual calldata


    return {
        planType,
        targetProtocol: best.name,
        amountUsd: state.tvlToMoveUsd,
        targetProtocolData,
        rationale,
    };
}
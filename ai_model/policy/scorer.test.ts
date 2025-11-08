import { describe, it, expect } from "vitest";
import { unitCostPerUsd, netScore, scoreAll, currentScore } from "./scorer";
import { MarketInputs } from "../types";


describe("scorer", () => {
    it("computes unit cost per USD correctly", () => {
        expect(unitCostPerUsd(10, undefined, 10_000)).toBeCloseTo(0.001);
        expect(unitCostPerUsd(10, 20, 10_000)).toBeCloseTo(0.003);
    });


    it("computes net score", () => {
        const s = netScore(0.04, 0.002, 0.001);
        expect(s).toBeCloseTo(0.037);
    });


    it("scores candidates & current score", () => {
        const inputs: MarketInputs = {
            candidates: [
            { name: "aave", apy: 0.037, riskPenalty: 0.001 },
            { name: "curve", apy: 0.034, riskPenalty: 0.002 },
            ],
            current: "curve",
            tvlToMoveUsd: 25_000,
            gasUsd: 5,
            bridgeUsd: 0,
        };
        const scores = scoreAll(inputs);
        expect(scores.length).toBe(2);
        const cur = currentScore(inputs);
        expect(cur).toBeLessThan(scores.find(s => s.name === "aave")!.score);
    });
});
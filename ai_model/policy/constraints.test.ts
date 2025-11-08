import { describe, it, expect } from "vitest";
import { passesMinDelta, passesCooldown, passesCap } from "./constraints";


describe("constraints", () => {
    it("min delta", () => {
        expect(passesMinDelta(0.010, 0.006, 0.003)).toBe(true);
        expect(passesMinDelta(0.008, 0.006, 0.003)).toBe(false);
    });


    it("cooldown", () => {
        const now = Date.now();
        const earlier = now - 13 * 3600_000;
        expect(passesCooldown(earlier, now, 12)).toBe(true);
    });


    it("cap", () => {
        expect(passesCap(0.45, 0.6)).toBe(true);
        expect(passesCap(0.61, 0.6)).toBe(false);
    });
});
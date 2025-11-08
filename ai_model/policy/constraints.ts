export function passesMinDelta(best: number, current: number, minDelta = 0.003) {
    return (best - current) >= minDelta;
}


export function passesCooldown(lastMs: number, nowMs: number, hours = 12) {
    return (nowMs - lastMs) >= hours * 3600_000;
}


export function passesCap(targetShare: number, cap = 0.6) {
    return targetShare <= cap;
}
import { Candidate, ProtocolName } from "../types";


// Mock provider; replace with real subgraph/SDK later
export async function fetchApyCandidates(): Promise<Candidate[]> {
    // You can later swap this to fetch from The Graph / protocol SDKs
    return [
    { name: "aave" as ProtocolName, apy: 0.037, riskPenalty: 0.001 },
    { name: "curve" as ProtocolName, apy: 0.034, riskPenalty: 0.002 },
    { name: "yearn" as ProtocolName, apy: 0.033, riskPenalty: 0.0025 },
    { name: "arc" as ProtocolName, apy: 0.031, riskPenalty: 0.001 },
    ];
}
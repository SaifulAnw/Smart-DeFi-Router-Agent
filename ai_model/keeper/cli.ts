#!/usr/bin/env ts-node
import { fetchApyCandidates } from "../data_sources/apy_provider";
import { estimateBridgeUsd, estimateGasUsd } from "../data_sources/gas_bridge_provider";
import { makePlan, PlannerState } from "../policy/planner";
import { executePlan } from "./executor";
import { CONFIG } from "../config";
import * as fs from "node:fs";


function parseArgs() {
    const args = process.argv.slice(2);
    const out: Record<string, string | boolean> = {};
    for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
    const key = args[i].slice(2);
    const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : "true";
    out[key] = val;
    }
    }
    return out;
}


async function planCmd() {
    const args = parseArgs();
    const mode = String(args["mode"] ?? "intra");
    const tvlToMoveUsd = Number(args["amount"] ?? CONFIG.defaultMoveUsd);
    const current = String(args["current"] ?? "curve");


    const candidates = await fetchApyCandidates();
    const gasUsd = await estimateGasUsd();
    const bridgeUsd = mode === "cross" ? await estimateBridgeUsd() : 0;


    const state: PlannerState = {
    candidates,
    current,
    tvlToMoveUsd,
    gasUsd,
    bridgeUsd,
    lastRebalanceMs: 0,
    targetShare: 0.5,
    };


    const plan = makePlan(state);
    const outPath = args["out"] ? String(args["out"]) : "out/plan-latest.json";
    fs.mkdirSync("out", { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify({ plan }, null, 2));
    console.log(plan ? `Plan written → ${outPath}` : "No plan generated (gating failed)." );
}


async function executeCmd() {
    const args = parseArgs();
    const planPath = String(args["plan"] ?? "out/plan-latest.json");
    const raw = JSON.parse(fs.readFileSync(planPath, "utf8"));
    const plan = raw.plan;
    if (!plan) {
        console.error("No plan found in file.");
        process.exit(1);
    }
    const receipt = await executePlan(plan);
    console.log("Tx receipt:", receipt);
}


async function main() {
    const [cmd] = process.argv.slice(2);
    if (cmd === "plan") return planCmd();
    if (cmd === "execute") return executeCmd();
    console.log(`Usage:\n ts-node ai/keeper/cli.ts plan --mode intra --current curve --amount 25000 --out out/plan.json\n ts-node ai/keeper/cli.ts execute --plan out/plan.json`);
}


main().catch((e) => { console.error(e); process.exit(1); });
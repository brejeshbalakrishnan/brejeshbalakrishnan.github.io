import "server-only"
import { projects } from "@/content"

export const chapters = [
  { id: "s-open", number: "00", label: "Opening", sub: "AI that knows when it’s wrong", color: "#62625e" },
  { id: "s-c1", number: "01", label: "The gate", sub: "Agent GovBench", color: "#ff5a1f" },
  { id: "s-c1b", number: "01b", label: "Escalate when unsure", sub: "Toolcall Guard", color: "#62625e" },
  { id: "s-iv", number: "—", label: "Verified is not true", sub: "Otaku Oracle", color: "#f6f5f1" },
  { id: "s-c2", number: "02", label: "The boundary", sub: "Compliance Workbench", color: "#e7e5df" },
  { id: "s-c3", number: "03", label: "The router", sub: "Mozhi", color: "#1d3bff" },
  { id: "s-c4", number: "04", label: "The re-check", sub: "Feasible Day", color: "#f6f5f1" },
  { id: "s-misses", number: "—", label: "A near miss", sub: "Results I left in", color: "#62625e" },
  { id: "s-end", number: "—", label: "One loop", sub: "And where yours breaks", color: "#ff5a1f" },
] as const

export const cases = {
  gate: {
    id: "s-c1", projectId: "proj-agent-govbench", move: 1, obvious: "Trust the guardrail.", fix: "Measure it.",
    kind: "Agent governance", metric: "94.7% · 0.4%", briefMetric: "94.7% vs 29.8%",
    brief: { result: "On 999 synthetic scenarios, Gemini Flash blocked 94.7% of misuse and flagged 0.4% of benign calls. Model Armor at MEDIUM blocked 29.8% and flagged 27.1%.", limit: "Agent Gateway was not tested." },
    result: "A Gemini Flash guard blocked 94.7% of malicious tool calls and flagged 0.4% of benign ones. Model Armor at MEDIUM: 29.8% and 27.1%, on 999 synthetic scenarios with the agent in the loop.",
    limit: "Agent Gateway governance was not tested. I didn’t estimate a number for it.",
    decision: "Score from the tool log and report blocking and over-blocking together.",
    method: "I paired misuse with benign twins: 45% of scenarios were legitimate requests that looked risky. A deterministic check scored the tool log, with bootstrap intervals and written limits.",
    table: { headings: ["Guard", "Misuse blocked", "Benign flagged"], rows: [["Model Armor (MEDIUM)", "29.8%", "27.1%"], ["Gemini Flash guard", "94.7%", "0.4%"], ["Agent Gateway", "Not tested", "Not tested"]] },
  },
  cascade: {
    id: "s-c1b", projectId: "proj-toolcall-guard", move: 2, obvious: "Trust the small model.", fix: "Escalate when unsure.",
    kind: "Tool call screening", metric: "0.98",
    result: "The cascade blocked 98% of attacks at 2% false positives on 981 held-out agent calls, about 29% cheaper than Gemini alone.",
    limit: "The local guard alone blocked 62% of attacks on 1,566 real agent calls.",
    decision: "Use the local guard as a screen; send uncertain calls to Gemini.",
    method: "I tuned Gemma 4 with LoRA to classify one proposed call at a time. Synthetic labels flatter the models that wrote and reviewed them, so the cascade comparison uses held-out agent traffic.",
    table: { headings: ["Path", "Attacks blocked", "False positives"], rows: [["Local only", "62%", "8%"], ["Gemini only", "98%", "3%"], ["Cascade", "98%", "2%"]] },
  },
  boundary: {
    id: "s-c2", projectId: "proj-compliance-workbench", move: 3, obvious: "Answer anyway.", fix: "Decline.",
    kind: "Bounded RAG", metric: "13 of 14",
    brief: { result: "Across 3,946 provisions from nine official texts, the assistant declined 13 of 14 out-of-scope questions without a model call and wrongly declined none of 50 covered questions.", limit: "One out-of-scope question got an answer. No legal advice." },
    result: "Out-of-scope questions declined with no model call; 0 of 50 covered questions wrongly declined. The assistant retrieves from 3,946 provisions across 9 official texts.",
    limit: "One out-of-scope question still got an answer. Information from official texts, not legal advice.",
    decision: "Check coverage and retrieval before asking the model to draft.",
    method: "I labelled the expected articles by reading the texts. Recall at 6 was 0.847 and MRR was 0.862 over 50 hand-labelled questions. The project had 677 tests at the time of this result.",
  },
  router: {
    id: "s-c3", projectId: "proj-mozhi", move: 4, obvious: "Prompt the LLM.", fix: "Train the router.",
    kind: "Multilingual routing", metric: "0.941 at 2.2 ms",
    brief: { result: "A 23 MB router scored 0.941 macro-F1 (95% CI 0.916 to 0.962, n = 2,805), versus 0.490 at 3,333 ms for the original prompt. False actions fell from 40.7% to 0.8%.", limit: "Tamil and Malayalam missed the 0.85 target at 0.818 and 0.809." },
    result: "Action macro-F1 for a fine-tuned 23 MB router (95% CI 0.916 to 0.962, n = 2,805), versus 0.490 at 3,333 ms for the original prompt. False actions fell from 40.7% to 0.8%.",
    limit: "Tamil and Malayalam missed the 0.85 target at 0.818 and 0.809. The wording still needs a native speaker’s review.",
    decision: "Replace the prompt with a trained router and make declining an explicit action.",
    method: "I compared 12 systems over 3 seeds with bootstrap intervals. The strongest constrained prompt scored 0.879 at 1,047 ms; the race shows the original prompt the router replaced.",
  },
  plan: {
    id: "s-c4", projectId: "proj-feasible-day", move: 5, obvious: "Trust the plan.", fix: "Re-time it.",
    kind: "Independent re-check", metric: "94.8%",
    result: "91 of 96 test days held when OSRM, an independent routing engine, re-timed them. The pass mark written before the planner code was 95%.",
    limit: "94.8% is a miss. In 15 later cities, 71 of 120 plans held on the independent re-check.",
    decision: "Keep the independent check and split out the metric that was measuring map coverage.",
    method: "Two open LLMs produced 2 feasible days in 576 runs. The planner passed 96 of 96 on its own rules. I checked walking times independently and report unknown opening hours rather than treating them as verified.",
  },
  interval: {
    id: "s-iv", projectId: "proj-otaku-oracle", move: 0, obvious: "", fix: "",
    kind: "Grounding", metric: "+38.7 points",
    result: "Grounding lifted exact-match accuracy by 38.7 points (95% CI 31.7 to 46.0, 744 question pairs per model).",
    limit: "The grounded arm holds the answer in context. This measures faithful reading of the record, not whether AniList is right.",
    decision: "Mark each claim as verified, conflict or unchecked against its source.",
    method: "The paired evaluation compares closed-book answers with answers grounded in the AniList record.",
  },
} satisfies Record<string, {
  id: string; projectId: string; move: number; obvious: string; fix: string; kind: string; metric: string;
  result: string; limit: string; decision: string; method: string;
  table?: { headings: string[]; rows: string[][] }; briefMetric?: string; brief?: { result: string; limit: string };
}>

export type Case = {
  id: string; projectId: string; move: number; obvious: string; fix: string; kind: string; metric: string;
  result: string; limit: string; decision: string; method: string;
  table?: { headings: string[]; rows: string[][] }; briefMetric?: string; brief?: { result: string; limit: string };
}

export function projectById(id: string) {
  const project = projects.find(p => p.id === id)
  if (!project) throw new Error(`Missing casebook project in content.xlsx: ${id}`)
  return project
}

export const media = {
  compliance: { file: "compliance", w: 800, h: 500, alt: "Compliance Workbench Ask view with example questions." },
  otaku: { file: "otaku", w: 1050, h: 840, alt: "Otaku Oracle answer for Cowboy Bebop. The claim of 26 episodes matches AniList, the claim of 99 conflicts, and a claim about fans is unchecked." },
  plan: { file: "feasible-plan", w: 1360, h: 820, alt: "Feasible Day’s Paris plan with eight stops, opening-hours checks and a route map.", credit: "Map data © OpenStreetMap contributors (ODbL), tiles © OpenFreeMap." },
  mozhi: { file: "mozhi", w: 1280, h: 800, alt: "Mozhi Talk with its decision journal." },
  safetyops: { file: "safetyops", w: 1280, h: 800, alt: "SafetyOps workspace showing the observation register and actions." },
  gambit: { file: "gambit", w: 1280, h: 780, alt: "Gambit Realms chessboard with the coach warning about a threatened piece." },
  outside: { file: "outside", w: 1280, h: 800, alt: "Outside’s hour-by-hour weather window." },
  toonforge: { file: "toonforge", w: 1280, h: 800, alt: "Toonforge studio with a before and after comic-print comparison.", credit: "Sample photo: Green Liu / Unsplash." },
} as const

export const dimensions = [
  ["all", "Everything"], ["ag", "Agents and governance"], ["ev", "Evaluation"], ["rag", "RAG and grounding"],
  ["lang", "Language and routing"], ["plan", "Planning and constraints"], ["prod", "Production ML"], ["pers", "Personal and early work"],
] as const

type ArchiveNote = [slug: string, dimensions: string, caseName?: keyof typeof cases, image?: keyof typeof media, metric?: string, label?: string, limit?: string, result?: string]
const archiveNotes: ArchiveNote[] = [
  ["agent-govbench", "ag ev", "gate", undefined, "94.7%", "of malicious calls blocked by the Flash guard"],
  ["toolcall-guard", "ag ev", "cascade", undefined, "0.98", "of attacks blocked by the cascade"],
  ["compliance-workbench", "rag ag ev prod", "boundary", "compliance"],
  ["otaku-oracle", "rag ev pers", "interval", "otaku"],
  ["mozhi", "lang ev pers", "router", "mozhi"],
  ["feasible-day", "plan ev", "plan", "plan"],
  ["safetyops-copilot", "prod ag", undefined, "safetyops", undefined, undefined, "No evidence yet of real-world adoption or fewer incidents."],
  ["kindred", "ev pers", undefined, undefined, "0.217", "NDCG@10", "Three pre-registered hypotheses failed. The labels are proxies."],
  ["gambit-realms", "ev pers", undefined, "gambit", undefined, undefined, "Coach precision was 64.8% against an 85% target. Ratings are on Stockfish’s scale."],
  ["outside-weather", "plan pers", undefined, "outside", undefined, undefined, "The evaluation measures software correctness."],
  ["toonforge", "pers ag", undefined, "toonforge", undefined, undefined, "Thin low-contrast lines get weaker.", "Boundary contrast was 127 versus 63 for box smoothing."],
  ["analytics-copilot", "ev prod", undefined, undefined, "97.5%", "schema adherence in domain", "Exact match was 35.0% in domain; schema adherence was 76% zero-shot on Spider.", "97.5% in-domain schema adherence, checked on the parse tree."],
  ["customer-churn", "prod ev", undefined, undefined, "0.72 → 0.90", "explanation faithfulness", "Public IBM Telco sample data (7,043 records).", "A grounding fix lifted faithfulness from 0.72 to 0.90 (n = 50, seeded)."],
  ["inventory-classifier", "prod", undefined, undefined, "~22%", "macro-F1 gain over baseline", "The AWS resources were cleaned up after the experiment."],
  ["visual-navigation", "pers", undefined, undefined, "450 ms", "inference on Raspberry Pi 4", "A team project with no public repository."],
]

export const archiveProjects = archiveNotes.map(([slug, tags, caseName, image, metric, metricLabel, limit, result]) => {
  const p = projectById(`proj-${slug}`)
  const c = caseName ? cases[caseName] : undefined
  return { id: p.id, title: p.title, date: p.date, line: p.oneLine, links: p.links,
    tags: tags.split(" "), caseId: c?.id, badge: c ? (c.move ? `Move 0${c.move}` : "Interval") : undefined,
    image: image ? media[image] : undefined, metric, metricLabel,
    result: result ?? c?.result ?? p.highlights[0], limit: limit ?? c?.limit }
})

export type ArchiveProject = (typeof archiveProjects)[number]

export const education = { dates: "2020 to 2024", title: "B.E. Electronics and Communication Engineering", school: "College of Engineering Guindy, Anna University", detail: "CGPA 8.54" }

export const misses = [
  ["Feasible Day", "94.8% · target 95%", "Plans still feasible on the independent re-check.", 94.8 / 95],
  ["Mozhi · Tamil", "0.818 · target 0.85", "Router macro-F1, first Tamil model.", 0.818 / 0.85],
  ["Mozhi · Malayalam", "0.809 · target 0.85", "Router macro-F1, first Malayalam model.", 0.809 / 0.85],
  ["Gambit Realms", "64.8% · target 85%", "Chess coach precision. The project met 3 of 5 targets.", 64.8 / 85],
] as const

export const loop = [
  ["Measure the original", "LLM day plans were feasible in 2 of 576 runs."],
  ["Write the pass mark", "95%, written before any planner code."],
  ["Run the comparison", "12 routers, 3 seeds, bootstrap intervals."],
  ["Check independently", "OSRM re-timed every plan."],
  ["Publish the miss", "94.8% went out as a miss."],
  ["Decide what changes", cases.cascade.decision],
] as const

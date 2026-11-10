// Presentation fixtures for the measured casebook demonstrations. No calls run live.
export const guards = [
  { label: "No guard", blocked: 0, refused: 0, note: "An agent reads an email with a hidden instruction to send invoices outside the company. With no guard, everything the agent proposes reaches the tools." },
  { label: "Model Armor", blocked: 29.8, refused: 27.1, note: "At MEDIUM, it stops 29.8% of misuse and 27.1% of proper requests. Both streams get thinner. Neither gets cleaner." },
  { label: "Gemini Flash guard", blocked: 94.7, refused: 0.4, note: "The Flash guard stops 94.7% of misuse and 0.4% of proper requests. Now the two streams come apart." },
  { label: "Block everything", blocked: 100, refused: 100, note: "Hypothetical: every attack is stopped, and so is all the work. That is why 45% of the benchmark consists of proper requests that only look risky." },
  { label: "Agent Gateway", blocked: null, refused: null, note: "Agent Gateway governance was not tested. There is no number and no band here." },
] as const

export const cascadeModes = [
  { label: "Local only", blocked: "0.62", falsePositive: "0.08", cost: "No Gemini calls", up: 0, note: "Free to run. It missed too many attacks to serve as the only gate, on 1,566 real agent calls." },
  { label: "Gemini only", blocked: "0.98", falsePositive: "0.03", cost: "USD 3.42 per 1,000", up: 16, note: "The quality bar, paid on every call. Cost from the 981-call comparison." },
  { label: "Cascade", blocked: "0.98", falsePositive: "0.02", cost: "USD 2.43 per 1,000", up: 11, note: "The local guard escalates 69% of calls. Same blocking rate, about 29% cheaper, on 981 held-out calls." },
] as const

export const texts = ["EU AI Act", "GDPR", "NIS2", "DORA", "CRA", "NIS2 IR", "NIST 800-53", "NIST CSF 2.0", "NIST AI RMF"]
export const outside = ["HIPAA", "CCPA", "PCI DSS", "Licensed ISO and SOC 2 text"]

export const boundaryExamples = [
  { label: "Ask about GDPR", question: "When must a controller report a personal data breach under GDPR?", source: "Covered example from the live app.", badge: "Answered · quoted", title: "It can point to the text", text: "The first retrieved provision answers the question.", steps: ["GDPR is in the corpus.", "GDPR Art. 33(1) ranks first.", "Drafts from the quoted provisions.", "Quoted, with its start date."], stop: -1, x: 31, y: 29, tile: 1 },
  { label: "Ask about HIPAA", question: "What does HIPAA require?", source: "Out-of-scope example from the live app.", badge: "Declined · measured behaviour", title: "It says so instead of guessing", text: "HIPAA isn’t in the corpus. The pipeline stops at the first check and no model is called.", steps: ["HIPAA is outside the corpus.", "Skipped.", "Skipped.", "Declined before drafting."], stop: 0, x: 73, y: 25, tile: -1 },
  { label: "Weak retrieval", question: "What will the next amendment to the AI Act say?", source: "Illustrative question; this exact wording wasn’t run.", badge: "Declined · illustrative", title: "Nothing worth standing on", text: "Inside the corpus, but nothing retrieved can be quoted as an answer. The model is never asked.", steps: ["The AI Act is in the corpus.", "No provision is strong enough to quote.", "Skipped.", "Declined before drafting."], stop: 1, x: 17, y: 44, tile: 0 },
] as const

export const requests = [
  { request: "play some jazz in the kitchen", output: "Declined. “I can check the weather, set reminders and save notes.”" },
  { request: "save a note buy oat milk", output: "Note selected, then saved and replied." },
] as const

export const planPhases = [
  { label: "Illustrative plan", next: "Run the checks", note: "A day plan for Paris, the kind an LLM writes. It reads well. Two open LLMs produced a fully feasible day in 2 of 576 runs.", foot: "Illustrative plan written for this page. Checks use the planner’s data for this day (OpenStreetMap)." },
  { label: "2 failed · 1 unknown", next: "Re-time it", note: "The museum opens an hour after the plan arrives. The first walk has no time at all.", foot: "Illustrative plan written for this page. Checks use the planner’s data for this day (OpenStreetMap)." },
  { label: "Real planner output", next: "Start over", note: "Reordered, retimed and clear that one stop’s hours can’t be verified. The plan goes on to eight stops and 2.4 km of walking.", foot: "Hours checked for 7 of 8 stops. Ends 18:43." },
] as const

export const planStops = [
  [
    ["08:30", "10:00", "Conciergerie", "Museum", "0 min for 0.1 km", "× Opens 09:30", "× Walk needs 2 min"],
    ["10:00", "11:00", "Sainte-Chapelle", "Attraction", "", "✓ Open"],
    ["11:15", "11:55", "Tour de l’Horloge", "Attraction", "5 min for 0.3 km", "? No hours in OSM", "✓ Walk needs 4 min"],
    ["12:00", "13:00", "GuLi", "Lunch", "", "✓ Open"],
  ],
  [
    ["09:00", "09:40", "Sainte-Chapelle", "Attraction", "Then 2 min, 0.1 km", "✓ Open at visit"],
    ["09:42", "11:12", "Conciergerie", "Museum", "Then 1 min, 0.0 km", "✓ Open at visit"],
    ["11:12", "11:52", "Tour de l’Horloge", "Attraction", "Then 4 min, 0.3 km", "? Hours unverified"],
    ["12:00", "13:10", "GuLi", "Lunch", "Then 4 more stops", "✓ Open at visit"],
  ],
] as const

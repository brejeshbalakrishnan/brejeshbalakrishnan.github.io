"use client"

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { guards, cascadeModes, texts, outside, boundaryExamples, requests, planPhases, planStops } from "@/content/casebook-demos"
import { motionEnabled, useScrollBeats } from "./use-scroll-beats"

type OptionsProps = { label: string; labels: readonly string[]; selected: number; onSelect: (i: number) => void }
function Options({ label, labels, selected, onSelect }: OptionsProps) {
  return <div className="options" role="group" aria-label={label}>{labels.map((text, i) => <button key={text} type="button" className="control" aria-pressed={selected === i} onClick={() => onSelect(i)}>{text}</button>)}</div>
}

function useFirstView(start: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio < 0.2) return
      observer.disconnect()
      if (motionEnabled()) start()
    }, { threshold: 0.2 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [start])
  return ref
}

function Percentage({ value }: { value: number }) {
  const output = useRef<HTMLSpanElement>(null)
  const previous = useRef(value)
  useEffect(() => {
    const node = output.current
    if (!node) return
    const from = previous.current
    const start = performance.now()
    const preference = matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0
    function draw(now: number) {
      const elapsed = !preference.matches && document.documentElement.dataset.motion !== "off" ? Math.min((now - start) / 460, 1) : 1
      previous.current = from + (value - from) * (1 - (1 - elapsed) ** 3)
      node!.textContent = previous.current.toFixed(1) + "%"
      if (elapsed < 1) frame = requestAnimationFrame(draw)
    }
    draw(start)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <><span className="sr-only">{value.toFixed(1)}%</span><span ref={output} aria-hidden="true">{value.toFixed(1)}%</span></>
}

const gateThresholds = [0.14, 0.42, 0.72]
export function GateDemo() {
  const beat = useScrollBeats("s-c1", gateThresholds)
  const [manual, setManual] = useState<{ beat: number; choice: number }>()
  const selected = manual?.beat === beat ? manual.choice : Math.min(2, beat)
  const guard = guards[selected]
  const [entered, setEntered] = useState(false)
  const start = useCallback(() => setEntered(true), [])
  const diagram = useFirstView(start)
  return <div className="gate-demo" data-beat={beat}>
    <p className="demo-note">{beat === 3 && manual?.beat !== beat ? "A guard that blocks everything would score 100% on attacks. Every guard gets two numbers." : guard.note}</p>
    <div className="gate-labels eyebrow" aria-hidden="true"><span>What the agent proposes</span><span>What reaches the tools</span></div>
    <div className="gate-streams" ref={diagram} aria-live={manual?.beat === beat ? "polite" : "off"}>
      {([["Misuse attempts", guard.blocked, "stopped"], ["Proper requests that look risky", guard.refused, "refused"]] as const).map(([name, value, verb], i) => <div className={`stream stream-${i}`} key={name} data-untested={value === null} style={{ "--fraction": (value ?? 0) / 100 } as CSSProperties}>
        <div className="stream-source"><span>{name}</span><i aria-hidden="true" />{entered && <div className="gate-packets" key={selected} aria-hidden="true" />}</div>
        <div className="gate-post" aria-hidden="true" />
        <div className="stream-out" aria-hidden="true"><i /></div>
        <strong>{value === null ? "Not tested" : <><Percentage value={value} /> <small>{verb}</small></>}</strong>
      </div>)}
    </div>
    <div className="demo-controls"><span className="eyebrow">Guard</span><Options label="Guard at the gate" labels={guards.map(x => x.label)} selected={selected} onSelect={choice => setManual({ beat, choice })} /></div>
  </div>
}

export function CascadeDemo({ heading }: { heading: React.ReactNode }) {
  const [mode, setMode] = useState(2)
  const [run, setRun] = useState(0)
  const item = cascadeModes[mode]
  const start = useCallback(() => setRun(n => n || 1), [])
  const board = useFirstView(start)
  return <>
    <div className="cascade-instrument">
      <div>
        {heading}
        <div aria-live="polite">
        <dl className="cascade-stats" key={run} data-run={run > 0}><div><dt>of attacks blocked</dt><dd>{item.blocked}</dd></div><div><dt>false positives</dt><dd>{item.falsePositive}</dd></div><div><dt>hosted cost</dt><dd>{item.cost}</dd></div></dl>
        <p className="cascade-note">{item.note}</p>
        </div>
      </div>
      <div>
        <Options label="How the gate runs" labels={cascadeModes.map(x => x.label)} selected={mode} onSelect={i => { setMode(i); setRun(n => n + 1) }} />
        <div className="cascade-board" ref={board} role="img" aria-label={`Of 16 illustrated calls, ${item.up} go to Gemini and ${16 - item.up} are decided locally.`}>
          <svg viewBox="0 0 600 274" preserveAspectRatio="none" aria-hidden="true"><path d="M90 207H507 M279 203V75H507" /></svg>
          <div className="route-box gemini" data-idle={!item.up}>Gemini Flash <small>Hosted guard</small></div>
          <div className="route-box local" data-idle={item.up === 16}>Gemma 4 <small>Local guard</small></div>
          <span className="board-in">Proposed calls</span><span className="board-up">Gemini: {item.up} of 16</span><span className="board-out">Decided locally: {16 - item.up} of 16</span>
          <div key={run} className="route-tokens" data-run={run > 0} aria-hidden="true">{Array.from({ length: 16 }, (_, i) => {
            const up = i < item.up
            const j = up ? i : i - item.up
            return <i key={i} data-up={up} style={{ "--from-x": `${12 + i % 4 * 15}px`, "--from-y": `${166 + Math.floor(i / 4) * 16}px`, "--x": `${64 - j % 4 * 15}px`, "--y": `${(up ? 35 : 166) + Math.floor(j / 4) * 16}px`, "--delay": `${i * 35}ms` } as CSSProperties} />
          })}</div>
        </div>
        <p className="demo-small">{mode === 2 ? "Drawn as 16 calls: 11 rise to Gemini, for the measured 69%." : "Drawn as 16 calls."}</p>
      </div>
    </div>
  </>
}

export function BoundaryDemo() {
  const [selected, setSelected] = useState(0)
  const [run, setRun] = useState(0)
  const example = boundaryExamples[selected]
  const start = useCallback(() => setRun(n => n || 1), [])
  const map = useFirstView(start)
  return <>
    <div className="boundary-grid" ref={map}>
      <div className="corpus" role="group" aria-label="Corpus map">
        <div className="corpus-in"><p className="eyebrow">Inside: 9 official texts</p><div className="corpus-tiles">{texts.map((text, i) => <span key={text} data-hit={example.tile === i} data-weak={selected === 2 && example.tile === i}>{text}</span>)}</div></div>
        <div className="corpus-out"><p className="eyebrow">Outside</p><ul>{outside.map((text, i) => <li key={text} data-hit={i === 0 && selected === 1}>{text}</li>)}</ul></div>
        <i className="corpus-probe" aria-hidden="true" style={{ left: `${example.x}%`, top: `${example.y}%` }} />
        {selected !== 0 && <span className="declined-stamp" key={run} aria-hidden="true">Declined</span>}
      </div>
      <div className="ask">
        <Options label="Ask a question" labels={boundaryExamples.map(x => x.label)} selected={selected} onSelect={i => { setSelected(i); setRun(n => n + 1) }} />
        <div aria-live="polite">
          <p className="question">“{example.question}”<small>{example.source}</small></p>
          <div className="answer" key={run} data-run={run > 0}><p className="eyebrow">{example.badge}</p><h3>{example.title}</h3><p>{example.text}</p>
            {selected === 0 && <><blockquote>“…the controller shall without undue delay and, where feasible, not later than 72 hours after having become aware of it, notify the personal data breach to the supervisory authority…”</blockquote><cite>GDPR Art. 33(1) · in force since 2018-05-25</cite></>}
          </div>
        </div>
        {selected === 0 && <p className="demo-small">Now ask it about HIPAA.</p>}
      </div>
    </div>
    <ol className="pipeline" aria-label="Pipeline for this question" key={run} data-run={run > 0}>
      {["Coverage", "Retrieval", "Model", "Output"].map((label, i) => <li key={label} data-stop={i === example.stop} data-skipped={example.stop >= 0 && i > example.stop && i < 3} style={{ "--step": i } as CSSProperties}><b>{label}</b><span>{example.steps[i]}</span>{i === 2 && <strong>{selected === 0 ? 1 : 0} model calls</strong>}</li>)}
    </ol>
  </>
}

export function RouterDemo() {
  const [selected, setSelected] = useState(0)
  const [run, setRun] = useState(0)
  const [pending, setPending] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const race = useRef<HTMLDivElement>(null)
  const hasRun = useRef(false)
  const send = useCallback((i: number) => {
    hasRun.current = true
    setSelected(i)
    setRun(n => n + 1)
    clearTimeout(timer.current)
    if (!motionEnabled()) { setPending(false); return }
    setPending(true)
    timer.current = setTimeout(() => setPending(false), 3333)
  }, [])
  useEffect(() => {
    const node = race.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      if (!hasRun.current && !matchMedia("(prefers-reduced-motion: reduce)").matches && document.documentElement.dataset.motion !== "off") send(0)
    }, { threshold: 0.4 })
    observer.observe(node)
    const stop = () => {
      if (!motionEnabled()) { clearTimeout(timer.current); setPending(false) }
    }
    const preference = matchMedia("(prefers-reduced-motion: reduce)")
    preference.addEventListener("change", stop)
    const observerMotion = new MutationObserver(stop)
    observerMotion.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] })
    return () => { observer.disconnect(); observerMotion.disconnect(); preference.removeEventListener("change", stop); clearTimeout(timer.current) }
  }, [send])
  return <div className="race" ref={race}>
    <div className="demo-controls"><span className="eyebrow">Say</span><Options label="Request" labels={requests.map(x => x.request)} selected={selected} onSelect={send} /><button type="button" className="control filled" onClick={() => send(selected)}>{pending ? "Run again" : run ? "Send again" : "Send"}</button></div>
    <div className="race-lanes" aria-live="polite" key={run} data-run={run > 0}>
      <div className="lane"><b>LLM prompt router <small>The original</small></b><span className="race-track" aria-hidden="true"><i /></span><strong>{pending ? "…" : "3,333 ms"}</strong><p className={run && !pending ? "route-outcome" : undefined} key={String(pending)}>{pending ? "Still choosing a tool…" : "55% valid across the test set; acted on 40.7% of requests it should have declined."}</p></div>
      <div className="lane trained"><b>Trained router <small>MiniLM · 23 MB</small></b><span className="race-track" aria-hidden="true"><i /></span><strong>2.2 ms</strong><p className={run ? "route-outcome" : undefined}>{requests[selected].output}</p></div>
    </div>
    <Respect />
  </div>
}

function Respect() {
  const [level, setLevel] = useState(3)
  const names = ["Casual", "Familiar", "Family respect", "Polite", "Formal"]
  return <div className="respect"><label htmlFor="respect-level"><b>Respect, {level} of 5:</b> <span key={level}>“{names[level - 1]}”.</span></label><input type="range" id="respect-level" min={1} max={5} value={level} aria-valuetext={names[level - 1]} onChange={e => setLevel(Number(e.target.value))} /><p>The assistant changes its form of address because “you” isn’t one word in either language. This meter illustrates the five levels.</p></div>
}

const planThresholds = [0.16, 0.36, 0.56, 0.74]
export function PlanDemo({ heading, evidence, recheck }: { heading: React.ReactNode; evidence: React.ReactNode; recheck: React.ReactNode }) {
  const beat = useScrollBeats("s-c4", planThresholds)
  const [manual, setManual] = useState<{ beat: number; choice: number }>()
  const phase = manual?.beat === beat ? manual.choice : Math.min(beat, 2)
  const choose = (change: number) => setManual({ beat, choice: (phase + change + 3) % 3 })
  const state = planPhases[phase]
  return <>
    <div className="inner plan-grid" data-phase={phase}>
      <div>{heading}<p className="demo-note" aria-live={manual?.beat === beat ? "polite" : "off"}>{state.note}</p>
        <div className="actions"><button type="button" className="control" aria-label="Previous plan step" onClick={() => choose(-1)}><ArrowLeft size={18} aria-hidden="true" /></button><button type="button" className="control" onClick={() => choose(1)}>{state.next}<ArrowRight size={16} aria-hidden="true" /></button>{evidence}</div>
      </div>
      <div className="ticket">
        <div className="ticket-header"><b>Paris · Mon 16 Nov</b><span>{state.label}</span></div>
        <ol key={phase}>{planStops[phase === 2 ? 1 : 0].map(([start, end, name, kind, walk, ...checks], index) => <li key={name} style={{ "--step": index } as CSSProperties} data-failed={phase === 1 && name === "Conciergerie"}><span className="stop-time">{start}<small>to {end}</small></span><span className="stop-name"><b>{name}</b><small>{kind}</small></span><span className="checks">{phase !== 0 && checks.map(check => <span key={check} data-mark={check[0]}>{check}</span>)}</span>{walk && <small className="walk">{walk}</small>}</li>)}</ol>
        <p className="ticket-foot">{state.foot}</p>
      </div>
    </div>
    <div className="recheck-overlay" data-visible={beat >= 3} data-zoomed={beat >= 4} aria-hidden="true">{recheck}</div>
  </>
}

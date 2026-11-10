import Link from "next/link"
import { contact, profile, socialLinks } from "@/content"
import { archiveProjects, cases, chapters, loop, media, misses, projectById } from "@/content/casebook"
import type { CSSProperties } from "react"
import { asset } from "@/lib/asset"
import { BoundaryDemo, CascadeDemo, GateDemo, PlanDemo, RouterDemo } from "./demos"
import { ContactPrompt } from "./closing"
import { StoryCues } from "./story-cues"
import { Capture, CaseHeading, EvidenceButton, External, ModeLinks, ProjectLinks, Receipt } from "./shared"

function RecheckChart() {
  return <div className="inner recheck">
    <p>Then OSRM, an independent routing engine, re-timed every plan. <b>91 of 96 test days held.</b></p>
    <strong className="recheck-number">94.8%</strong>
    <p>The target, written before any planner code: <b>95%.</b></p>
    <div className="recheck-axis" aria-hidden="true"><span /><i><b>Pass mark · 95%</b></i></div>
    <div className="axis-labels axis-zoom" aria-hidden="true"><span>94%</span><span>95.2% · axis zoomed</span></div>
    <div className="axis-labels axis-full" aria-hidden="true"><span>0%</span><span>100%</span></div>
  </div>
}

export function Story() {
  const cloud = "Right now that means governance and safety for agents on Amazon Bedrock, at Cloud202."
  const prompts = [
    { label: "An agent that acts when it shouldn’t", reply: cases.gate.result },
    { label: "A model that answers anyway", reply: cases.boundary.result },
    { label: "A plan nobody re-checked", reply: cases.plan.result },
    { label: "A router nobody measured", reply: cases.router.result },
    { label: "Something else", reply: "Tell me what it does and what it should have done. I’ll ask how you’d know." },
  ]
  return <main id="main-content" tabIndex={-1}>
    <StoryCues />
    <section className="tone-black opening" id="s-open" tabIndex={-1} aria-labelledby="opening-heading">
      <div className="inner opening-inner">
        <header className="opening-header"><b>{profile.name}</b><ModeLinks mode="casebook" /></header>
        <div className="opening-copy">
          <h1 id="opening-heading"><span>AI that</span><s><span className="sr-only">not: </span>is always right.</s><span>knows when <em>it’s wrong.</em></span></h1>
          <p><b>I’m {profile.name}, an AI engineer.</b> {profile.footerTagline} {cloud}</p>
          <div className="opening-actions"><a className="scroll-cue" href="#s-c1">Five obvious moves. Scroll to watch each one fail.</a><Link className="text-link" href="/60-seconds/" prefetch={false}>Or read it in 60 seconds</Link></div>
        </div>
      </div>
    </section>
    <section className="tone-orange" aria-labelledby="s-c1-heading">
      <div id="s-c1" className="scene gate-scene" tabIndex={-1}>
        <div className="pin"><div className="inner gate"><CaseHeading entry={cases.gate} chapter="01 · The gate" /><GateDemo /></div></div>
      </div>
      <div className="inner after-scene"><Receipt entry={cases.gate} /></div>
    </section>
    <section id="s-c1b" className="tone-black" tabIndex={-1} aria-labelledby="s-c1b-heading">
      <div className="inner chapter cascade">
        <CascadeDemo heading={<CaseHeading entry={cases.cascade} chapter="01 · Act two"><p className="premise">The guard that works costs a hosted model call every time. So I distilled it into a free local model.</p></CaseHeading>} />
        <div className="cascade-footer"><p className="decision"><b>Decision / what changed</b> {cases.cascade.decision}</p><div className="actions"><EvidenceButton entry={cases.cascade} /><ProjectLinks links={projectById(cases.cascade.projectId).links} /></div></div>
      </div>
    </section>
    <section id="s-iv" className="tone-white" tabIndex={-1} aria-labelledby="interval-heading">
      <div className="inner chapter interval">
        <figure className="capture"><div className="interval-frame"><Capture image={media.otaku} /></div><figcaption>Otaku Oracle in demo mode: live AniList records, illustrative claims, no model attached.</figcaption><ul className="oracle-marks" aria-label="Claim marks"><li>✓ Verified</li><li>× Conflict</li><li>? Unchecked</li></ul></figure>
        <div><p className="chapter-label">Interval · Otaku Oracle</p><h2 id="interval-heading">A verified claim is only as true as its record.</h2>
          <p>Every claim gets a mark: verified, conflict or unchecked. {cases.interval.result} {cases.interval.limit}</p>
          <p className="decision"><b>Decision / what changed</b> {cases.interval.decision}</p>
          <div className="actions"><EvidenceButton entry={cases.interval} /><ProjectLinks links={projectById(cases.interval.projectId).links} /></div>
        </div>
      </div>
    </section>
    <section id="s-c2" className="tone-bone" tabIndex={-1} aria-labelledby="s-c2-heading">
      <div className="inner chapter boundary">
        <CaseHeading entry={cases.boundary} chapter="02 · The boundary" split><p className="premise">Someone asks a compliance assistant about a rule it was never given.</p></CaseHeading>
        <BoundaryDemo />
        <div className="boundary-fix"><strong className="correction">{cases.boundary.fix}</strong><p>Declining is a feature here. I measured it in both directions.</p></div>
        <Receipt entry={cases.boundary} image={media.compliance} />
      </div>
    </section>
    <section id="s-c3" className="tone-blue" tabIndex={-1} aria-labelledby="s-c3-heading">
      <div className="inner chapter router">
        <CaseHeading entry={cases.router} chapter="03 · The router">
          <div className="router-intro"><p className="scripts"><span lang="ta">மொழி</span><span lang="ml">മൊഴി</span></p><p>I think in Malayalam, speak Tamil and code in English. So I built an assistant for all three, and measured the part that picks the tool.</p></div>
        </CaseHeading>
        <RouterDemo />
        <Receipt entry={cases.router} image={media.mozhi} />
      </div>
    </section>
    <section className="tone-white" aria-labelledby="s-c4-heading">
      <div id="s-c4" tabIndex={-1} className="scene plan-scene">
        <div className="pin"><PlanDemo heading={<CaseHeading entry={cases.plan} chapter="04 · The re-check" />} evidence={<EvidenceButton entry={cases.plan} image={media.plan} />} recheck={<RecheckChart />} /></div>
      </div>
      <div className="tone-black recheck-static"><RecheckChart /></div>
      <div className="inner after-scene plan-after">
        <div className="receipt">
          <div><p className="eyebrow">Result</p><strong className="metric">{cases.plan.metric}</strong><p>{cases.plan.result}</p></div>
          <div className="limit"><p className="eyebrow">Limit</p><p>{cases.plan.limit}</p><p className="decision"><b>Decision / what changed</b> {cases.plan.decision}</p></div>
          <div className="receipt-actions"><ProjectLinks links={projectById(cases.plan.projectId).links} /></div>
        </div>
      </div>
    </section>
    <section id="s-misses" className="tone-black" tabIndex={-1} aria-labelledby="misses-heading">
      <div className="inner chapter misses">
        <h2 id="misses-heading">A near miss is still a miss.</h2><p>Each line below is a pass mark I wrote down before the result existed. None of these cleared it.</p>
        <div className="misses-chart"><p className="eyebrow pass-mark">Pass mark, written first</p>
          <ol>{misses.map(([title, value, note, proportion]) => <li key={title}><div className="miss-bar" aria-hidden="true"><i style={{ "--miss-cap": `${proportion * 100}%` } as CSSProperties} /></div><b>{title}</b><span>{value}</span><small>{note}</small></li>)}</ol>
        </div>
        <p className="coda">I publish these next to the results that passed. They are what make the passes worth reading.</p>
      </div>
    </section>
    <section id="s-end" className="tone-orange" tabIndex={-1} aria-labelledby="closing-heading">
      <div className="inner chapter closing">
        <p className="eyebrow">What you just watched</p><h2 id="closing-heading">Five different failures. One loop.</h2>
        <ol className="loop">{loop.map(([label, text], i) => <li key={label} style={{ "--step": i, "--chapter-ink": chapters[[1, 2, 4, 5, 6, 8][i]].color } as CSSProperties}><span aria-hidden="true">0{i + 1}</span><h3>{label}</h3><p>{text}</p></li>)}</ol>
        <div className="closing-contact"><h2>Tell me where your system breaks.</h2><ContactPrompt email={contact.email} prompts={prompts} /><p>{contact.availability}</p>
          <div className="actions">{["LinkedIn", "GitHub", "Hugging Face"].map(name => { const link = socialLinks.find(x => x.name === name); return link && <External key={name} href={link.url}>{name}</External> })}<a className="outline" href={asset(profile.resumeUrl)}>Résumé ↓</a></div>
        </div>
        <nav className="closing-nav" aria-label="Keep exploring">
          <Link href="/archive/" prefetch={false}><b>The archive →</b><span>All {archiveProjects.length} projects by what they test, and the full record.</span></Link>
          <Link href="/60-seconds/" prefetch={false}><b>60 seconds →</b><span>Role, three cases, experience and contact on one page.</span></Link>
          <a href="#s-open"><b>Back to the top ↑</b><span>AI that knows when it’s wrong.</span></a>
        </nav>
        <footer className="colophon"><span>© 2026 {profile.name} · {profile.handle}</span><span>Archivo and JetBrains Mono</span></footer>
      </div>
    </section>
  </main>
}

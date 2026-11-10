import Link from "next/link"
import { certificates, contact, experience, profile, socialLinks } from "@/content"
import { archiveProjects, cases, dimensions, education, projectById, type Case } from "@/content/casebook"
import { asset } from "@/lib/asset"
import { ArchiveBrowser } from "./archive-browser"
import { ModeLink } from "./route-links"
import { External, ModeLinks, type Mode } from "./shared"

function ReadingHeader({ mode, title }: { mode: Mode; title: string }) {
  return <header className="reading-header"><p className="eyebrow">{title}</p><ModeLinks mode={mode} /></header>
}

function ContactLinks() {
  return <div className="brief-actions">
    <a className="outline big filled" href={asset(profile.resumeUrl)}>Résumé ↓</a>
    <a className="outline big" href={`mailto:${contact.email}`}>Email</a>
    {["LinkedIn", "GitHub"].map(name => { const x = socialLinks.find(l => l.name === name); return x && <External key={name} href={x.url}>{name}</External> })}
  </div>
}

export function Brief() {
  const [cloud, accenture] = experience
  const featured: Case[] = [cases.gate, cases.boundary, cases.router]
  return <main id="main-content" className="tone-bone reading" tabIndex={-1}>
    <div className="inner">
      <ReadingHeader mode="brief" title="The 60-second path" />
      <div className="brief-hero">
        <div><p className="eyebrow subdued">{profile.headline}</p><h1>{profile.name}</h1><p className="role">{cloud.role} at Cloud202, since Sep 2026</p>
          <p className="position">I build governance and safety controls for AI agents on Amazon Bedrock and AgentCore. I publish my evaluations, including the misses.</p></div>
        <ContactLinks />
      </div>
      <section className="brief-section" aria-labelledby="brief-work"><h2 id="brief-work">Three cases</h2>
        <div className="brief-cases">{featured.map(entry => {
          const p = projectById(entry.projectId)
          return <article key={entry.id}><p className="eyebrow subdued">{entry.kind}</p><h3>{p.title}</h3><strong className="metric">{entry.briefMetric ?? entry.metric}</strong><p>{entry.brief?.result ?? entry.result}</p><p className="brief-limit">{entry.brief?.limit ?? entry.limit}</p><div className="actions"><Link className="outline" href={`/#${entry.id}`} prefetch={false}>Watch the case</Link>{p.links.github && <External href={p.links.github}>Code</External>}</div></article>
        })}</div>
      </section>
      <section className="brief-section" aria-labelledby="brief-experience"><h2 id="brief-experience">Experience</h2>
        <ul className="brief-experience">
          {[cloud, accenture].map((job, i) => <li key={job.company}><span>{job.dates}</span><p><b>{job.company}</b> · {job.role}. {i === 0 ? "Audited 15+ agent governance features against AWS sample projects." : "Cut slow API responses from roughly 80% to under 20%."}</p></li>)}
          <li><span>2021 to 2023</span><p>Four internships in NL-to-SQL, machine learning, research proposals, and sponsorship.</p></li>
          <li><span>{education.dates}</span><p><b>{education.title}</b>, {education.school}. {education.detail}.</p></li>
        </ul>
      </section>
      <section className="brief-section" aria-labelledby="brief-how"><h2 id="brief-how">How I work</h2><p className="brief-how">Measure the baseline, set the pass mark before scoring, check independently, and publish the misses.</p></section>
      <section id="contact" className="brief-section" aria-labelledby="brief-contact"><h2 id="brief-contact">Contact</h2><div><a className="mail" href={`mailto:${contact.email}`}>{contact.email}</a><div className="actions"><ModeLink className="outline big filled" destination="casebook">Open the full casebook</ModeLink><ModeLink className="outline big" destination="archive">All {archiveProjects.length} projects</ModeLink></div></div></section>
    </div>
  </main>
}

export function Archive() {
  return <main id="main-content" className="tone-bone reading" tabIndex={-1}>
    <div className="inner">
      <ReadingHeader mode="archive" title="The archive" />
      <div className="archive-hero"><p className="eyebrow subdued">{profile.name} · AI Engineer</p><h1>Everything, by what it tests</h1><p>All fifteen projects and the full record. Pick a line of work to light up its projects, then pick a project to see it.</p></div>
      <section aria-labelledby="archive-projects"><h2 id="archive-projects" className="sr-only">Projects</h2><ArchiveBrowser entries={archiveProjects} dimensions={dimensions} /></section>
      <section className="record" id="record" aria-labelledby="record-heading">
        <h2 id="record-heading">The record</h2><p className="record-intro">Almost two years of production Java on AWS taught me to profile first and trust tests over confidence. Agent governance is where that habit is most useful now.</p>
        {experience.map((job, i) => <article className="record-row" key={job.company}><p className="record-date">{job.dates.split(" ").filter(word => /^\d{4}$/.test(word)).join(" to ")}<small>{job.dates}</small>{i === 0 && <span className="now">Now</span>}</p><div><h3>{job.company}</h3><p className="subdued">{job.role} · {job.location}</p><ul>{job.bullets.map(b => <li key={b}>{b}</li>)}</ul></div></article>)}
        <div className="record-extras">
          <div><h3>Education</h3><p><b>{education.title}</b><br />{education.school}<br />{education.dates} · {education.detail}</p><div className="actions"><a className="outline" href={asset(profile.resumeUrl)}>Résumé ↓</a></div></div>
          <div id="certificates"><h3>Selected credentials</h3><ul>{certificates.slice(0, 5).map(x => <li key={x.title}>{x.credentialUrl ? <a href={x.credentialUrl}>{x.title} ↗</a> : <span>{x.title}</span>}<small>{x.date}</small></li>)}</ul>
            {certificates.length > 5 && <details><summary>Show all {certificates.length} credentials</summary><ul>{certificates.slice(5).map(x => <li key={x.title}>{x.credentialUrl ? <a href={x.credentialUrl}>{x.title} ↗</a> : <span>{x.title}</span>}<small>{x.date}</small></li>)}</ul></details>}
          </div>
        </div>
      </section>
    </div>
  </main>
}

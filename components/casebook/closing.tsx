"use client"

import { useState } from "react"

export function ContactPrompt({ email, prompts }: { email: string; prompts: { label: string; reply: string }[] }) {
  const [index, setIndex] = useState(1)
  const choice = prompts[index]
  const subject = index === prompts.length - 1 ? "Edge case" : `Edge case: ${choice.label.toLowerCase()}`
  return <>
    <p id="choose-edge">Which obvious move is it making?</p>
    <div className="options" role="group" aria-labelledby="choose-edge">{prompts.map((prompt, i) => <button className="control" type="button" key={prompt.label} aria-pressed={i === index} onClick={() => setIndex(i)}>{prompt.label}</button>)}</div>
    <div className="email-draft">
      <div aria-live="polite"><p className="eyebrow">To: {email}</p><p className="subject">Subject: {subject}</p><p>{choice.reply}</p></div>
      <a className="outline big filled" href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}>Write the email <span aria-hidden="true">→</span></a>
    </div>
  </>
}

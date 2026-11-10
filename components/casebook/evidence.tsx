"use client"

import { useRef } from "react"

export function Evidence({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  return <>
    <button ref={trigger} type="button" className="outline filled" aria-haspopup="dialog" aria-controls={`evidence-${id}`} onClick={() => dialog.current?.showModal()}>Evidence +</button>
    <dialog ref={dialog} id={`evidence-${id}`} className="evidence" aria-labelledby={`evidence-title-${id}`}
      onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close() }}
      onClose={() => trigger.current?.focus({ preventScroll: true })}>
      <div className="evidence-paper">
        <header><p className="eyebrow">Evidence</p><button type="button" className="outline" autoFocus onClick={() => dialog.current?.close()}>Close</button></header>
        <h2 id={`evidence-title-${id}`}>{title}</h2>
        {children}
      </div>
    </dialog>
  </>
}

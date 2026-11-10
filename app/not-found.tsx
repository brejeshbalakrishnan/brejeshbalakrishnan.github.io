import Link from "next/link"
import { ModeLinks } from "@/components/casebook/shared"

export default function NotFound() {
  return <main id="main-content" tabIndex={-1} className="tone-black reading">
    <div className="inner"><header className="reading-header"><p className="eyebrow">404 · Edge case</p><ModeLinks mode="casebook" /></header>
      <div className="archive-hero"><h1>Nothing at this address.</h1><p>The casebook and project archive are still here.</p><div className="actions"><Link className="outline" href="/">Open Casebook</Link><Link className="outline" href="/archive/">Open Archive</Link></div></div>
    </div>
  </main>
}

import { Brief } from "@/components/casebook/modes"
import { Transport } from "@/components/casebook/transport"
import { chapters } from "@/content/casebook"
import { readingMetadata } from "@/lib/reading-metadata"

export const metadata = readingMetadata("60 Seconds", "Brejesh Balakrishnan’s role, three measured AI engineering cases, experience, and contact in one quick read.", "/60-seconds/")
export default function BriefPage() {
  return <><Brief /><Transport mode="brief" chapters={chapters} /></>
}

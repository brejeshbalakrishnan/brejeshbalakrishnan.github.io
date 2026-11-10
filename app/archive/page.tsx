import { Archive } from "@/components/casebook/modes"
import { Transport } from "@/components/casebook/transport"
import { chapters } from "@/content/casebook"
import { readingMetadata } from "@/lib/reading-metadata"

export const metadata = readingMetadata("Archive", "Fifteen projects organized by what they test, with results, limits, code, and Brejesh Balakrishnan’s experience.", "/archive/")
export default function ArchivePage() {
  return <><Archive /><Transport mode="archive" chapters={chapters} /></>
}

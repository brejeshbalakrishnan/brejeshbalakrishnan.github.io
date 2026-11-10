import { Story } from "@/components/casebook/story"
import { Transport } from "@/components/casebook/transport"
import { chapters } from "@/content/casebook"

export default function CasebookPage() {
  return <><Story /><Transport mode="casebook" chapters={chapters} /></>
}

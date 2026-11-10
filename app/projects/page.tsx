import { LegacyRedirect, redirectMetadata } from "@/components/casebook/legacy-redirect"

const path = "/archive/"
export const metadata = redirectMetadata(path)
export default function Page() { return <LegacyRedirect path={path} /> }

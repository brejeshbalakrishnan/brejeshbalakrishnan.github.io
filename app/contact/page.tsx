import { LegacyRedirect, redirectMetadata } from "@/components/casebook/legacy-redirect"

const path = "/60-seconds/#contact"
export const metadata = redirectMetadata(path)
export default function Page() { return <LegacyRedirect path={path} /> }

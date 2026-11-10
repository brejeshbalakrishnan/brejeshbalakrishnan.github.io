import { projects } from "@/content"
import { legacyIds, legacyProjectTarget } from "@/lib/legacy-routes.mjs"
import { LegacyRedirect, redirectMetadata } from "@/components/casebook/legacy-redirect"

const active = projects.map(p => p.id)
type Props = { params: Promise<{ id: string }> }
export const dynamicParams = false
export const generateStaticParams = () => [...new Set([...active, ...legacyIds])].map(id => ({ id }))
export async function generateMetadata({ params }: Props) { return redirectMetadata(legacyProjectTarget((await params).id, active)) }
export default async function Page({ params }: Props) { return <LegacyRedirect path={legacyProjectTarget((await params).id, active)} /> }

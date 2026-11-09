import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { InvitationPage } from '@/components/invitation-page'
import { WeddingDataProvider } from '@/lib/wedding-data'
import { getInvitationBySlug, isLive } from '@/lib/invitations'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const resolved = await getInvitationBySlug(slug)
  if (!resolved || !isLive(resolved.invitation)) return { title: 'Invitation not found' }
  const { bride, groom, date } = resolved.invitation.data
  const title = `${bride.shortName} & ${groom.shortName} — ${date.short}`
  return {
    title,
    description: `You are invited to the wedding of ${bride.name} and ${groom.name}.`,
  }
}

export default async function Page({ params }: Params) {
  const { slug } = await params
  const resolved = await getInvitationBySlug(slug)
  if (!resolved || !isLive(resolved.invitation)) notFound()

  return (
    <WeddingDataProvider slug={slug} data={resolved.invitation.data}>
      <InvitationPage />
    </WeddingDataProvider>
  )
}

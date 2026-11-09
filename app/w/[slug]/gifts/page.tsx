import { notFound } from 'next/navigation'
import { GiftsPageClient } from '@/components/gifts-page-client'
import { WeddingDataProvider } from '@/lib/wedding-data'
import { getInvitationBySlug, isLive } from '@/lib/invitations'

export const dynamic = 'force-dynamic'

export default async function GiftsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const resolved = await getInvitationBySlug(slug)
  if (!resolved || !isLive(resolved.invitation)) notFound()

  return (
    <WeddingDataProvider slug={slug} data={resolved.invitation.data}>
      <GiftsPageClient />
    </WeddingDataProvider>
  )
}

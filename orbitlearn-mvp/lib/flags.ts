import { db } from '@/lib/db'

export async function getFlag(key: string, organizationId?: string) {
  const f = await db.featureFlag.findFirst({
    where: { key, organizationId: organizationId ?? null }
  })
  return f?.enabled ?? false
}

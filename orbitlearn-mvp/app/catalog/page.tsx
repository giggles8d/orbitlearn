import Link from 'next/link'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function CatalogPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = (searchParams?.q ?? '').trim()
  const courses = await db.course.findMany({
    where: q ? {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ]
    } : undefined,
    select: { id: true, slug: true, title: true, subtitle: true, coverImageUrl: true, price: true, currency: true }
  })

  return (
    <div className="space-y-6">
      <form className="flex gap-3">
        <input name="q" placeholder="Search courses..." defaultValue={q} className="w-full rounded-md bg-white/10 px-3 py-2 outline-none" />
        <button className="rounded-md border border-white/20 px-4">Search</button>
      </form>

      <div className="grid md:grid-cols-3 gap-6">
        {courses.map(c => (
          <Link key={c.id} href={`/course/${c.slug}`} className="rounded-lg border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition">
            <div className="aspect-video rounded-md bg-white/10 mb-3" />
            <h3 className="font-semibold">{c.title}</h3>
            <p className="text-sm text-white/70">{c.subtitle}</p>
            <p className="text-sm mt-2">{c.price ? `${c.currency} ${c.price/100}` : 'Free'}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

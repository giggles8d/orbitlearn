import Link from 'next/link'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function StudioHome() {
  const courses = await db.course.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Studio</h1>
        <Link href="/studio/courses/new" className="rounded-md bg-brand text-white px-4 py-2 text-sm">New Course</Link>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {courses.map(c => (
          <div key={c.id} className="rounded border border-white/10 p-4 bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-sm text-white/70">{c.subtitle}</div>
              </div>
              <a href={`/course/${c.slug}`} className="text-sm underline">View</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

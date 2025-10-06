import { db } from '@/lib/db'
import { z } from 'zod'
import { NextRequest } from 'next/server'
import slugify from '@/lib/slugify'

export async function GET() {
  const courses = await db.course.findMany({ orderBy: { createdAt: 'desc' } })
  return Response.json({ courses })
}

const CreateSchema = z.object({
  title: z.string().min(3),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional()
})

export async function POST(req: NextRequest) {
  const json = await req.json()
  const parsed = CreateSchema.safeParse(json)
  if (!parsed.success) return new Response('Invalid data', { status: 400 })

  const p = parsed.data
  const slug = slugify(p.title)
  const price = p.price ? parseInt(p.price) : null

  const existing = await db.course.findUnique({ where: { slug } })
  if (existing) return new Response('Course with similar title already exists', { status: 409 })

  const course = await db.course.create({
    data: {
      slug,
      title: p.title,
      subtitle: p.subtitle ?? null,
      description: p.description ?? null,
      category: p.category ?? null,
      price,
      currency: p.currency ?? 'USD',
      status: 'DRAFT'
    }
  })

  return Response.json({ id: course.id, slug: course.slug })
}

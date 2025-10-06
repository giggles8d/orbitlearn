import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const course = await db.course.findUnique({ where: { id: params.id } })
  if (!course) return new Response('Not found', { status: 404 })
  return Response.json({ course })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const json = await req.json()
  const course = await db.course.update({ where: { id: params.id }, data: json })
  return Response.json({ course })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.course.delete({ where: { id: params.id } })
  return new Response(null, { status: 204 })
}

import { db } from '@/lib/db'

export async function POST(req: Request) {
  const form = await req.formData()
  const lessonId = form.get('lessonId')?.toString()
  if (!lessonId) return new Response('Missing lessonId', { status: 400 })

  const quiz = await db.quiz.findUnique({
    where: { lessonId },
    include: { questions: { include: { options: true } } }
  })
  if (!quiz) return new Response('Quiz not found', { status: 404 })

  let correct = 0
  quiz.questions.forEach(q => {
    const submitted = form.getAll(`q_${q.id}`).map(String)
    const correctOpts = q.options.filter(o => o.correct).map(o => o.id)
    const submittedSet = new Set(submitted)
    const correctSet = new Set(correctOpts)
    const ok = submittedSet.size === correctSet.size && [...submittedSet].every(x => correctSet.has(x))
    if (ok) correct++
  })

  return Response.json({ total: quiz.questions.length, correct })
}

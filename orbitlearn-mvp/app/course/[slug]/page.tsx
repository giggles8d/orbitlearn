import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const course = await db.course.findFirst({
    where: { slug: params.slug },
    include: {
      modules: {
        orderBy: { index: 'asc' },
        include: { lessons: { orderBy: { index: 'asc' }, include: { quiz: { include: { questions: { include: { options: true } } } } } } }
      }
    }
  })
  if (!course) return notFound()

  const firstLesson = course.modules[0]?.lessons[0]
  const lessonContent = firstLesson?.content ?? '# Coming Soon\nThis lesson will be updated.'

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-8">
      <aside className="space-y-4">
        <div className="rounded-md border border-white/10 p-4 bg-white/5">
          <h2 className="font-semibold">{course.title}</h2>
          <p className="text-sm text-white/70">{course.subtitle}</p>
        </div>
        <nav className="rounded-md border border-white/10 p-3 bg-white/5 text-sm">
          {course.modules.map(m => (
            <div key={m.id} className="mb-3">
              <div className="font-medium">{m.title}</div>
              <ul className="mt-2 space-y-1">
                {m.lessons.map(l => (
                  <li key={l.id} className="flex items-center justify-between">
                    <a href={`#lesson-${l.id}`} className="hover:underline">{l.title}</a>
                    {l.freePreview ? <span className="text-[10px] rounded bg-white/10 px-1.5 py-0.5">Preview</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <section className="space-y-6">
        {course.modules.map(m => (
          <div key={m.id}>
            {m.lessons.map(l => (
              <article key={l.id} id={`lesson-${l.id}`} className="mb-8">
                <div className="rounded-md border border-white/10 p-4 bg-white/5">
                  <h3 className="font-semibold text-lg">{l.title}</h3>
                  {l.videoUrl ? (
                    <div className="aspect-video bg-black/50 rounded mt-3">
                      {/* Replace with real player (Mux/CF Stream) */}
                      <video src={l.videoUrl} controls className="w-full h-full rounded" />
                    </div>
                  ) : null}
                  <div className="prose prose-invert mt-4 max-w-none">
                    <ReactMarkdown>{l.content || ''}</ReactMarkdown>
                  </div>
                </div>

                {l.quiz ? (
                  <form action="/api/quiz/submit" method="post" className="mt-4 rounded-md border border-white/10 p-4 bg-white/5">
                    <input type="hidden" name="lessonId" value={l.id} />
                    <h4 className="font-medium mb-2">Quiz</h4>
                    <div className="space-y-3">
                      {l.quiz.questions.map((q, idx) => (
                        <div key={q.id} className="space-y-2">
                          <div className="text-sm font-medium">{idx+1}. {q.prompt}</div>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {q.options.map(o => (
                              <label key={o.id} className="flex items-center gap-2 rounded border border-white/10 p-2">
                                <input type={q.type === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'} name={`q_${q.id}`} value={o.id} />
                                <span className="text-sm">{o.text}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="mt-3 rounded-md border border-white/20 px-4 py-2">Submit</button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        ))}
      </section>
    </div>
  )
}

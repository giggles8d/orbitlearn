import Link from 'next/link'

export default async function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
          Build and sell beautiful courses—<span className="text-white/80">fast</span>.
        </h1>
        <p className="mt-4 text-white/70 max-w-2xl mx-auto">
          Launch a modern learning app with a sleek player, creator studio, quizzes, progress tracking,
          and growth-ready hooks for auth, payments, AI tutor, and video streaming.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/catalog" className="rounded-md bg-brand text-white px-5 py-3 font-medium">Explore Catalog</Link>
          <Link href="/studio" className="rounded-md border border-brand/30 px-5 py-3 font-medium text-brand hover:bg-brand/10">Open Studio</Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        {[
          { title: 'Blazing Player', desc: 'Clean, focused UI with keyboard shortcuts and progress sync.' },
          { title: 'Creator Studio', desc: 'Create modules & lessons, upload videos, write in Markdown.' },
          { title: 'Quizzes & Notes', desc: 'Assess learning and capture insights per lesson.' }
        ].map((f) => (
          <div key={f.title} className="rounded-lg border border-white/10 p-6 bg-white/5">
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-white/70 mt-2">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

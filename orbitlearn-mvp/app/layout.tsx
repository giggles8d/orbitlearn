import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'OrbitLearn – Learn at escape velocity.',
  description: 'A modern learning platform with creator tools, quizzes, and a blazing-fast player.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur">
          <nav className="container flex items-center justify-between py-4">
            <Link href="/" className="font-semibold tracking-tight flex items-center gap-2">
              <img src="/logo.svg" alt="OrbitLearn logo" className="h-6 w-6" />
              <span>OrbitLearn</span>
            </Link>
            <div className="flex gap-6 text-sm">
              <Link href="/catalog">Catalog</Link>
              <Link href="/studio">Studio</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
          </nav>
        </header>
        <main className="container py-10">{children}</main>
        <footer className="border-t border-white/10 mt-10 py-8 text-sm text-white/70">
          <div className="container flex items-center justify-between">
            <p>© {new Date().getFullYear()} OrbitLearn</p>
            <p><a href="https://example.com" target="_blank" rel="noreferrer">Docs</a></p>
          </div>
        </footer>
      </body>
    </html>
  )
}

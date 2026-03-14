'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, UtensilsCrossed, ShoppingCart } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Meals', icon: UtensilsCrossed },
  { href: '/favorites', label: 'Favorites', icon: Heart },
  { href: '/grocery-list', label: 'Grocery List', icon: ShoppingCart },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between h-14">
        <Link href="/dashboard" className="font-heading font-bold text-lg text-foreground">
          DinnerDrop
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

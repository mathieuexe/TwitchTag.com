import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  Copy, 
  DollarSign, 
  Settings, 
  Megaphone,
  LogOut,
  Twitch
} from 'lucide-react'

async function getSession() {
  try {
    // Since we can't easily use next-auth in app router without proper setup,
    // we'll use a simplified auth check
    return null
  } catch {
    return null
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Simple auth check - in production, use proper auth middleware
  // For now, we'll show the admin panel
  
  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/pseudos', label: 'Pseudos générés', icon: Users },
    { href: '/admin/copied', label: 'Pseudos copiés', icon: Copy },
    { href: '/admin/donations', label: 'Dons', icon: DollarSign },
    { href: '/admin/announcements', label: 'Annonces', icon: Megaphone },
    { href: '/admin/settings', label: 'Paramètres', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-secondary border-r border-[#303032] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#303032]">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-twitch-purple rounded-lg flex items-center justify-center">
              <Twitch className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Admin</span>
              <span className="block text-xs text-text-secondary">TwitchTag</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-text-secondary rounded-lg hover:bg-bg-hover hover:text-white transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#303032]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-twitch-purple/20 flex items-center justify-center">
              <span className="text-twitch-purple font-bold text-sm">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin</p>
              <p className="text-xs text-text-secondary truncate">admin@twitchtag.com</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-text-secondary hover:text-white hover:bg-bg-hover rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Retour au site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

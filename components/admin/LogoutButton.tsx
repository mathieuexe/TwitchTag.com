'use client'

import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-text-secondary hover:text-white hover:bg-bg-hover rounded-lg transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Déconnexion
    </button>
  )
}
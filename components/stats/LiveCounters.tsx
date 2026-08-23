'use client'

import { useEffect, useState } from 'react'
import { Users, Sparkles, Calendar, Activity } from 'lucide-react'

interface Stats {
  total_pseudos: number
  total_visits: number
  monthly_visits: number
  monthly_pseudos: number
}

export default function LiveCounters() {
  const [stats, setStats] = useState<Stats>({
    total_pseudos: 0,
    total_visits: 0,
    monthly_visits: 0,
    monthly_pseudos: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  const statItems = [
    { label: 'Visiteurs (Total)', value: stats.total_visits, icon: Users, color: 'text-twitch-purple' },
    { label: 'Pseudos (Total)', value: stats.total_pseudos, icon: Sparkles, color: 'text-twitch-purple' },
    { label: 'Visiteurs (Mois)', value: stats.monthly_visits, icon: Calendar, color: 'text-twitch-purple' },
    { label: 'Pseudos (Mois)', value: stats.monthly_pseudos, icon: Activity, color: 'text-twitch-purple' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
      {statItems.map((item, index) => (
        <div key={index} className="flex flex-col items-center justify-center text-center p-2">
          <div className="flex items-center gap-2 mb-1">
            <item.icon className={`w-4 h-4 ${item.color}`} />
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {item.label}
            </span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            {item.value.toLocaleString('fr-FR')}
          </span>
        </div>
      ))}
    </div>
  )
}

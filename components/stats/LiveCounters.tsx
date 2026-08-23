'use client'

import { useEffect, useState } from 'react'
import { Users, Sparkles, Calendar, Activity } from 'lucide-react'
import { trackVisit } from '@/lib/utils/stats'

import { useTranslations } from 'next-intl'

interface Stats {
  totalPseudos: number
  totalVisits: number
  monthlyVisits: number
  monthlyPseudos: number
}

export default function LiveCounters() {
  const t = useTranslations('LiveCounters')
  const [stats, setStats] = useState<Stats>({
    totalPseudos: 0,
    totalVisits: 0,
    monthlyVisits: 0,
    monthlyPseudos: 0,
  })

  useEffect(() => {
    // Track visit on mount
    trackVisit(window.location.pathname)

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
    { label: t('visitors_total'), value: stats.totalVisits || 0, icon: Users, color: 'text-twitch-purple' },
    { label: t('pseudos_total'), value: stats.totalPseudos || 0, icon: Sparkles, color: 'text-twitch-purple' },
    { label: t('visitors_month'), value: stats.monthlyVisits || 0, icon: Calendar, color: 'text-twitch-purple' },
    { label: t('pseudos_month'), value: stats.monthlyPseudos || 0, icon: Activity, color: 'text-twitch-purple' },
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

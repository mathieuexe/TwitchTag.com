'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Sparkles, Calendar, Clock } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase/client'

interface Stats {
  totalPseudos: number
  totalVisits: number
  monthlyVisits: number
  monthlyPseudos: number
}

interface CounterCardProps {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  shadowColor: string
  delay: number
}

function CounterCard({ label, value, icon, color, shadowColor, delay }: CounterCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (hasAnimated) return
    
    const timeout = setTimeout(() => {
      setHasAnimated(true)
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayValue(value)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, duration / steps)
    }, delay)

    return () => clearTimeout(timeout)
  }, [value, delay, hasAnimated])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toLocaleString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className={`relative p-6 border-4 border-black ${color} ${shadowColor} hover:-translate-y-2 transition-transform duration-300`}
    >
      <div className="flex flex-col gap-4">
        <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center shadow-brutal-sm">
          {icon}
        </div>
        <div>
          <p className="text-black/80 font-bold uppercase tracking-wider text-sm mb-1">{label}</p>
          <p className="text-5xl font-black text-black tracking-tighter">
            {formatNumber(displayValue)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function LiveCounters() {
  const [stats, setStats] = useState<Stats>({
    totalPseudos: 0,
    totalVisits: 0,
    monthlyVisits: 0,
    monthlyPseudos: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    const subscription = supabaseClient
      .channel('stats-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'generated_pseudos' }, () => fetchStats())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'site_visits' }, () => fetchStats())
      .subscribe()

    return () => { subscription.unsubscribe() }
  }, [])

  if (loading) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-bg-tertiary border-4 border-[#303032] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-3 px-4 py-2 border-2 border-twitch-purple bg-twitch-purple/10 text-twitch-purple font-bold uppercase tracking-wider text-sm mb-6 shadow-brutal-sm">
              <span className="w-3 h-3 bg-twitch-purple animate-pulse" />
              Live Data
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">
              Stats en <span className="text-twitch-purple">Temps Réel</span>
            </h2>
          </div>
          <p className="text-text-secondary font-medium max-w-sm">
            L'impact de TwitchTag en direct. Des milliers de streamers nous font confiance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <CounterCard
            label="Pseudos générés"
            value={stats.totalPseudos}
            icon={<Sparkles className="w-8 h-8 text-black" />}
            color="bg-twitch-purple"
            shadowColor="shadow-brutal-yellow"
            delay={0}
          />
          <CounterCard
            label="Visites totales"
            value={stats.totalVisits}
            icon={<Users className="w-8 h-8 text-black" />}
            color="bg-twitch-cyan"
            shadowColor="shadow-brutal-pink"
            delay={100}
          />
          <CounterCard
            label="Visites ce mois"
            value={stats.monthlyVisits}
            icon={<Calendar className="w-8 h-8 text-black" />}
            color="bg-twitch-yellow"
            shadowColor="shadow-brutal-cyan"
            delay={200}
          />
          <CounterCard
            label="Pseudos ce mois"
            value={stats.monthlyPseudos}
            icon={<Clock className="w-8 h-8 text-black" />}
            color="bg-twitch-pink"
            shadowColor="shadow-brutal"
            delay={300}
          />
        </div>
      </div>
    </section>
  )
}

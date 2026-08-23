'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Copy, 
  DollarSign, 
  Eye, 
  TrendingUp, 
  Calendar,
  Sparkles
} from 'lucide-react'

interface DashboardStats {
  totalPseudos: number
  totalCopied: number
  totalDonations: number
  totalVisits: number
  monthlyPseudos: number
  monthlyDonations: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPseudos: 0,
    totalCopied: 0,
    totalDonations: 0,
    totalVisits: 0,
    monthlyPseudos: 0,
    monthlyDonations: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    trend, 
    color 
  }: { 
    icon: any
    label: string
    value: string | number
    trend?: string
    color: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary rounded-xl border border-[#303032] p-6"
    >
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-lg ${color} bg-opacity-20 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-status-success text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-text-secondary text-sm">{label}</p>
        <p className="text-2xl font-bold text-white mt-1">
          {loading ? '...' : value}
        </p>
      </div>
    </motion.div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
        <p className="text-text-secondary mt-1">
          Vue d'ensemble de l'activité de TwitchTag
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Pseudos générés"
          value={stats.totalPseudos.toLocaleString()}
          trend={`+${stats.monthlyPseudos} ce mois`}
          color="bg-twitch-purple"
        />
        <StatCard
          icon={Copy}
          label="Pseudos copiés"
          value={stats.totalCopied.toLocaleString()}
          color="bg-status-success"
        />
        <StatCard
          icon={DollarSign}
          label="Total des dons"
          value={`${stats.totalDonations.toLocaleString()}€`}
          trend={`+${stats.monthlyDonations}€ ce mois`}
          color="bg-status-info"
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-secondary rounded-xl border border-[#303032] p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/pseudos"
            className="flex items-center gap-3 p-4 bg-bg-tertiary rounded-lg hover:bg-bg-hover transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-twitch-purple/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-twitch-purple" />
            </div>
            <div>
              <p className="font-medium text-white">Pseudos</p>
              <p className="text-sm text-text-secondary">Voir tous</p>
            </div>
          </a>

          <a
            href="/admin/donations"
            className="flex items-center gap-3 p-4 bg-bg-tertiary rounded-lg hover:bg-bg-hover transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-status-success/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-status-success" />
            </div>
            <div>
              <p className="font-medium text-white">Dons</p>
              <p className="text-sm text-text-secondary">Voir les dons</p>
            </div>
          </a>

          <a
            href="/admin/announcements"
            className="flex items-center gap-3 p-4 bg-bg-tertiary rounded-lg hover:bg-bg-hover transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-status-info/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-status-info" />
            </div>
            <div>
              <p className="font-medium text-white">Annonces</p>
              <p className="text-sm text-text-secondary">Gérer les popups</p>
            </div>
          </a>

          <a
            href="/admin/settings"
            className="flex items-center gap-3 p-4 bg-bg-tertiary rounded-lg hover:bg-bg-hover transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-status-warning/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-status-warning" />
            </div>
            <div>
              <p className="font-medium text-white">Paramètres</p>
              <p className="text-sm text-text-secondary">Configuration</p>
            </div>
          </a>
        </div>
      </motion.div>
    </div>
  )
}

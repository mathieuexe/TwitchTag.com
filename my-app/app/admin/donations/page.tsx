'use client'

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { DollarSign, Loader2, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'
import { Donation } from '@/types'

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, count: 0 })

  useEffect(() => {
    fetchDonations()
  }, [])

  const fetchDonations = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const validDonations = data || []
      setDonations(validDonations)
      
      // Calc stats
      const completed = validDonations.filter(d => d.status === 'completed')
      setStats({
        total: completed.reduce((sum, d) => sum + d.amount, 0),
        count: completed.length
      })

    } catch (error) {
      console.error('Error fetching donations:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-twitch-green" />
          Dons & Revenus
        </h1>
        <p className="text-text-secondary font-medium mt-2">
          Suivi des donations via Stripe
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="brutal-card p-6 bg-twitch-green text-black">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center shadow-brutal-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase">Revenu Total</h3>
          </div>
          <p className="text-5xl font-black tracking-tighter">{stats.total}€</p>
        </div>
        
        <div className="brutal-card p-6 bg-bg-secondary">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-twitch-purple/20 border-2 border-twitch-purple flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-twitch-purple" />
            </div>
            <h3 className="text-xl font-black uppercase text-white">Nombre de dons</h3>
          </div>
          <p className="text-5xl font-black tracking-tighter text-white">{stats.count}</p>
        </div>
      </div>

      <div className="brutal-card p-6 bg-bg-secondary">
        <h3 className="text-xl font-black text-white uppercase mb-6">Historique des transactions</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-4 border-[#303032]">
                <th className="p-4 font-black uppercase text-sm tracking-wider text-text-secondary">Montant</th>
                <th className="p-4 font-black uppercase text-sm tracking-wider text-text-secondary">Statut</th>
                <th className="p-4 font-black uppercase text-sm tracking-wider text-text-secondary">Donateur</th>
                <th className="p-4 font-black uppercase text-sm tracking-wider text-text-secondary">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#303032]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-twitch-green" />
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-muted font-bold uppercase">
                    Aucun don pour le moment
                  </td>
                </tr>
              ) : (
                donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-bg-tertiary transition-colors">
                    <td className="p-4 font-black text-2xl text-white">
                      {donation.amount}€
                    </td>
                    <td className="p-4">
                      {donation.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-twitch-green/20 text-twitch-green font-bold text-xs uppercase border border-twitch-green/30">
                          <CheckCircle2 className="w-4 h-4" /> Complété
                        </span>
                      ) : donation.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-twitch-yellow/20 text-twitch-yellow font-bold text-xs uppercase border border-twitch-yellow/30">
                          <Loader2 className="w-4 h-4 animate-spin" /> En attente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-twitch-pink/20 text-twitch-pink font-bold text-xs uppercase border border-twitch-pink/30">
                          <XCircle className="w-4 h-4" /> Échoué
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{donation.donorName || 'Anonyme'}</div>
                      <div className="text-xs text-text-muted">{donation.donorEmail || '-'}</div>
                    </td>
                    <td className="p-4 text-sm font-medium text-text-secondary">
                      {new Date(donation.createdAt || '').toLocaleString('fr-FR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

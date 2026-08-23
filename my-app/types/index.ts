// User types
export interface User {
  id: string
  email: string
  name?: string
  isSuperAdmin?: boolean
}

// Pseudo types
export interface PseudoOptions {
  keywords: string[]
  includeNumbers: boolean
  includeSpecialChars: boolean
  easyToRemember: boolean
  length: number
  count: number
}

export interface GeneratedPseudo {
  id?: string
  pseudo: string
  keywords: string[]
  length: number
  hasNumbers: boolean
  hasSpecialChars: boolean
  easyToRemember: boolean
  createdAt?: string
  copiedAt?: string | null
}

// Stats types
export interface SiteStats {
  totalPseudos: number
  totalVisits: number
  monthlyVisits: number
  monthlyPseudos: number
}

// Donation types
export interface Donation {
  id?: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  donorEmail?: string
  donorName?: string
  message?: string
  isAnonymous: boolean
  createdAt?: string
  completedAt?: string | null
}

// Announcement types
export interface Announcement {
  id?: string
  title: string
  content: string
  type: 'info' | 'success' | 'warning' | 'error'
  isActive: boolean
  startDate?: string | null
  endDate?: string | null
  createdAt?: string
  updatedAt?: string
}

// Admin types
export interface AdminUser {
  id?: string
  email: string
  name?: string
  isSuperAdmin: boolean
  lastLoginAt?: string | null
  createdAt?: string
}

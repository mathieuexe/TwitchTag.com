import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabaseServer } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check admin in database
        const { data: admin, error } = await supabaseServer
          .from('admin_users')
          .select('*')
          .eq('email', credentials.email)
          .single()

        if (error || !admin) {
          return null
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, admin.password_hash)

        if (!isValid) {
          return null
        }

        // Update last login
        await supabaseServer
          .from('admin_users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', admin.id)

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          isSuperAdmin: admin.is_super_admin,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isSuperAdmin = user.isSuperAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isSuperAdmin = token.isSuperAdmin as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
})

export { handler as GET, handler as POST }

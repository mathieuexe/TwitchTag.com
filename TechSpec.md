# TwitchTag - Technical Specification

## Project Structure

```
my-app/
├── app/
│   ├── (main)/
│   │   ├── page.tsx                 # Page d'accueil avec générateur
│   │   ├── verifier/
│   │   │   └── page.tsx             # Page de vérification manuelle
│   │   └── donation/
│   │       └── page.tsx             # Page de donation
│   ├── admin/
│   │   ├── layout.tsx               # Layout admin avec sidebar
│   │   ├── page.tsx                 # Dashboard admin
│   │   ├── pseudos/
│   │   │   └── page.tsx             # Liste des pseudos générés
│   │   ├── copied/
│   │   │   └── page.tsx             # Pseudos copiés
│   │   ├── donations/
│   │   │   └── page.tsx             # Liste des dons
│   │   ├── settings/
│   │   │   └── page.tsx             # Paramètres site
│   │   └── announcements/
│   │       └── page.tsx             # Gestion popups annonces
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts         # Auth API routes
│   │   ├── generate-pseudo/
│   │   │   └── route.ts             # API génération pseudo
│   │   ├── check-username/
│   │   │   └── route.ts             # API vérification Twitch
│   │   ├── stats/
│   │   │   └── route.ts               # API stats globales
│   │   ├── stripe/
│   │   │   ├── create-session/
│   │   │   │   └── route.ts         # Création session Stripe
│   │   │   └── webhook/
│   │   │       └── route.ts         # Webhook Stripe
│   │   └── admin/
│   │       ├── pseudos/
│   │       │   └── route.ts
│   │       ├── copied/
│   │       │   └── route.ts
│   │       ├── donations/
│   │       │   └── route.ts
│   │       ├── stats/
│   │       │   └── route.ts
│   │       ├── settings/
│   │       │   └── route.ts
│   │       └── announcements/
│   │           └── route.ts
│   ├── layout.tsx                     # Layout racine
│   └── globals.css                    # Styles globaux
├── components/
│   ├── ui/                            # Composants shadcn/ui
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── AdminSidebar.tsx
│   ├── generator/
│   │   ├── PseudoGenerator.tsx
│   │   ├── PseudoOptions.tsx
│   │   └── GeneratedList.tsx
│   ├── verifier/
│   │   └── UsernameChecker.tsx
│   ├── stats/
│   │   └── LiveCounters.tsx
│   ├── donation/
│   │   └── DonationModal.tsx
│   └── admin/
│       ├── DataTable.tsx
│       ├── StatsCard.tsx
│       └── AnnouncementForm.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── stripe/
│   │   └── client.ts
│   ├── twitch/
│   │   └── api.ts
│   ├── utils/
│   │   ├── pseudo-generator.ts
│   │   └── stats.ts
│   └── auth/
│       └── options.ts
├── types/
│   ├── database.ts
│   ├── api.ts
│   └── index.ts
├── public/
│   ├── images/
│   └── fonts/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json

## Technologies Stack

### Core
- Next.js 14 (App Router)
- TypeScript
- React 18

### Styling
- Tailwind CSS
- shadcn/ui components
- Custom CSS variables for Twitch theme

### Backend & Database
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Realtime subscriptions for counters

### Authentication
- NextAuth.js v5 (Auth.js)
- Email/Password + OAuth providers

### APIs & Services
- Twitch API Helix (vérification pseudos)
- Stripe (paiements)
- Vercel (déploiement)

### State Management
- React hooks (useState, useEffect)
- SWR/React Query for API calls
- Context API for global state

### Utilities
- date-fns (date manipulation)
- zod (validation schémas)
- react-hook-form (formulaires)

## Database Schema (Supabase)

### Tables

```sql
-- Table: generated_pseudos
CREATE TABLE generated_pseudos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pseudo TEXT NOT NULL,
  keywords TEXT[],
  options JSONB,
  length INTEGER,
  has_numbers BOOLEAN DEFAULT false,
  has_special_chars BOOLEAN DEFAULT false,
  easy_to_remember BOOLEAN DEFAULT false,
  copied_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: copied_pseudos
CREATE TABLE copied_pseudos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pseudo TEXT NOT NULL,
  generated_pseudo_id UUID REFERENCES generated_pseudos(id),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: donations
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount INTEGER NOT NULL, -- en centimes
  currency TEXT DEFAULT 'eur',
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  donor_email TEXT,
  donor_name TEXT,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Table: site_visits
CREATE TABLE site_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  page_path TEXT,
  visit_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: site_settings
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, success, warning, error
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: admin_users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  is_super_admin BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin
INSERT INTO admin_users (email, password_hash, name, is_super_admin)
VALUES ('admin@twitchtag.com', '$2a$10$...', 'Admin', true);
```

### RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE generated_pseudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE copied_pseudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public can insert generated pseudos
CREATE POLICY "Allow public insert" ON generated_pseudos
  FOR INSERT TO anon WITH CHECK (true);

-- Public can insert copied pseudos
CREATE POLICY "Allow public insert" ON copied_pseudos
  FOR INSERT TO anon WITH CHECK (true);

-- Public can insert site visits
CREATE POLICY "Allow public insert" ON site_visits
  FOR INSERT TO anon WITH CHECK (true);

-- Only admins can read all data
CREATE POLICY "Admin full access" ON generated_pseudos
  FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
```

## API Routes

### Internal API (Next.js API Routes)

```
/api/generate-pseudo POST     - Génère des pseudos
/api/check-username GET       - Vérifie disponibilité Twitch
/api/stats GET                - Récupère les stats globales
/api/stripe/create-session POST - Crée session paiement
/api/stripe/webhook POST      - Webhook Stripe
```

### External APIs

#### Twitch API Helix
```
GET https://api.twitch.tv/helix/users?login={username}
Headers:
  - Client-ID: {TWITCH_CLIENT_ID}
  - Authorization: Bearer {access_token}
```

#### Supabase REST
```
Base URL: https://asadlmicfgvgeespouan.supabase.co
Headers:
  - apikey: {ANON_KEY}
  - Authorization: Bearer {JWT_TOKEN}
```

## Authentication Flow

### Admin Authentication
1. Login form → /api/auth/callback/credentials
2. Verify email/password against admin_users table
3. Create JWT session with role: 'admin'
4. Redirect to /admin

### Visitor Tracking
1. On page load, generate/anonymize visitor_id
2. Store in localStorage
3. Track page views in site_visits table

## Security

### Environment Variables
```
# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Twitch API
TWITCH_CLIENT_ID=4ieomv4l32flcgfndgjbroaxxmrb5m
TWITCH_CLIENT_SECRET=
TWITCH_REDIRECT_URI=

# Stripe
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Admin
ADMIN_DEFAULT_EMAIL=admin@twitchtag.com
ADMIN_DEFAULT_PASSWORD_HASH=
```

### CORS Policy
- Allow origins: Production domain only
- Allow methods: GET, POST, PUT, DELETE
- Allow headers: Content-Type, Authorization

### Rate Limiting
- API routes: 100 requests per minute per IP
- Generation: 50 pseudos per hour per IP
- Verification: 30 checks per minute per IP

## Performance Optimizations

### Frontend
- Static generation for landing pages
- Incremental static regeneration for stats
- Image optimization with next/image
- Code splitting by route
- Lazy loading for heavy components

### Backend
- Database indexing on frequently queried columns
- Connection pooling with Supabase
- Redis caching for Twitch API responses (5min TTL)
- Webhook processing queue for Stripe

### Database Indexes
```sql
CREATE INDEX idx_generated_pseudos_created_at ON generated_pseudos(created_at);
CREATE INDEX idx_copied_pseudos_created_at ON copied_pseudos(created_at);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_site_visits_date ON site_visits(visit_date);
CREATE INDEX idx_announcements_active ON announcements(is_active) WHERE is_active = true;
```

## Deployment

### Vercel Configuration
```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

### Build Process
1. Type checking: `tsc --noEmit`
2. Linting: `next lint`
3. Building: `next build`
4. Output: Static + SSR hybrid

### Post-deployment
1. Run database migrations
2. Verify environment variables
3. Test critical paths
4. Monitor error rates

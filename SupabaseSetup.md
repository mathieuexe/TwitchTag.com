# Configuration Supabase - TwitchTag

## Informations de connexion

- **Project ID**: asadlmicfgvgeespouan
- **URL**: https://asadlmicfgvgeespouan.supabase.co
- **Publishable Key**: sb_publishable_CTGZvoR5a2R74-7kLmo2iw_v6ywpCJs

## Tables à créer

### 1. generated_pseudos
```sql
CREATE TABLE generated_pseudos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pseudo TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  options JSONB DEFAULT '{}',
  length INTEGER,
  has_numbers BOOLEAN DEFAULT false,
  has_special_chars BOOLEAN DEFAULT false,
  easy_to_remember BOOLEAN DEFAULT false,
  copied_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE generated_pseudos ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public insert
CREATE POLICY "Allow public insert" ON generated_pseudos
  FOR INSERT TO anon WITH CHECK (true);
```

### 2. copied_pseudos
```sql
CREATE TABLE copied_pseudos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pseudo TEXT NOT NULL,
  generated_pseudo_id UUID REFERENCES generated_pseudos(id),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE copied_pseudos ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public insert
CREATE POLICY "Allow public insert" ON copied_pseudos
  FOR INSERT TO anon WITH CHECK (true);
```

### 3. donations
```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'eur',
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending',
  donor_email TEXT,
  donor_name TEXT,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
```

### 4. site_visits
```sql
CREATE TABLE site_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  page_path TEXT,
  visit_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public insert
CREATE POLICY "Allow public insert" ON site_visits
  FOR INSERT TO anon WITH CHECK (true);
```

### 5. site_settings
```sql
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
```

### 6. announcements
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
```

### 7. admin_users
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  is_super_admin BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Insert default admin (password: admin123 - change after first login!)
INSERT INTO admin_users (email, password_hash, name, is_super_admin)
VALUES (
  'admin@twitchtag.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Admin',
  true
)
ON CONFLICT (email) DO NOTHING;
```

## Indexes recommandés

```sql
-- Index for faster queries
CREATE INDEX idx_generated_pseudos_created_at ON generated_pseudos(created_at);
CREATE INDEX idx_generated_pseudos_copied_at ON generated_pseudos(copied_at);
CREATE INDEX idx_copied_pseudos_created_at ON copied_pseudos(created_at);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created_at ON donations(created_at);
CREATE INDEX idx_site_visits_visit_date ON site_visits(visit_date);
CREATE INDEX idx_site_visits_created_at ON site_visits(created_at);
CREATE INDEX idx_announcements_is_active ON announcements(is_active);
CREATE INDEX idx_announcements_dates ON announcements(start_date, end_date);
```

## Realtime Configuration

Enable realtime for tables that need live updates:

```sql
-- Enable realtime for generated_pseudos
alter publication supabase_realtime add table generated_pseudos;

-- Enable realtime for site_visits
alter publication supabase_realtime add table site_visits;

-- Enable realtime for donations
alter publication supabase_realtime add table donations;
```

## Notes importantes

1. **Changer le mot de passe admin** : Le mot de passe par défaut est `admin123`. Changez-le immédiatement après la première connexion.

2. **Sécurité** : Les clés Supabase sont sensibles. Ne les commitez jamais dans un repository public.

3. **Webhooks Stripe** : Configurez le webhook Stripe pour pointer vers `/api/stripe/webhook` avec l'événement `checkout.session.completed`.

4. **Variables d'environnement** : Copiez `.env.example` vers `.env.local` et remplissez toutes les valeurs requises.

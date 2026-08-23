-- ==========================================
-- TWITCHTAG - SUPABASE SCHEMA & RLS
-- ==========================================

-- 1. TABLES CREATION
-- ==========================================

-- Table: generated_pseudos (Pseudos générés)
CREATE TABLE IF NOT EXISTS generated_pseudos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pseudo TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    has_numbers BOOLEAN DEFAULT false,
    has_special_chars BOOLEAN DEFAULT false,
    easy_to_remember BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: copied_pseudos (Pseudos copiés par les utilisateurs)
CREATE TABLE IF NOT EXISTS copied_pseudos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pseudo TEXT NOT NULL,
    generated_pseudo_id UUID REFERENCES generated_pseudos(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: donations (Suivi des dons Stripe)
CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_session_id TEXT UNIQUE,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    donor_name TEXT,
    donor_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: site_visits (Statistiques de visites)
CREATE TABLE IF NOT EXISTS site_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: announcements (Popups d'annonces)
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, success, warning, error
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Table: admin_users (Administrateurs)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    is_super_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE
);


-- Table: chat_messages (Messages du chat en direct)
-- Note: Supporte les utilisateurs anonymes via des pseudos générés (ex: "anonyme-123")
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL,
    avatar_url TEXT,
    content TEXT NOT NULL,
    ip_address TEXT,
    name_color TEXT,
    is_deleted BOOLEAN DEFAULT false,
    is_poll BOOLEAN DEFAULT false,
    poll_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: chat_settings (Paramètres du chat)
CREATE TABLE IF NOT EXISTS chat_settings (
    id INT PRIMARY KEY DEFAULT 1,
    is_disabled BOOLEAN DEFAULT false,
    pinned_message TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: chat_bans (Bannissements du chat)
CREATE TABLE IF NOT EXISTS chat_bans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    username TEXT,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 2. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Activer RLS sur toutes les tables
ALTER TABLE generated_pseudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE copied_pseudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Politiques pour generated_pseudos
-- Tout le monde peut insérer et lire, personne ne peut modifier ou supprimer (sauf admin)
DO $$ BEGIN
    CREATE POLICY "Enable insert for all users" ON generated_pseudos FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Enable read for all users" ON generated_pseudos FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Politiques pour copied_pseudos
-- Tout le monde peut insérer, tout le monde peut lire (pour les stats)
DO $$ BEGIN
    CREATE POLICY "Enable insert for all users" ON copied_pseudos FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Enable read for all users" ON copied_pseudos FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Politiques pour site_visits
-- Tout le monde peut insérer, tout le monde peut lire (pour les compteurs)
DO $$ BEGIN
    CREATE POLICY "Enable insert for all users" ON site_visits FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Enable read for all users" ON site_visits FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Politiques pour donations
-- Seul le système (Service Role Key) peut insérer/modifier via le webhook Stripe
-- Tout le monde peut lire (pour afficher le total)
DO $$ BEGIN
    CREATE POLICY "Enable read for all users" ON donations FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Politiques pour announcements
-- Tout le monde peut lire les annonces actives
DO $$ BEGIN
    CREATE POLICY "Enable read for active announcements" ON announcements FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Politiques pour admin_users
-- Seuls les admins peuvent lire (bloqué pour public)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
-- Le serveur (Service Role Key) bypassera cette règle automatiquement pour NextAuth


-- Politiques pour chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
-- Utilisation de DO pour éviter l'erreur si la politique existe déjà
DO $$ BEGIN
    CREATE POLICY "Enable insert for all users" ON chat_messages FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Enable read for all users" ON chat_messages FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Politiques pour chat_settings
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Enable read for all users" ON chat_settings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Politiques pour chat_bans
ALTER TABLE chat_bans ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Enable read for all users" ON chat_bans FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- 3. INITIAL DATA (SEED)
-- ==========================================

-- Création d'un compte admin par défaut (Email: admin@twitchtag.com | Mot de passe: admin123)
-- PENSEZ À CHANGER CE MOT DE PASSE EN PRODUCTION
INSERT INTO admin_users (email, password_hash, name, is_super_admin)
VALUES (
    'admin@twitchtag.com',
    '$2a$10$r.M2Nn96X3Y80eM.k1L.KuvWfJ5H2t02T9c9JqB/bU9w.sR6N1p9C', 
    'Admin Principal',
    true
) ON CONFLICT (email) DO NOTHING;

-- 4. FUNCTIONS & TRIGGERS
-- ==========================================

-- Création de la ligne par défaut pour chat_settings
INSERT INTO chat_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Activer le mode Temps Réel
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE chat_messages, chat_settings, announcements;
COMMIT;

-- Fonction pour mettre à jour 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour la table donations
CREATE TRIGGER update_donations_updated_at
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

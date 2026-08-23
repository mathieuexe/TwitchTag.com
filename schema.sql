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
CREATE POLICY "Enable insert for all users" ON generated_pseudos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for all users" ON generated_pseudos FOR SELECT USING (true);

-- Politiques pour copied_pseudos
-- Tout le monde peut insérer, tout le monde peut lire (pour les stats)
CREATE POLICY "Enable insert for all users" ON copied_pseudos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for all users" ON copied_pseudos FOR SELECT USING (true);

-- Politiques pour site_visits
-- Tout le monde peut insérer, tout le monde peut lire (pour les compteurs)
CREATE POLICY "Enable insert for all users" ON site_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for all users" ON site_visits FOR SELECT USING (true);

-- Politiques pour donations
-- Seul le système (Service Role Key) peut insérer/modifier via le webhook Stripe
-- Tout le monde peut lire (pour afficher le total)
CREATE POLICY "Enable read for all users" ON donations FOR SELECT USING (true);

-- Politiques pour announcements
-- Tout le monde peut lire les annonces actives
CREATE POLICY "Enable read for active announcements" ON announcements FOR SELECT USING (is_active = true);


-- 3. FUNCTIONS & TRIGGERS
-- ==========================================

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

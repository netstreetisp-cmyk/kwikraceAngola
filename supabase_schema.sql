-- KwikRace: Advanced Multi-Tenant Schema (Supabase/PostgreSQL)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE group_status AS ENUM ('pending', 'approved', 'rejected', 'in_queue', 'racing', 'finished', 'cancelled');
CREATE TYPE race_status AS ENUM ('warmup', 'active', 'finished', 'aborted');
CREATE TYPE user_role AS ENUM ('superadmin', 'partner_admin', 'partner_staff', 'client');

-- 3. TABLES

-- Service: Partners (Tenant Management)
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service: Users (Identity & RBAC)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id), -- Null for SuperAdmin
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'client',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service: CRM/Contacts
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) NOT NULL,
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    metadata JSONB DEFAULT '{}',
    last_interaction TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service: Groups & Registrations
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) NOT NULL,
    leader_name TEXT NOT NULL,
    leader_phone TEXT NOT NULL,
    members JSONB DEFAULT '[]', -- List of player names/ids
    status group_status DEFAULT 'pending',
    price_paid NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    queue_position INT -- For FIFO priority
);

-- Service: Racing Engine
CREATE TABLE races (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) NOT NULL,
    group_id UUID REFERENCES groups(id) NOT NULL,
    status race_status DEFAULT 'warmup',
    racer_stats JSONB DEFAULT '{}', -- Laps, times, etc.
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service: Pricing & Subscriptions
CREATE TABLE pricing_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    duration_minutes INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service: Logs & Auditory
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id),
    user_id UUID REFERENCES users(id),
    service_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service: Analytics (Operational Stats)
CREATE TABLE daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) NOT NULL,
    date DATE NOT NULL,
    total_races INT DEFAULT 0,
    total_revenue NUMERIC(12, 2) DEFAULT 0.00,
    total_new_clients INT DEFAULT 0,
    UNIQUE(partner_id, date)
);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: Policies would be defined here to isolate data by partner_id
-- Example: CREATE POLICY "Partner Isolation" ON groups FOR ALL USING (partner_id = auth.jwt() ->> 'partner_id');

# System Architecture & Technical Specifications Document (Architecture.md)
## Project Name: Maharashtra Kho-Kho Association Official State Web Portal
**Version:** 1.0.0  
**Status:** Approved Engineering Blueprint  
**Primary Framework:** Next.js 15+ (App Router, Server Actions, TypeScript)  
**Database & Backend:** Supabase (PostgreSQL 15+, Auth, Storage, Row Level Security)  
**Styling & UI:** Tailwind CSS, shadcn/ui, Lucide Icons  
**Reporting & Docs:** ExcelJS, pdf-lib, QRCode  

---

## 1. High-Level Architectural Overview

The portal is designed as a secure, distributed multi-tenant state athletic portal serving:
1. **Public Web Layer:** Lightweight, mobile-first registration workflows with client-side image compression, real-time Zod validations, and zero-login status/re-application pipelines.
2. **District Portal (`/district/*`):** Isolated workspace for 36 pre-seeded Maharashtra district associations to manage local athletes, submit tournament squads (12–15 players), and download verified credentials.
3. **Association State HQ Portal (`/association/*`):** Authoritative super-admin cockpit to adjudicate incoming applications, announce competitions, manage official scoresheets, oversee the 48-hour anti-fixing result window, and dynamically configure certificate signatories.

```
                        +---------------------------------------+
                        |       Next.js 15 App Router Layer     |
                        +---------------------------------------+
                                    |              |
           +------------------------+              +------------------------+
           |                                                                |
+---------------------+                                          +---------------------+
| (public) Web Pages  |                                          | (auth) Portals      |
| - /register/player  |                                          | - /association/*    |
| - /register/referee |                                          | - /district/*       |
| - /verify/cert/[id] |                                          +---------------------+
+---------------------+                                                     |
           |                                                                |
           +------------------------+---------------------------------------+
                                    |
                 +--------------------------------------+
                 |      Supabase Cloud Infrastructure   |
                 +--------------------------------------+
                 | 1. PostgreSQL (RLS & Partial Indexes)|
                 | 2. Auth (Role-based JWT sessions)    |
                 | 3. Storage (Private Docs / Public)   |
                 | 4. Edge Functions / Resend SMTP Mail |
                 +--------------------------------------+
```

---

## 2. Next.js 15+ Project File & Route Structure

```
maharashtra-kho-kho/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                     # Official Home / Notices / Public Results
│   │   │   ├── register/
│   │   │   │   ├── player/page.tsx          # 22 Fields + 5 Attachments Bilingual Form
│   │   │   │   └── referee/page.tsx         # Referee Accreditation Registration
│   │   │   ├── reapply/
│   │   │   │   └── [token]/page.tsx         # Magic Token Pre-filled Form Resubmission
│   │   │   └── verify/
│   │   │       └── cert/[certNo]/page.tsx   # Public QR Code Certificate Authenticator
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx               # Unified Login (Association / 36 Districts)
│   │   │   └── unauthorized/page.tsx        # RBAC Fallback
│   │   │
│   │   ├── (association)/association/
│   │   │   ├── dashboard/page.tsx           # State Stats KPI & Master Cutoff Settings
│   │   │   ├── players/
│   │   │   │   ├── approvals/page.tsx       # Pending Approval / Rejection Queue
│   │   │   │   ├── directory/page.tsx       # State Master Registry & Federation No.
│   │   │   │   ├── transfers/page.tsx       # Inter-District Transfer Requests
│   │   │   │   └── updates/page.tsx         # Player Info Update Adjudication
│   │   │   ├── referees/
│   │   │   │   ├── approvals/page.tsx       # Referee Application Verification
│   │   │   │   └── list/page.tsx            # Approved Referees Directory
│   │   │   ├── districts/
│   │   │   │   ├── list/page.tsx            # 36 Districts Directory & Status
│   │   │   │   ├── updates/page.tsx         # District Profile Change Requests
│   │   │   │   └── passwords/page.tsx       # Master District Password Reset
│   │   │   ├── competitions/
│   │   │   │   ├── announce/page.tsx        # New Tournament + Custom DOB Limit
│   │   │   │   ├── announced/page.tsx       # Active Tournaments Directory
│   │   │   │   ├── [id]/entries/page.tsx    # District Squad Entries (12-15 Players)
│   │   │   │   ├── [id]/scoresheet/page.tsx # Digital Match Scoresheet Entry Grid
│   │   │   │   └── [id]/results/page.tsx    # 48h Cooling-off Result Declaration Desk
│   │   │   ├── certificates/
│   │   │   │   ├── templates/page.tsx       # Signatories Configuration (President/Secretary)
│   │   │   │   └── generate/page.tsx        # Batch PDF Generation Engine
│   │   │   └── notices/page.tsx             # Circular Uploads (Subject & Attachment)
│   │   │
│   │   ├── (district)/district/
│   │   │   ├── dashboard/page.tsx           # District KPI & Event Alerts
│   │   │   ├── players/
│   │   │   │   ├── active/page.tsx          # District Approved Roster
│   │   │   │   ├── pending/page.tsx         # Pending Applicants Under Review
│   │   │   │   └── update-request/page.tsx  # Propose Athlete Profile Changes
│   │   │   ├── competitions/
│   │   │   │   ├── upcoming/page.tsx        # Available State Tournaments
│   │   │   │   └── [id]/squad/page.tsx      # Multi-select 12-15 Players (Pre-deadline)
│   │   │   ├── transfer/page.tsx            # Initiate Player Release / Transfer
│   │   │   └── certificates/page.tsx        # Download Admitted Player Certificates
│   │   │
│   │   └── api/
│   │       ├── export/players/route.ts      # ExcelJS Export Engine (District / State)
│   │       ├── certificates/pdf/route.ts    # pdf-lib Overlay Generator
│   │       └── webhooks/resend/route.ts     # Email Delivery Event Handling
│   │
│   ├── components/
│   │   ├── forms/                           # Bilingual Form Components & Validations
│   │   ├── scoresheet/                      # Official 15-Player Kho-Kho Scoresheet Grid
│   │   ├── ui/                              # shadcn/ui Design Elements
│   │   └── shared/                          # QR Badges, Table Pagination, Skeletons
│   │
│   ├── lib/
│   │   ├── supabase/                        # Browser, Server, & Admin Client Singletons
│   │   ├── validations/                     # Zod Schemas for Registration & Scoresheets
│   │   ├── utils/                           # State No. Generators, Date Differs
│   │   └── mail/                            # Transactional Email Templates (Resend)
│   └── types/                               # TypeScript Definitions & Database Enums
```

---

## 3. Comprehensive Database Schema (PostgreSQL / Supabase SQL)

### 3.1 Custom Enums & Types
```sql
-- Core User & Role Types
CREATE TYPE user_role AS ENUM ('ROLE_ASSOCIATION', 'ROLE_DISTRICT');
CREATE TYPE application_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE');
CREATE TYPE age_section AS ENUM ('SUB_JUNIOR_BOYS', 'JUNIOR_BOYS', 'SENIOR_MEN', 'SUB_JUNIOR_GIRLS', 'JUNIOR_GIRLS', 'SENIOR_WOMEN');
CREATE TYPE result_status AS ENUM ('DRAFT', 'UNDER_REVIEW_48H', 'DECLARED', 'DISQUALIFIED');
CREATE TYPE tournament_position AS ENUM ('FIRST', 'SECOND', 'THIRD_JOINT', 'PARTICIPANT', 'RANK_FOURTH_PLUS');
```

---

### 3.2 Districts Master Table (36 Pre-seeded Accounts)
```sql
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,           -- e.g., 'MUM_CITY', 'PUN', 'THA', 'SOL'
    name_en VARCHAR(100) NOT NULL,               -- e.g., 'Thane'
    name_mr VARCHAR(100) NOT NULL,               -- e.g., 'ठाणे'
    contact_person VARCHAR(150),
    mobile VARCHAR(15),
    email VARCHAR(150) UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,        -- Used for District Login
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3.3 Players Table with Partial Unique Constraints
```sql
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Official Sport Identifiers
    state_no VARCHAR(30) UNIQUE,                 -- Assigned ONLY upon approval: MH-KK-2026-XXXX
    federation_no VARCHAR(50),                   -- National identifier (optional, editable)
    
    -- Personal Information (Section 1)
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    father_name VARCHAR(100),
    mother_name VARCHAR(100),
    aadhar_no VARCHAR(12) NOT NULL,              -- Sensitive Government ID
    gender gender_type NOT NULL,
    dob DATE NOT NULL,
    
    -- Contact Details (Section 2)
    mobile_no VARCHAR(15) NOT NULL,
    email VARCHAR(150) NOT NULL,
    
    -- Residential Address (Section 3)
    residential_district_id UUID REFERENCES districts(id),
    taluka VARCHAR(100),
    city VARCHAR(100),
    pincode VARCHAR(10) NOT NULL,
    full_address TEXT NOT NULL,
    
    -- Playing Representation District (Section 4)
    playing_district_id UUID REFERENCES districts(id) NOT NULL,
    current_district_id UUID REFERENCES districts(id) NOT NULL, -- Defaults to playing_district_id
    
    -- Document Attachments (Storage Paths in private bucket)
    photo_path TEXT NOT NULL,
    address_proof_path TEXT NOT NULL,
    id_proof_path TEXT NOT NULL,
    dob_proof_path TEXT NOT NULL,
    other_doc_path TEXT,
    
    -- Computed / Adjudication State
    status application_status DEFAULT 'PENDING' NOT NULL,
    rejection_reason TEXT,
    reapplication_token UUID DEFAULT gen_random_uuid(), -- One-time magic edit link
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial Unique Indexes: Allow rejected players to reapply without throwing duplicate key errors
CREATE UNIQUE INDEX idx_players_active_aadhar 
ON players (aadhar_no) 
WHERE status IN ('PENDING', 'APPROVED');

CREATE UNIQUE INDEX idx_players_active_mobile 
ON players (mobile_no) 
WHERE status IN ('PENDING', 'APPROVED');

CREATE UNIQUE INDEX idx_players_active_email 
ON players (email) 
WHERE status IN ('PENDING', 'APPROVED');
```

---

### 3.4 Referees Table
```sql
CREATE TABLE referees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    gender gender_type NOT NULL,
    dob DATE NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    email VARCHAR(150) NOT NULL,
    residential_address TEXT NOT NULL,
    district_id UUID REFERENCES districts(id) NOT NULL,
    
    -- Professional Qualifications
    exam_passing_year INT NOT NULL,
    grade VARCHAR(50) NOT NULL,                  -- e.g., State Level, National Level
    
    -- Documents
    photo_path TEXT NOT NULL,
    id_proof_path TEXT NOT NULL,
    cert_proof_path TEXT NOT NULL,
    
    status application_status DEFAULT 'PENDING' NOT NULL,
    rejection_reason TEXT,
    approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_referees_active_mobile 
ON referees (mobile) 
WHERE status IN ('PENDING', 'APPROVED');

CREATE UNIQUE INDEX idx_referees_active_email 
ON referees (email) 
WHERE status IN ('PENDING', 'APPROVED');
```

---

### 3.5 Competitions & 12-15 Player Squad Entries Table
```sql
CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    place VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    category age_section NOT NULL,
    last_date_to_participate TIMESTAMPTZ NOT NULL, -- Strict roster lock deadline (23:59:59 IST)
    dob_limit DATE NOT NULL,                      -- Tournament-specific cutoff boundary
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE competition_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    is_locked BOOLEAN DEFAULT FALSE,
    override_by_association BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    
    CONSTRAINT uq_district_competition UNIQUE (competition_id, district_id)
);

CREATE TABLE squad_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES competition_entries(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES players(id) ON DELETE RESTRICT NOT NULL,
    chest_no INT CHECK (chest_no BETWEEN 1 AND 15),
    is_substitute BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT uq_entry_player UNIQUE (entry_id, player_id),
    CONSTRAINT uq_entry_chest UNIQUE (entry_id, chest_no)
);
```

---

### 3.6 Matches & Standardized Scoresheet Table (Preserving Official PDF Format)
Reflecting fields from `scoresheet (1).pdf` and `New Scoresheet English.xlsx`:
```sql
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
    match_no VARCHAR(20) NOT NULL,
    court_no VARCHAR(20),
    match_type VARCHAR(50) DEFAULT 'LEAGUE',     -- LEAGUE or KNOCK OUT
    session VARCHAR(20) DEFAULT 'MORNING',       -- MORNING or EVENING
    date DATE NOT NULL,
    time VARCHAR(20),
    
    -- Teams
    team_a_district_id UUID REFERENCES districts(id) NOT NULL,
    team_b_district_id UUID REFERENCES districts(id) NOT NULL,
    toss_won_by UUID REFERENCES districts(id),
    choice VARCHAR(20),                          -- DEFENCE or CHASE
    
    -- Coaching & Support Staff
    team_a_manager VARCHAR(100),
    team_a_coach VARCHAR(100),
    team_a_support VARCHAR(100),
    team_b_manager VARCHAR(100),
    team_b_coach VARCHAR(100),
    team_b_support VARCHAR(100),
    
    -- Scoresheet Summary Points
    team_a_turn1_pts INT DEFAULT 0,
    team_a_turn2_pts INT DEFAULT 0,
    team_a_turn3_pts INT DEFAULT 0,
    team_a_turn4_pts INT DEFAULT 0,
    team_a_grand_total INT DEFAULT 0,
    
    team_b_turn1_pts INT DEFAULT 0,
    team_b_turn2_pts INT DEFAULT 0,
    team_b_turn3_pts INT DEFAULT 0,
    team_b_turn4_pts INT DEFAULT 0,
    team_b_grand_total INT DEFAULT 0,
    
    winner_district_id UUID REFERENCES districts(id),
    win_margin_details TEXT,                     -- e.g., 'Won by 4 points and an inning'
    remarks TEXT,
    
    -- Officials in Charge (from Scoresheet PDF footer)
    scorer_1_name VARCHAR(100),
    scorer_2_name VARCHAR(100),
    dugout_1_2_name VARCHAR(100),
    umpire_1_name VARCHAR(100),
    umpire_2_name VARCHAR(100),
    timekeeper_name VARCHAR(100),
    post_umpire_1_name VARCHAR(100),
    post_umpire_2_name VARCHAR(100),
    referee_name VARCHAR(100),
    
    -- Detailed Raw Action Log (Turns, Chasers, Defenders, Symbols S/P/L/D/O/T/W/B/SA/Y/F)
    scoresheet_matrix_data JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3.7 Tournament Results & Anti-Fixing 48-Hour Review Desk
```sql
CREATE TABLE competition_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Podium Allocations (Two Joint 3rd Positions for Semi-finalists)
    first_place_district_id UUID REFERENCES districts(id),
    second_place_district_id UUID REFERENCES districts(id),
    third_place_district_1_id UUID REFERENCES districts(id),
    third_place_district_2_id UUID REFERENCES districts(id),
    
    district_rankings_json JSONB DEFAULT '[]'::jsonb, -- 4th to 36th standings with points
    
    -- 48-Hour Anti-Fixing & Anti-Cheating Protocol
    status result_status DEFAULT 'UNDER_REVIEW_48H' NOT NULL,
    protest_logged BOOLEAN DEFAULT FALSE,
    protest_notes TEXT,
    disqualified_district_ids UUID[] DEFAULT ARRAY[]::UUID[],
    
    declared_at TIMESTAMPTZ,                     -- Exactly 48 hours post-tournament
    declared_by UUID,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3.8 Dynamic Certificate Signatories & Template Configuration
Reflecting `image (20).png` structure with dynamic replacement capabilities:
```sql
CREATE TABLE certificate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(100) NOT NULL,         -- e.g., '52nd Junior State Merit Certificate'
    background_image_url TEXT NOT NULL,          -- Official border and graphics canvas
    
    -- Dynamic Signatory 1 (President)
    signatory_1_name VARCHAR(150) NOT NULL,      -- e.g., 'Hon. Sunetra Pawar'
    signatory_1_title VARCHAR(100) NOT NULL,     -- 'Hon. President'
    signatory_1_signature_url TEXT NOT NULL,     -- PNG transparent signature stamp
    
    -- Dynamic Signatory 2 (General Secretary)
    signatory_2_name VARCHAR(150) NOT NULL,      -- e.g., 'Dr. Chandrajit Jadhav'
    signatory_2_title VARCHAR(100) NOT NULL,     -- 'General Secretary'
    signatory_2_signature_url TEXT NOT NULL,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_no VARCHAR(50) UNIQUE NOT NULL,  -- e.g., 'JR0001'
    competition_id UUID REFERENCES competitions(id) NOT NULL,
    player_id UUID REFERENCES players(id),       -- Nullable if awarded to Coach/Manager
    district_id UUID REFERENCES districts(id) NOT NULL,
    
    recipient_name VARCHAR(150) NOT NULL,
    father_name VARCHAR(150),
    dob DATE,
    role VARCHAR(50) DEFAULT 'Player',           -- 'Player', 'Coach', 'Manager'
    position VARCHAR(50) NOT NULL,               -- 'FIRST', 'SECOND', 'THIRD', 'PARTICIPATION'
    
    qr_code_hash VARCHAR(100) UNIQUE NOT NULL,   -- Resolved at /verify/cert/[certNo]
    template_id UUID REFERENCES certificate_templates(id),
    pdf_download_url TEXT,
    
    issued_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3.9 Change Requests & Notices Tables
```sql
CREATE TABLE change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_type VARCHAR(50) NOT NULL,           -- 'PLAYER_UPDATE', 'DISTRICT_PROFILE', 'DISTRICT_TRANSFER'
    target_id UUID NOT NULL,                     -- player_id or district_id
    requester_district_id UUID REFERENCES districts(id) NOT NULL,
    proposed_data JSONB NOT NULL,                -- Diff containing requested modifications
    status application_status DEFAULT 'PENDING' NOT NULL,
    rejection_reason TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(255) NOT NULL,
    attachment_path TEXT NOT NULL,
    uploaded_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. 36 Maharashtra Districts Initial Seeding Script (SQL)

```sql
INSERT INTO districts (code, name_en, name_mr, username) VALUES
('AHM', 'Ahmednagar', 'अहमदनगर', 'dist_ahmednagar'),
('AKO', 'Akola', 'अकोला', 'dist_akola'),
('AMR', 'Amravati', 'अमरावती', 'dist_amravati'),
('CHH', 'Chhatrapati Sambhajinagar', 'छत्रपती संभाजीनगर', 'dist_sambhajinagar'),
('BHD', 'Bhandara', 'भंडारा', 'dist_bhandara'),
('BID', 'Beed', 'बीड', 'dist_beed'),
('BUL', 'Buldhana', 'बुलढाणा', 'dist_buldhana'),
('CHA', 'Chandrapur', 'चंद्रपूर', 'dist_chandrapur'),
('DHU', 'Dhule', 'धुळे', 'dist_dhule'),
('GAD', 'Gadchiroli', 'गडचिरोली', 'dist_gadchiroli'),
('GON', 'Gondia', 'गोंदिया', 'dist_gondia'),
('HIN', 'Hingoli', 'हिंगोली', 'dist_hingoli'),
('JAL', 'Jalgaon', 'जळगाव', 'dist_jalgaon'),
('JLN', 'Jalna', 'जालना', 'dist_jalna'),
('KOL', 'Kolhapur', 'कोल्हापूर', 'dist_kolhapur'),
('LAT', 'Latur', 'लातूर', 'dist_latur'),
('MUM', 'Mumbai City', 'मुंबई शहर', 'dist_mumbai_city'),
('MSU', 'Mumbai Suburban', 'मुंबई उपनगर', 'dist_mumbai_suburban'),
('NAG', 'Nagpur', 'नागपूर', 'dist_nagpur'),
('NDD', 'Nanded', 'नांदेड', 'dist_nanded'),
('NDB', 'Nandurbar', 'नंदुरबार', 'dist_nandurbar'),
('NAS', 'Nashik', 'नाशिक', 'dist_nashik'),
('DHA', 'Dharashiv', 'धाराशिव', 'dist_dharashiv'),
('PAL', 'Palghar', 'पालघर', 'dist_palghar'),
('PAR', 'Parbhani', 'परभणी', 'dist_parbhani'),
('PUN', 'Pune', 'पुणे', 'dist_pune'),
('RAI', 'Raigad', 'रायगड', 'dist_raigad'),
('RAT', 'Ratnagiri', 'रत्नागिरी', 'dist_ratnagiri'),
('SAN', 'Sangli', 'सांगली', 'dist_sangli'),
('SAT', 'Satara', 'सातारा', 'dist_satara'),
('SIN', 'Sindhudurg', 'सिंधुदुर्ग', 'dist_sindhudurg'),
('SOL', 'Solapur', 'सोलापूर', 'dist_solapur'),
('THA', 'Thane', 'ठाणे', 'dist_thane'),
('WAR', 'Wardha', 'वर्धा', 'dist_wardha'),
('WAS', 'Washim', 'वाशिम', 'dist_washim'),
('YAV', 'Yavatmal', 'यवतमाळ', 'dist_yavatmal')
ON CONFLICT (code) DO NOTHING;
```

---

## 5. Storage Architecture & Row-Level Security (RLS)

### 5.1 Storage Buckets
1. **`player-documents` (Private):**
   - Stores: Photograph, Aadhaar, ID Proof, DOB Proof, Gazette attachment.
   - Access: Completely closed to the public. Read access granted exclusively via short-lived signed URLs generated on the server for Association Admins and the player's mapped District Admin.
2. **`association-assets` (Public Read):**
   - Stores: Notice Board PDFs, Certificate background vectors, and dynamic signature PNGs.

### 5.2 Row-Level Security (RLS) Policies
```sql
-- Enable RLS on core tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;

-- 1. Association Super Admin full access
CREATE POLICY association_all_access ON players
FOR ALL TO authenticated
USING (auth.jwt() ->> 'role' = 'ROLE_ASSOCIATION');

-- 2. District Admin read-only access to their assigned athletes
CREATE POLICY district_view_own_players ON players
FOR SELECT TO authenticated
USING (
    auth.jwt() ->> 'role' = 'ROLE_DISTRICT' 
    AND current_district_id = (auth.jwt() ->> 'district_id')::UUID
);

-- 3. District Admin squad submission prior to deadline lock
CREATE POLICY district_manage_squad ON competition_entries
FOR ALL TO authenticated
USING (
    auth.jwt() ->> 'role' = 'ROLE_DISTRICT'
    AND district_id = (auth.jwt() ->> 'district_id')::UUID
    AND is_locked = FALSE
);
```

---

## 6. Certificate & Scoresheet Dynamic Generation Flow

1. **Scoresheet Processing:**
   - Match official logs scores into the digital scoresheet grid matching `scoresheet (1).pdf`.
   - Grand totals and turn scores automatically calculated.
   - Match details saved to `matches`.
2. **48-Hour Result Cooling-Off:**
   - On tournament completion, preliminary winners marked as `UNDER_REVIEW_48H`.
   - Association reviews any match-fixing allegations, complaints, or rule breaches.
   - After 48 hours, results transitioned to `DECLARED` status.
3. **Dynamic Certificate Stamping:**
   - `pdf-lib` loads the active template from `certificate_templates`.
   - Dynamically renders recipient name, father name, DOB, district, and position.
   - Stamps current President and General Secretary signatures.
   - Injects verifiable QR code pointing to `/verify/cert/[certNo]`.

# Project Memory, Architectural Decision Ledger & Sprint Tracker (Memory.md)
## Project Name: Maharashtra Kho-Kho Association Official State Web Portal
**Version:** 1.0.0  
**Status:** Living Engineering Memory Document  
**Target Environment:** Antigravity IDE / Cursor / Claude Code  
**Associated Documentation Suite:** PRD.md, Rules.md, Architecture.md, Workflows.md, Design.md, Agents.md, Security_Checklist.md  

---

## 1. Architectural Decision Records (ADRs)

### ADR-001: Relational SQL (PostgreSQL) Over Graph / Document Databases
* **Context:** Evaluation of state-level data models with 36 pre-seeded districts, thousands of athletes, competition entries, dynamic scoresheet logs, and official certificates.
* **Decision:** Selected **Supabase (PostgreSQL 15+)** with strict foreign key constraints and Row-Level Security (RLS). Rejected graph databases (Graphify) as an unnecessary layer of operational complexity for fundamentally relational workflows.
* **Impact:** Clean entity integrity: `districts` -> `players` -> `competitions` -> `squad_members` -> `matches`.

---

### ADR-002: Zero-Login Architecture with Magic Re-Application Tokens
* **Context:** Public athletes submit a comprehensive 22-field registration with 5 document proofs. Creating persistent public login accounts would introduce substantial credential fatigue, password resets, and session overhead.
* **Decision:** Eliminate persistent player logins. If an application is rejected by the Association, the applicant receives an automated email featuring the exact rejection reason and a secure, time-limited magic re-application link (`/reapply/[token]`).
* **Impact:** Pre-fills the athlete's previously submitted data, highlights the flagged document or field, and avoids requiring the applicant to fill out 22 fields from scratch.

---

### ADR-003: Partial Unique Index Strategy for Re-Application Unblocking
* **Context:** If a hard `UNIQUE` constraint is placed across all Aadhaar, mobile, and email columns, a rejected applicant cannot re-apply using their legitimate government identity without manual database deletion by an administrator.
* **Decision:** Implement **PostgreSQL Partial Unique Indexes**:
  ```sql
  CREATE UNIQUE INDEX idx_players_active_aadhar ON players (aadhar_no) WHERE status IN ('PENDING', 'APPROVED');
  CREATE UNIQUE INDEX idx_players_active_mobile ON players (mobile_no) WHERE status IN ('PENDING', 'APPROVED');
  CREATE UNIQUE INDEX idx_players_active_email ON players (email) WHERE status IN ('PENDING', 'APPROVED');
  ```
* **Impact:** When an application transitions to `REJECTED`, the record remains in the database for state audit trails, but ceases to block re-application with the same credentials.

---

### ADR-004: Dual Cutoff Architecture (Anti-Age Manipulation / Politics Guard)
* **Context:** In state-level tournament sports, eligibility rules are frequently contested when static calendar years or academic years are used, creating administrative disputes.
* **Decision:**
  1. **Master Association Cutoff Date:** Configured centrally in Association settings to determine display `SECTION` tags (`Sub Junior`, `Junior`, `Senior`).
  2. **Tournament-Specific Cutoff Date (`dob_limit`):** Set during competition announcement. Player eligibility is dynamically evaluated against this exact date:
     $$	ext{Age at Tournament} = 	ext{DateDifference}(	ext{Player DOB}, 	ext{Tournament Cutoff Date})$$
* **Impact:** Completely eliminates subjective manipulation; ineligible athletes are automatically disabled during district squad creation.

---

### ADR-005: Representation Independence (Residential vs Playing District)
* **Context:** Athletes frequently reside in one district (e.g., Mumbai City) but represent a neighboring district association (e.g., Thane).
* **Decision:** Separate Field 13 (`residential_district_id`) from Field 18 (`playing_district_id`). The player represents and is administered strictly by `playing_district_id`.
* **Impact:** Full compliance with Maharashtra sports governance bylaws allowing inter-district athletic representation.

---

### ADR-006: Strict 12–15 Player Squad Lock & Immutable Server-Side Clock
* **Context:** Districts submit tournament squads that must not be altered post-deadline through local client time changes or unauthorized API calls.
* **Decision:** Squad size bounded between 12 and 15 players. Server Actions evaluate submission timestamps strictly against PostgreSQL `NOW()`. At `23:59:59 IST` on `last_date_to_participate`, write access for District Admins is locked. Post-deadline changes require Association Super Admin emergency override with an immutable audit log.
* **Impact:** Prevents match tampering and last-minute unauthorized roster substitutions.

---

### ADR-007: Digital Twin Scoresheet Standard Preservation
* **Context:** Need to preserve official field scoring practices from `scoresheet (1).pdf` and `New Scoresheet English.xlsx`.
* **Decision:** Retain the exact paper scoresheet matrix: 15 players per team (9 playing + 6 substitutes), chest numbers 1–15, turns I–IV, symbol chips (`S`, `P`, `L`, `D`, `O`, `T`, `W`, `B`, `SA`, `Y`, `F`), turn scores, victory margins, and bench official signatures (Scorers 1 & 2, Umpires 1 & 2, Dugout, Timekeeper, Post Umpires, Referee).
* **Impact:** Zero learning curve for on-ground association scorers translating physical scoresheets into the state portal.

---

### ADR-008: 48-Hour Anti-Fixing Result Cooling-Off Window
* **Context:** Matches may conclude with disputes, cheating allegations, or ineligible player protests that arise post-game.
* **Decision:** Competition results enter `UNDER_REVIEW_48H` status upon tournament conclusion. Standings (1st, 2nd, two joint 3rd positions, and 4th+ district rankings) remain provisional for exactly 48 hours before the Association Super Admin executes final declaration.
* **Impact:** Provides legal review protection to disqualify offending teams prior to issuing unalterable certificates.

---

### ADR-009: Dynamic Signatory Certificates & QR Authenticity Verification
* **Context:** Association executives (President, General Secretary) change periodically. Hardcoding signatories into PDF templates would break historical records or require developer intervention on leadership turnover.
* **Decision:** Store active signatories, titles, and signature transparent PNGs in `certificate_templates`. The `pdf-lib` engine dynamically stamps the active signatures and generates a tamper-proof QR code linking to `/verify/cert/[certNo]`.
* **Impact:** Real-time leadership updates and instant public/official credential verification.

---

### ADR-010: Material You (MD3) Design Language
* **Context:** UI design selection between generic dashboard kits and dignified state athletic branding.
* **Decision:** Implemented **Material You (Material Design 3)** with Purple/Violet Seed (`#6750A4`), warm tonal surfaces (`#FFFBFE` Canvas, `#F3EDF7` Container), pill-shaped buttons (`rounded-full`), MD3 filled inputs, and `Mukta`/`Noto Sans Devanagari` typography with `leading-relaxed` line-height for Marathi.
* **Impact:** Modern, accessible, mobile-first touch ergonomics tailored for state sporting authorities.

---

## 2. Antigravity IDE Sprint Roadmap & Implementation Phases

```
  [Phase 1] ──► [Phase 2] ──► [Phase 3] ──► [Phase 4] ──► [Phase 5] ──► [Phase 6]
  Scaffolding   Public Forms  Association   District      Competitions  PDF & Excel
  & DB Schema   & Magic Link  Adjudication  Workspace     & Scoresheet  Engines
```

### Phase 1: Foundation & Data Layer (Day 1)
- [ ] Initialize Next.js 15+ App Router TypeScript project with Tailwind CSS & shadcn/ui.
- [ ] Execute `Architecture.md` PostgreSQL schema migration on Supabase:
  - Custom Enums (`user_role`, `application_status`, `result_status`, etc.).
  - 36 Maharashtra Districts pre-seeding catalog script.
  - Partial Unique Indexes for `players` and `referees`.
  - Row Level Security (RLS) policies.
- [ ] Configure Supabase Storage buckets: `player-documents` (private) and `association-assets` (public read).
- [ ] Setup environment variables and client/server Supabase utilities.

### Phase 2: Public Registration & Zero-Login Workflows (Day 2)
- [ ] Build bilingual 22-field Player Registration Form (`/register/player`):
  - Sectioned card layout with MD3 filled text fields and pill CTA.
  - Client-side image compression for 5 mandatory document proofs.
  - Zod validation schema matching dual mobile/email confirmations.
- [ ] Implement Referee Accreditation Form (`/register/referee`).
- [ ] Build Magic Re-Application Route (`/reapply/[token]`):
  - Pre-fills previous data, highlights rejection remarks, and handles atomic resubmission.

### Phase 3: Association Adjudication & District Management (Day 3)
- [ ] Implement Association Authentication & Layout (`/association/*`):
  - Tonal app bar, navigation drawer, and real-time KPI metrics dashboard.
- [ ] Build Player Review & Approval Drawer:
  - Side-by-side view of 22 fields and 5 uploaded document proofs (via signed URLs).
  - Atomic State Number RPC trigger (`MH-KK-YYYY-XXXX`).
  - Rejection modal with mandatory remark and transactional email dispatch.
- [ ] Build 36 District Management Desk:
  - District registry table, profile update review, and master password reset.
- [ ] Notice Board module (circular file upload, list, download, delete).

### Phase 4: District Portal & Squad Selection (Day 4)
- [ ] Implement District Portal Layout (`/district/*`):
  - RLS-guarded access showing only district-specific athletes.
- [ ] Active Roster Directory & Athlete Profile Update Request submission.
- [ ] Inter-District Player Transfer initiation module.
- [ ] Competition Entry Interface:
  - Multi-select 12 to 15 eligible players.
  - Dynamic `dob_limit` validation filter.
  - Automatic deadline lock enforcement (`last_date_to_participate`).

### Phase 5: Tournaments, Digital Scoresheet & 48-Hour Results (Day 5)
- [ ] Tournament Announcement Module with custom `dob_limit` setting.
- [ ] Digital Scoresheet Interface (`/association/competitions/[id]/scoresheet`):
  - 15-player side-by-side roster layout matching `scoresheet (1).pdf`.
  - Action symbol chips (`S`, `P`, `L`, `D`, `O`, `T`, etc.).
  - Automatic turn points, victory margin calculations, and bench official records.
- [ ] 48-Hour Result Adjudication Desk:
  - Podiums: 1st, 2nd, two joint 3rd positions, and 4th–36th rankings.
  - `UNDER_REVIEW_48H` cooling-off timer and final `DECLARED` status trigger.

### Phase 6: Document Engines, Security Audits & Deployment (Day 6)
- [ ] Build Dynamic Certificate Generation Engine with `pdf-lib`:
  - Overlay recipient details on master graphic background.
  - Dynamic President and General Secretary signature stamp injection.
  - Verifiable QR code generation pointing to `/verify/cert/[certNo]`.
- [ ] Implement Excel Export Engine via `ExcelJS`:
  - District-wise and State-wide exports with secure server attachment endpoints.
- [ ] Run `Security_Checklist.md` verification audit (Aadhaar masking, RLS check, signed URLs).
- [ ] Production deployment to Vercel and domain DNS configuration (SPF, DKIM, DMARC).

---

## 3. Documentation Suite Cross-Reference

| Document | Primary Role & Scope |
| :--- | :--- |
| **`PRD.md`** | Core functional scope, 36 districts, bilingual form fields, and module specifications. |
| **`Rules.md`** | Business constraints, age politics, cutoff logic, squad bounds, and State No. formats. |
| **`Architecture.md`** | Technical architecture, Next.js route tree, Supabase PostgreSQL schema, and RLS policies. |
| **`Workflows.md`** | 9 state-machine lifecycles, zero-login re-application flows, and transactional email triggers. |
| **`Design.md`** | Material You (MD3) tokens, pill buttons, filled inputs, scoresheet grid, and certificate layouts. |
| **`Agents.md`** | Antigravity IDE agent personas, Ponytail brevity rules, and copy-paste prompts. |
| **`Security_Checklist.md`** | Sensitive ID protection, storage isolation, RLS audits, and anti-tampering guards. |
| **`Memory.md`** | Architectural decision ledger, ADRs, changelog, and phase-by-phase sprint checklist. |

# Security Audit & Vulnerability Assessment Report
## Project: Maharashtra Kho-Kho Association (MKKA) Official Digital State Web Portal
**Date of Audit:** October 30, 2026  
**Audited Target:** `Maharashtra Kho - Kho Association Project` (Next.js 16 + React 19 + Supabase SSR)  
**Classification:** Confidential — For MKKA Engineering & State Executive Council  
**Compliance Frameworks:** OWASP Top 10:2021, Indian Digital Personal Data Protection (DPDP) Act 2023, Aadhaar Act Data Security Regulations  

---

## Executive Summary

A comprehensive source-code security audit and architectural vulnerability assessment was conducted on the Maharashtra Kho-Kho Association (MKKA) official web portal. The application is a statewide multi-tenant platform managing athlete registrations, tournament squad submissions, 36 district association logins, referee grading, and state administrative scrutiny.

While the application features positive defenses (such as client-side and server-side file size restrictions on registration uploads, clean TypeScript type validations, and security response headers like `X-Frame-Options` and `X-Content-Type-Options`), rapid iterative development introduced **critical authorization omissions, broken cryptographic assumptions, plaintext credential storage, and multi-tenant isolation breaches**.

### Key Vulnerability Statistics

| Severity Level | Count | Immediate Action Required |
| :--- | :---: | :--- |
| **CRITICAL** | **5** | Immediate patch deployment within 24-48 hours |
| **HIGH** | **5** | Remediate prior to official statewide rollout |
| **MEDIUM** | **5** | Fix during scheduled hardening sprints |
| **LOW / INFORMATIONAL** | **1** | Architecture & defense-in-depth enhancement |
| **TOTAL FINDINGS** | **16** | |

---

## Vulnerability Summary Matrix

| ID | Title | Severity | OWASP Top 10 | Primary Impacted File(s) |
| :--- | :--- | :---: | :--- | :--- |
| **SEC-01** | Missing Authentication & Authorization in Player Scrutiny Server Actions | **CRITICAL** | A01: Broken Access Control | `web/src/app/actions/admin-approvals.ts` |
| **SEC-02** | Complete Admin Auth Bypass via Forged `Referer` Header in PII Data Export | **CRITICAL** | A01: Broken Access Control | `web/src/app/api/export/players/route.ts` |
| **SEC-03** | Plaintext Password Storage & Credential Leakage to Client Components | **CRITICAL** | A02: Cryptographic Failures | `web/src/app/actions/association-districts.ts`<br>`web/src/app/association/districts/page.tsx` |
| **SEC-04** | Broken Multi-Tenant Isolation via Unsigned Client Cookie Tampering | **CRITICAL** | A01: Broken Access Control | `web/src/app/actions/district-auth.ts`<br>`web/src/app/actions/district-squad.ts`<br>`web/src/app/district/players/page.tsx` |
| **SEC-05** | Unauthenticated Tournament Squad Submission & Roster Overwrite | **CRITICAL** | A01: Broken Access Control | `web/src/app/actions/squad-actions.ts`<br>`web/src/app/tournaments/[id]/squad-entry/page.tsx` |
| **SEC-06** | Full PII & Aadhaar Leakage and PostgREST Filter Parameter Injection | **HIGH** | A01 / A03: Injection & Data Exposure | `web/src/app/api/track-player/route.ts` |
| **SEC-07** | Unvalidated Open Redirect in Document Viewer | **HIGH** | A01: Broken Access Control | `web/src/app/api/view-document/route.ts` |
| **SEC-08** | Unauthenticated Signed URL Generation for Sensitive Identity Documents | **HIGH** | A01: Broken Access Control | `web/src/app/api/view-document/route.ts` |
| **SEC-09** | Unauthenticated Match Fixture Creation & Live Score Manipulation | **HIGH** | A01: Broken Access Control | `web/src/app/actions/match-actions.ts` |
| **SEC-10** | Flawed Admin Session Validation (Truthy Cookie Name Check) | **HIGH** | A07: Identification & Auth Failures | `web/src/app/actions/association-districts.ts`<br>`web/src/app/actions/tournament-actions.ts` |
| **SEC-11** | Unauthenticated Batch Player Record Insertion with Synthetic Aadhaar | **MEDIUM** | A04: Insecure Design | `web/src/app/actions/register-player.ts` |
| **SEC-12** | Arbitrary File Upload via Missing MIME & Extension Whitelist in Notices | **MEDIUM** | A05: Security Misconfiguration | `web/src/app/actions/association-notices.ts` |
| **SEC-13** | Unthrottled AI OCR Endpoint Leading to API Bill Exhaustion & DoS | **MEDIUM** | A04: Insecure Design | `web/src/app/api/scan-roster/route.ts` |
| **SEC-14** | Hardcoded Fallback Credentials & Predictable Static Tokens | **MEDIUM** | A07: Identification & Auth Failures | `web/src/app/api/association/auth/route.ts`<br>`web/src/middleware.ts` |
| **SEC-15** | Ignored Security PIN Verification in Competition Deletion | **MEDIUM** | A01: Broken Access Control | `web/src/app/actions/tournament-actions.ts` |
| **SEC-16** | Ubiquitous Service Role Key Usage Overriding Database RLS | **LOW / INFO** | A01: Defense-in-Depth Failure | Project-wide Server Actions & APIs |

---

## Detailed Vulnerability Analysis

### SEC-01: Missing Authentication & Authorization in Player Scrutiny Server Actions
- **Severity:** CRITICAL (CVSS: 9.8)
- **OWASP Category:** A01:2021 – Broken Access Control
- **Impacted Files:** `web/src/app/actions/admin-approvals.ts` (Lines 6–74, 76–99)
- **Description:**  
  The server actions `approvePlayerAction(playerId: string)` and `rejectPlayerAction(playerId: string)` are exported directly from a `'use server'` module. In Next.js App Router, all exported server actions become publicly addressable HTTP POST endpoints callable by any client. Neither function verifies whether the incoming request possesses an active administrator session before performing state mutations in Supabase.
- **Impact:**  
  Any unauthenticated external actor can invoke `approvePlayerAction` with arbitrary player UUIDs, falsely granting state approval, assigning state registration numbers (`state_no`), and elevating unauthorized players into official eligibility registries. Conversely, an attacker can invoke `rejectPlayerAction` to disenfranchise legitimate athletes.
- **Remediation:**  
  Enforce strict, server-side session authentication at the top of both actions:
  ```ts
  const isAuthorized = await verifyAdminSession();
  if (!isAuthorized) {
      return { success: false, error: 'अनधिकृत प्रवेश! प्रशासक लॉगिन आवश्यक आहे.' };
  }
  ```

---

### SEC-02: Complete Admin Auth Bypass via Forged `Referer` Header in PII Data Export
- **Severity:** CRITICAL (CVSS: 9.1)
- **OWASP Category:** A01:2021 – Broken Access Control
- **Impacted File:** `web/src/app/api/export/players/route.ts` (Lines 35–43)
- **Description:**  
  The endpoint `/api/export/players` validates authorization using the following logic:
  ```ts
  const referer = request.headers.get("referer") || "";
  const isFromAssociationPortal = referer.includes("/association/");

  if (!hasAdminSession && !isFromAssociationPortal) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  ```
  HTTP request headers—including `Referer`—are entirely client-controlled. An attacker can set `Referer: https://example.com/association/` or `Referer: /association/` to satisfy `isFromAssociationPortal === true`, causing the entire condition to evaluate to `false`.
- **Impact:**  
  Complete, unauthenticated exfiltration of the entire statewide player registry in Excel format (`.xlsx`), leaking thousands of records containing athlete full names, Aadhaar numbers, dates of birth, mobile numbers, parent names, residential addresses, and document file keys, violating the Indian DPDP Act 2023.
- **Remediation:**  
  Completely eliminate reliance on `Referer` for security gating. Enforce valid, cryptographically authenticated session validation:
  ```ts
  if (!hasAdminSession) {
      return NextResponse.json({ error: "प्रशासकीय सत्र अवैध आहे." }, { status: 401 });
  }
  ```

---

### SEC-03: Plaintext Password Storage & Credential Leakage to Client Components
- **Severity:** CRITICAL (CVSS: 9.3)
- **OWASP Category:** A02:2021 – Cryptographic Failures
- **Impacted Files:**  
  - `web/src/app/actions/association-districts.ts` (Lines 50–54)
  - `web/src/app/association/districts/page.tsx` (Lines 27–47)
- **Description:**  
  1. In `updateDistrictDetailsAction`, newly assigned district passwords are written directly to PostgreSQL columns `password` and `password_hash` as unhashed, plaintext strings (`updatePayload.password = cleanPass`).
  2. In `web/src/app/association/districts/page.tsx`, the server component executes `supabase.from("districts").select("*")` and passes the complete row objects down to `<DistrictsManagerClient initialDistricts={districtsWithCounts} />`.
- **Impact:**  
  - District passwords stored in the database are readable in cleartext by anyone with database viewer access.
  - Every time an administrator accesses the 36 District Management page, all 36 districts' plaintext passwords are serialized directly into the Next.js HTML response payload (`__NEXT_DATA__` / React Server Component payload), readable via browser Developer Tools.
- **Remediation:**  
  1. Hash passwords using `bcrypt` or `argon2` before writing to the database:
     ```ts
     import bcrypt from "bcryptjs";
     const hashedPassword = await bcrypt.hash(cleanPass, 12);
     updatePayload.password_hash = hashedPassword;
     ```
  2. Restrict the database select query in `AssociationDistrictsPage` to omit credential columns:
     ```ts
     supabase.from("districts").select("id, code, name_en, name_mr, contact_person, mobile, email, username")
     ```

---

### SEC-04: Broken Multi-Tenant Isolation via Unsigned Client Cookie Tampering
- **Severity:** CRITICAL (CVSS: 9.1)
- **OWASP Category:** A01:2021 – Broken Access Control
- **Impacted Files:**  
  - `web/src/app/actions/district-auth.ts` (Lines 38–54)
  - `web/src/app/actions/district-squad.ts` (Lines 7–16)
  - `web/src/app/district/players/page.tsx` (Lines 11–34)
  - `web/src/app/district/certificates/page.tsx` (Lines 11–34)
- **Description:**  
  Upon district login, `loginDistrictAction` stores a raw JSON payload directly in the `mkka_district_session` cookie:
  ```ts
  const sessionData = { districtId: district.id, code: district.code, ... };
  cookieStore.set("mkka_district_session", JSON.stringify(sessionData), { ... });
  ```
  This cookie is **not cryptographically signed** with HMAC or a secret key. In subsequent requests, server components and actions parse `session = JSON.parse(sessionCookie.value)` and query Supabase using `session.districtId` with the `SUPABASE_SERVICE_ROLE_KEY`.
- **Impact:**  
  Any district user or attacker can edit their cookie value in browser storage to contain any other district's UUID. This completely breaks tenant isolation: Thane can access Mumbai City's player directory, alter Kolhapur's submitted championship rosters, and print official eligibility certificates on behalf of Pune.
- **Remediation:**  
  Use a cryptographically signed cookie session (e.g. Iron Session, sealed JWT via `jose`, or server-side session IDs stored in a `sessions` table). Verify the signature and tenant claims on every server invocation.

---

### SEC-05: Unauthenticated Tournament Squad Submission & Roster Overwrite
- **Severity:** CRITICAL (CVSS: 9.3)
- **OWASP Category:** A01:2021 – Broken Access Control
- **Impacted Files:**  
  - `web/src/app/actions/squad-actions.ts` (Lines 220–308, 310–380)
  - `web/src/app/tournaments/[id]/squad-entry/page.tsx`
- **Description:**  
  The server action `submitTournamentSquadAction(payload)` accepts an arbitrary `districtId`, `tournamentId`, and `players` array. The action performs zero caller authentication checks. Furthermore, the route `/tournaments/[id]/squad-entry` is public, exposing a district dropdown allowing any anonymous visitor to select any district, view their eligible players, and invoke `submitTournamentSquadAction`.
- **Impact:**  
  Malicious actors can overwrite official championship team entries, replace captains/vice-captains, alter designated coaches and managers, and disrupt tournament scheduling without authentication.
- **Remediation:**  
  1. Remove public squad selection from `/tournaments/[id]/squad-entry` or restrict it to authenticated district users only.
  2. Enforce verified district session checks in `submitTournamentSquadAction` and ensure the submitted `districtId` strictly matches the verified session district.

---

### SEC-06: Full PII & Aadhaar Leakage and PostgREST Filter Parameter Injection
- **Severity:** HIGH (CVSS: 8.6)
- **OWASP Category:** A01 / A03 – Sensitive Data Exposure & Injection
- **Impacted File:** `web/src/app/api/track-player/route.ts` (Lines 18–54)
- **Description:**  
  1. **Sensitive PII Exposure:** The endpoint `/api/track-player?query=...` executes `select("*")` on the `players` table using the service role key and returns the full JSON object to unauthenticated clients. This leaks full 12-digit Aadhaar numbers, residential street addresses, parent names, email addresses, phone numbers, and storage document paths.
  2. **PostgREST Filter Injection:** Line 50 contains:
     ```ts
     .or(`player_id_number.ilike.%${rawQuery}%,mobile_no.ilike.%${rawQuery}%`)
     ```
     `rawQuery` is directly interpolated into the PostgREST syntax without sanitizing commas, quotes, or operator tokens.
- **Impact:**  
  Mass harvest of athletes' personal and government identification data, identity theft, and potential database query manipulation.
- **Remediation:**  
  1. Restrict the select clause to non-sensitive fields only, explicitly masking or omitting Aadhaar numbers and addresses.
  2. Sanitize `rawQuery` using alphanumeric regex (`/^[a-zA-Z0-9_-]+$/`) before interpolation, or use parameterized `.ilike()` calls.

---

### SEC-07: Unvalidated Open Redirect in Document Viewer
- **Severity:** HIGH (CVSS: 7.4)
- **OWASP Category:** A01:2021 – Broken Access Control
- **Impacted File:** `web/src/app/api/view-document/route.ts` (Lines 26–28)
- **Description:**  
  The document viewer route contains the following check:
  ```ts
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      return NextResponse.redirect(rawPath);
  }
  ```
  The endpoint accepts arbitrary external URLs in the `path` query parameter and immediately redirects the user without hostname or allowlist verification.
- **Impact:**  
  Attackers can distribute official links like `https://mkka.org/api/view-document?path=https://phishing-site.com/login` to deceive athletes or district officials into phishing attacks and credential theft.
- **Remediation:**  
  Reject external URLs completely or restrict redirects to verified Supabase Storage domains:
  ```ts
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      const allowedHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname;
      const targetHost = new URL(rawPath).hostname;
      if (targetHost !== allowedHost) {
          return NextResponse.json({ error: "Invalid target URL" }, { status: 400 });
      }
      return NextResponse.redirect(rawPath);
  }
  ```

---

### SEC-08: Unauthenticated Signed URL Generation for Sensitive Identity Documents
- **Severity:** HIGH (CVSS: 7.5)
- **OWASP Category:** A01:2021 – Broken Access Control
- **Impacted File:** `web/src/app/api/view-document/route.ts` (Lines 9–17, 47–66)
- **Description:**  
  In `/api/view-document/route.ts`, the variable `hasAdminSession` is computed on lines 10–16, but **no conditional check is performed on it**. The handler proceeds directly to generate 15-minute signed URLs using `SUPABASE_SERVICE_ROLE_KEY` for any file path provided in `?path=`.
- **Impact:**  
  Any unauthenticated user who discovers or guesses a file path (such as `dob_<uuid>.pdf` or `address_<uuid>.jpg`) can generate a valid signed URL and download sensitive government identity proofs and birth certificates directly from Supabase Storage.
- **Remediation:**  
  Require authentication before issuing signed URLs for private athlete documents, or verify that the requesting user has legitimate access to the document.

---

### SEC-09: Unauthenticated Match Fixture Creation & Live Score Manipulation
- **Severity:** HIGH (CVSS: 7.3)
- **OWASP Category:** A01:2021 – Broken Access Control
- **Impacted File:** `web/src/app/actions/match-actions.ts` (Lines 38–74, 115–156)
- **Description:**  
  Server actions `createMatchFixtureAction` and `updateMatchScoreAction` execute database mutations against `tournament_matches` and `match_score_logs` with zero session or caller authorization checks.
- **Impact:**  
  Anyone can manipulate official match scores, alter winners, schedule arbitrary matches, and falsify tournament standings for state championships.
- **Remediation:**  
  Enforce session validation requiring official scorer or administrator privileges:
  ```ts
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Scorer or Admin session required' };
  }
  ```

---

### SEC-10: Flawed Admin Session Validation (Truthy Cookie Name Check)
- **Severity:** HIGH (CVSS: 7.5)
- **OWASP Category:** A07:2021 – Identification and Authentication Failures
- **Impacted Files:**  
  - `web/src/app/actions/association-districts.ts` (Lines 7–17)
  - `web/src/app/actions/association-notices.ts` (Lines 7–17)
  - `web/src/app/actions/association-players.ts` (Lines 7–16)
  - `web/src/app/actions/tournament-actions.ts` (Lines 9–16)
- **Description:**  
  In several action files, `verifyAdminSession()` is implemented as:
  ```ts
  const session = cookieStore.get("mkka_admin_auth")?.value ||
                  cookieStore.get("admin_session")?.value;
  return !!session;
  ```
  And in `tournament-actions.ts`:
  ```ts
  return authCookie === 'authenticated_mkka_admin_2026' || !!authCookie;
  ```
  The expression `!!session` evaluates to `true` if *any* cookie with that name exists, regardless of its value (e.g. `admin_session=false`, `admin_session=guest`, or `admin_session=0`).
- **Impact:**  
  Trivial bypass of administrative session validation by setting arbitrary cookie values.
- **Remediation:**  
  Centralize session verification into a single utility in `web/src/lib/auth/session.ts` and validate against a cryptographically signed secret or session store.

---

### SEC-11: Unauthenticated Batch Player Record Insertion with Synthetic Aadhaar
- **Severity:** MEDIUM (CVSS: 5.3)
- **OWASP Category:** A04:2021 – Insecure Design
- **Impacted File:** `web/src/app/actions/register-player.ts` (Lines 208–258)
- **Description:**  
  `batchRegisterScannedPlayersAction` inserts batches of player records directly into the database. It contains no authentication checks, and if Aadhaar numbers are absent from the payload, it synthesizes synthetic Aadhaar numbers:
  ```ts
  aadhar_no: p.aadhar_no || `2026${Math.floor(10000000 + Math.random() * 90000000)}`
  ```
- **Impact:**  
  Unauthenticated flooding of the database with synthetic records and fictitious government identifiers, polluting the state registry.
- **Remediation:**  
  Restrict `batchRegisterScannedPlayersAction` exclusively to authenticated district or association sessions. Require valid, actual applicant identifiers.

---

### SEC-12: Arbitrary File Upload via Missing MIME & Extension Whitelist in Notices
- **Severity:** MEDIUM (CVSS: 6.5)
- **OWASP Category:** A05:2021 – Security Misconfiguration
- **Impacted File:** `web/src/app/actions/association-notices.ts` (Lines 42–56)
- **Description:**  
  `uploadNoticeAction` extracts the extension using `file.name.split(".").pop()` and directly saves the file to Supabase storage without checking against an allowlist of permitted MIME types or extensions.
- **Impact:**  
  Upload of potentially dangerous files (`.html`, `.svg`, executable scripts) to storage, creating risks of stored Cross-Site Scripting (XSS) when rendered by users.
- **Remediation:**  
  Apply the shared validation helper `validateUploadedFile` from `web/src/lib/validations/file-upload.ts` to restrict notice uploads strictly to `application/pdf` and `image/jpeg`.

---

### SEC-13: Unthrottled AI OCR Endpoint Leading to API Bill Exhaustion & DoS
- **Severity:** MEDIUM (CVSS: 5.3)
- **OWASP Category:** A04:2021 – Insecure Design
- **Impacted File:** `web/src/app/api/scan-roster/route.ts` (Lines 3–90)
- **Description:**  
  The endpoint `/api/scan-roster` accepts base64 file payloads and invokes Google's Gemini 2.5 Flash API directly. There is no IP-based rate limiting, request throttling, or user authentication.
- **Impact:**  
  Scripted floods of requests can deplete the association's Google Gemini API credits or quota, causing financial loss or service disruption for legitimate roster scanning.
- **Remediation:**  
  Implement token-bucket rate limiting (via Upstash Redis or memory store) and require a valid district or administrator session.

---

### SEC-14: Hardcoded Fallback Credentials & Predictable Static Tokens
- **Severity:** MEDIUM (CVSS: 6.5)
- **OWASP Category:** A07:2021 – Identification and Authentication Failures
- **Impacted Files:**  
  - `web/src/app/api/association/auth/route.ts` (Line 9, Line 26)
  - `web/src/middleware.ts` (Line 12)
  - `web/src/app/actions/district-auth.ts` (Line 32)
- **Description:**  
  - Fallback admin PIN: `process.env.ADMIN_PIN || "MKKA2026"`
  - Default district password: `district.password || "mkka@123"`
  - Static admin session cookie value: `"authenticated_mkka_admin_2026"`
- **Impact:**  
  If environment variables are omitted or misconfigured, systems fall back to well-known default credentials. Static token values allow attackers to craft cookies without ever authenticating.
- **Remediation:**  
  1. Refuse application startup if `ADMIN_PIN` or `SESSION_SECRET` is unset in production.
  2. Transition from static cookie values to signed, expiring JWTs or random server-side session tokens.

---

### SEC-15: Ignored Security PIN Verification in Competition Deletion
- **Severity:** MEDIUM (CVSS: 5.8)
- **OWASP Category:** A01:2021 – Broken Access Control
- **Impacted File:** `web/src/app/actions/tournament-actions.ts` (Lines 247–266)
- **Description:**  
  `deleteTournamentAction` receives `payload.adminPin`, but never compares it against `process.env.ADMIN_PIN`. The only confirmation performed is matching `payload.confirmName === payload.expectedName`.
- **Impact:**  
  The advertised "two-layer PIN confirmation defense" is ineffective.
- **Remediation:**  
  Verify `payload.adminPin === (process.env.ADMIN_PIN || "")` before allowing tournament deletion.

---

### SEC-16: Ubiquitous Service Role Key Usage Overriding Database RLS
- **Severity:** INFORMATIONAL / DEFENSE-IN-DEPTH
- **Impacted Files:** Project-wide
- **Description:**  
  Server components and actions frequently instantiate `createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)` rather than user-scoped clients (`createServerSupabase()`). This bypasses all Supabase Row Level Security (RLS) policies by design.
- **Impact:**  
  Whenever an application-level authorization check is omitted or flawed, the database provides zero secondary defense.
- **Remediation:**  
  Use `createServerSupabase()` as the default client, and reserve `SUPABASE_SERVICE_ROLE_KEY` strictly for background worker jobs or explicit administrative maintenance actions.

---

## Remediation Roadmap & Action Plan

```
[Phase 1: Immediate Triage (Next 24-48 Hours)]
 ├── Patch SEC-01: Add verifyAdminSession() to approvePlayerAction & rejectPlayerAction
 ├── Patch SEC-02: Remove referer check from /api/export/players
 ├── Patch SEC-03: Strip password/password_hash from AssociationDistrictsPage select query
 ├── Patch SEC-05: Require session verification in submitTournamentSquadAction
 └── Patch SEC-07: Remove open redirect in /api/view-document

[Phase 2: Authentication & Multi-Tenancy Hardening (Week 1)]
 ├── Patch SEC-04: Replace unsigned JSON district cookies with signed JWT/Iron-Session
 ├── Patch SEC-03: Implement bcrypt hashing for district password updates & logins
 ├── Patch SEC-09: Add authorization guards to createMatchFixtureAction & updateMatchScoreAction
 ├── Patch SEC-10: Fix verifyAdminSession() logic across all actions
 └── Patch SEC-06: Mask Aadhaar & PII in /api/track-player and sanitize query inputs

[Phase 3: Privacy, Rate Limiting & Architecture (Week 2)]
 ├── Patch SEC-08: Add session gate to /api/view-document for private identity proofs
 ├── Patch SEC-12: Enforce strict file extension/MIME validation on notices
 ├── Patch SEC-13: Add rate limiting to /api/scan-roster
 ├── Patch SEC-15: Verify adminPin in deleteTournamentAction
 └── Patch SEC-16: Audit Supabase RLS policies and transition to user-scoped clients
```

---

## Conclusion

The Maharashtra Kho-Kho Association portal possesses a robust UI and sports management feature set. However, securing athlete PII (specifically Aadhaar records) and guaranteeing championship competitive integrity requires immediate execution of the Phase 1 and Phase 2 remediation tasks outlined above. Implementing signed sessions, bcrypt password hashing, and strict action-level authorization guards will bring the platform into full compliance with modern web security standards and the Indian DPDP Act 2023.

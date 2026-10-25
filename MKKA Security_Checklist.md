# Security, Privacy & Integrity Checklist (Security_Checklist.md)
## Project Name: Maharashtra Kho-Kho Association Official State Web Portal
**Version:** 1.0.0  
**Status:** Approved Security Specification  
**Compliance Targets:** Indian Digital Personal Data Protection (DPDP) Act, Role-Based Access Control (RBAC), Sports Integrity Standards  

---

## 1. Identity Protection & Sensitive Data Governance

### 1.1 Government Identifier (Aadhaar) Hardening
- [ ] **Strict Masking in UI & Logs:** Full 12-digit Aadhaar numbers must NEVER be rendered in public views, client console logs, or exported error traces. UI masks values displaying only the last 4 digits (e.g., `XXXX-XXXX-1234`).
- [ ] **Encryption at Rest:** Sensitive identifiers and personal details stored in PostgreSQL must utilize Supabase Vault / pgcrypto transparent column encryption where required.
- [ ] **Zero-Disclosure Principle in API:** API responses returning player data to District Admins must never serialize raw government identification proofs to unauthenticated clients.
- [ ] **Partial Unique Index Guard:** Validate that partial unique indexes (`WHERE status IN ('PENDING', 'APPROVED')`) prevent denial-of-service deadlocks while allowing rejected candidates to reapply safely.

---

## 2. Storage Architecture & Document Access Control

### 2.1 Private Bucket Isolation (`player-documents`)
- [ ] **Public Direct Access Blocked:** Ensure `player-documents` Supabase Storage bucket has public read completely disabled (`public = false`). Direct HTTP GET requests to raw paths must return `403 Forbidden`.
- [ ] **Short-Lived Signed URLs:** Association reviewers and District Admins must access documents (Photograph, Aadhaar, ID Proof, DOB Proof, Gazette) exclusively via cryptographically signed URLs with a maximum TTL of **15 minutes**.
- [ ] **Client-Side Image Compression & Pre-Validation:**
  - Enforce file size limit: Maximum 5MB per upload.
  - Allowed MIME types strictly locked: `image/jpeg`, `image/png`, `application/pdf`.
  - Disallow executable scripts, SVGs (to prevent stored XSS), and archive formats.
- [ ] **File Renaming Strategy:** Never retain the applicant's original filename on disk. Uploaded files must be renamed to cryptographically random UUIDs (e.g., `uuidv4() + '.jpg'`) to prevent directory traversal attacks.

---

## 3. Multi-Tenant Row Level Security (RLS) & Access Control

### 3.1 Role-Based Access Control (RBAC) Matrix
| Resource / Action | Public Applicant | District Admin (`ROLE_DISTRICT`) | Association Admin (`ROLE_ASSOCIATION`) |
| :--- | :--- | :--- | :--- |
| **Submit Registration** | Create (Single) | Disallowed | Disallowed |
| **View District Players**| Denied | Read-Only (Own District Only) | Read / Full State Access |
| **Approve / Reject Player**| Denied | Denied | Execute (Mandatory Reason) |
| **Assign State Number** | Denied | Denied | Execute (Atomic RPC) |
| **Submit Tournament Squad**| Denied | Create/Edit (Pre-deadline only)| Full Override / Audit Log |
| **Download State Excel** | Denied | Own District Only | Full State Registry |
| **Edit Certificate Signers**| Denied | Denied | Full Configuration Rights |

### 3.2 District-to-District Data Isolation Audit
- [ ] **Tenant Bleed Prevention:** Confirm that District Admin for Thane (`dist_thane`) cannot query, view, or mutate athletes assigned to Pune (`dist_pune`).
- [ ] **RLS Verification Query:**
  ```sql
  -- Verify District RLS enforcement
  SELECT COUNT(*) FROM players 
  WHERE current_district_id != (auth.jwt() ->> 'district_id')::UUID;
  -- Must return 0 rows when executed in District context
  ```

---

## 4. Competition Roster & Anti-Tampering Integrity

### 4.1 Strict Server-Side Deadline Enforcement
- [ ] **Client Clock Independence:** The submission deadline (`last_date_to_participate`) must be evaluated strictly against PostgreSQL `NOW()` in Server Actions, never trusting client-side timestamps or device time.
- [ ] **Atomic Squad Mutation Lock:** Once the tournament deadline passes (23:59:59 IST), all write operations from District Admins must fail with a strict `403 Forbidden` response.
- [ ] **Immutable Audit Logging for Overrides:**
  - In emergency substitutions post-deadline, only the Association Super Admin can perform modifications.
  - Every override must write an immutable entry to `squad_audit_logs` storing: `admin_id`, `competition_id`, `district_id`, `replaced_player_id`, `new_player_id`, `reason`, and `timestamp`.

### 4.2 48-Hour Anti-Fixing & Result Cooling-Off Protocol
- [ ] **Cooling-Off State Guard:** Results cannot transition from `UNDER_REVIEW_48H` to `DECLARED` until 48 hours have elapsed from match completion.
- [ ] **Disqualification Safeguard:** If malpractice is verified, disqualification updates must cascade:
  - Revoke tentative standings.
  - Invalidate any generated preliminary certificates.
  - Log disciplinary flags against the involved district and athletes.

---

## 5. Certificate Verification & Cryptographic Authenticity

### 5.1 QR Code Tamper-Proofing
- [ ] **Cryptographic Verification Anchor:** QR codes on certificates must point to `/verify/cert/[certNo]?hash=[hmac_sha256]` to prevent attackers from guessing certificate serial numbers.
- [ ] **Public Verifier Sanitization:** The verification endpoint (`/verify/cert/[certNo]`) must render only verified non-sensitive metadata: Athlete Name, State No, District, Tournament Title, and Position Secured. Sensitive details (Aadhaar, residential address, mobile) must remain hidden.
- [ ] **Digital Signature Asset Protection:** Signature assets (President and General Secretary transparent stamps) must be stored securely and applied server-side via `pdf-lib` without exposing raw high-resolution signature PNGs directly to public endpoints.

---

## 6. Denial-of-Service (DoS) & Bot Mitigation

### 6.1 Rate Limiting & Public Abuse Prevention
- [ ] **Public Form Rate Limiting:** Enforce IP-based rate limiting on public registration endpoints (e.g., maximum 5 submissions per hour per IP) via Upstash Redis or Supabase Edge Functions.
- [ ] **Magic Link Brute-Force Defense:** One-time edit links (`/reapply/[token]`) must utilize 128-bit cryptographically secure UUID tokens and automatically expire upon successful re-submission or after 7 days.
- [ ] **Excel Export Throttling:** Restrict heavy state-wide Excel downloads to prevent database CPU exhaustion (maximum 1 export per minute per Association Admin).

---

## 7. Pre-Production Security Verification Checklist

- [ ] All database tables have `ROW LEVEL SECURITY` enabled.
- [ ] No database service role keys (`SUPABASE_SERVICE_ROLE_KEY`) are exposed in client-side code (`NEXT_PUBLIC_` prefix strictly forbidden).
- [ ] CORS policies on Supabase Storage permit origins only from the official domain.
- [ ] Email delivery via Resend configured with SPF, DKIM, and DMARC DNS records for `maharashtrakhokho.org` to ensure delivery and prevent phishing spoofing.
- [ ] HTTPS enforced with HSTS headers enabled across all subdomains.

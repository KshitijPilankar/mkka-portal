# Business Rules & System Constraints Document (Rules.md)
## Project Name: Maharashtra Kho-Kho Association Official State Web Portal
**Version:** 1.0.0  
**Status:** Approved Architectural Specification  

---

## 1. Identity & Re-Application Rules (Zero-Login Rejection Handling)

### 1.1 Unique Constraint Enforcement
- Aadhar Card Number, Mobile Number, and Email must be unique across all active applications.
- **Rule Formulation:** To prevent registration deadlocks when a player application is rejected (e.g., due to an illegible document), uniqueness MUST NOT be enforced across the entire table.
- **Database Index Constraint:**
  ```sql
  -- Partial Unique Indexes allowing Rejected candidates to reapply without manual DB cleanup
  CREATE UNIQUE INDEX idx_unique_active_player_aadhar 
  ON players (aadhar_no) 
  WHERE status IN ('PENDING', 'APPROVED');

  CREATE UNIQUE INDEX idx_unique_active_player_mobile 
  ON players (mobile_no) 
  WHERE status IN ('PENDING', 'APPROVED');

  CREATE UNIQUE INDEX idx_unique_active_player_email 
  ON players (email) 
  WHERE status IN ('PENDING', 'APPROVED');
  ```

### 1.2 Rejected Record Retention & Audit Integrity
- When an application is marked `REJECTED`, the record is NEVER deleted from the database.
- The record retains its original timestamp, submitted data, and the mandatory Association `rejection_reason`.
- The rejection notification email includes the exact reason and a secure one-time pre-filled edit token (`?token=jwt_hash`) allowing the applicant to fix flagged issues and resubmit without starting from scratch.

---

## 2. Official Number Generation & District Mapping Rules

### 2.1 State Registration Number (`STATE NO.`)
- **Generation Trigger:** Generated ONLY when the Association Super Admin clicks the `APPROVE` button. Never generated at initial registration time.
- **Format Standard:** `MH-KK-YYYY-XXXX`
  - `MH`: Maharashtra State prefix.
  - `KK`: Kho-Kho sport code.
  - `YYYY`: Registration year (e.g., `2026`).
  - `XXXX`: 4-digit sequential zero-padded integer reset annually or continued monotonically (e.g., `MH-KK-2026-0001`).
- **Immutability:** Once assigned, the `STATE NO.` is permanently locked and cannot be edited by any user, including District and Association admins.

### 2.2 Federation Number (`FEDERATION NO.`)
- An optional national identifier issued by the Kho-Kho Federation of India (KKFI).
- Editable collaboratively by both Association Admins and District Admins within the player directory.

### 2.3 Residential District vs Playing District
- **Residential District (Field 13):** The geographical district where the player physically resides.
- **Playing District (Field 18):** The district association that the player elects to represent.
- **Rule:** A player is NOT legally restricted to representing their residential district. A player living in Mumbai City may register under Thane District.
- **System Action:** Upon Association approval, the player is bound to the `playing_district_id`. Only the playing district holds administrative rights over the player's competition rosters.

---

## 3. Dynamic Age Category & Cutoff Date Politics

### 3.1 Age Categories (Document Note 04)
1. **Under 14 (Sub Junior):** Sub Jr. Boys & Sub Jr. Girls
2. **Between 14-18 (Junior):** Jr. Boys & Jr. Girls
3. **Above 18 (Senior):** Men & Women

### 3.2 Cutoff Date Logic & Politics Avoidance
- **Anti-Manipulation Principle:** Age category calculation must never default to current system date or school academic year, as tournament eligibility in state sports is subject to tactical association cutoff definitions.
- **Dual Cutoff Architecture:**
  1. **Master Association Cutoff Date:** Configured globally in Association Settings. Used to compute the display `SECTION` on public directories, rosters, and general player lists.
  2. **Tournament-Specific Cutoff Date (`DOB Limit`):** Set independently during `New Competition Announcement`.
- **Eligibility Validation Rule:**
  $$	ext{Player Age for Tournament} = 	ext{DateDifference}(	ext{Player DOB}, 	ext{Tournament Cutoff Date})$$
  - The system dynamically validates whether the player's age falls within the required range on the exact cutoff date specified by the tournament announcement.
  - Players outside the window are automatically greyed out during district squad selection.

---

## 4. Competition Roster & Squad Locking Rules

### 4.1 Squad Composition Constraints
- Each participating District is strictly required to submit a squad of **minimum 12 and maximum 15 players**.
- All squad members must meet three prerequisite conditions:
  1. `status == 'APPROVED'` by Association.
  2. `current_district_id == participating_district_id`.
  3. `Player DOB` strictly satisfies the tournament's `DOB Limit` and category constraints.

### 4.2 Strict Deadline Enforcement (Immutable Server-Side Lock)
- **Open Window:** From Competition Announcement timestamp until `last_date_to_participate` (23:59:59 IST).
  - District Admins can freely add, replace, or reorder players in their 12-15 member squad.
- **Lock Window (Post-Deadline):** Immediately upon reaching the cutoff timestamp:
  - The squad submission interface switches to read-only for District Admins.
  - Server-side API mutations from `ROLE_DISTRICT` are rejected with `403 Forbidden: Entry submission period expired`.
- **Emergency Override Exception:**
  - In cases of medical injury or exceptional dispute, only the Association Super Admin (`ROLE_ASSOCIATION`) holds cryptographic permission to swap or modify squad entries after the deadline.
  - Every post-deadline change generates an immutable audit log entry capturing the admin ID, timestamp, and modification note.

---

## 5. Maker-Checker State Machine Workflows

### 5.1 Player & Referee Lifecycle
- State 1: `PENDING` (Submitted by public form, awaiting state review).
- State 2: `APPROVED` (State No. assigned, emails dispatched, visible in District active list).
- State 3: `REJECTED` (Rejection reason recorded, email dispatched, unblocks unique constraint for resubmission).

### 5.2 Inter-District Player Transfer Workflow
1. Player requests transfer or Destination District initiates request in portal.
2. Transfer request enters `PENDING_TRANSFER` state.
3. Destination District submits transfer request to Association with optional release letter.
4. Association reviews:
   - **Approve:** `players.current_district_id` updates to the new district ID; previous district retains historical records.
   - **Reject:** Player remains with current district; mandatory rejection remark recorded.

### 5.3 District Profile & Player Info Update Approval
- Any modification to critical approved data (Name, DOB, Aadhaar, District credentials) initiated by a District Admin DOES NOT immediately overwrite the master record.
- Changes are staged in a `change_requests` table with `status = 'PENDING'`.
- The Association Super Admin reviews a side-by-side "Old Value vs New Value" diff view and grants or denies approval.

---

## 6. Document & Data Export Compliance

### 6.1 Private Attachment Handling
- All player proofs (Photograph, Aadhaar, ID Proof, DOB Proof, Gazette) are stored in a private Supabase Storage bucket (`player-documents`).
- Public direct access is completely blocked.
- Admin drawers and review modals consume short-lived signed URLs (15-minute expiry).

### 6.2 Excel Master Export Format
- District-wise and State-wide Excel exports generated via `ExcelJS` must output:
  - All 22 form attributes.
  - Auto-generated `STATE NO.` and assigned `FEDERATION NO.`.
  - Secure authenticated server paths or temporary resolution endpoints for attachments, preventing unauthorized scraping of player identification papers.

---

## 7. Scoresheet & Certificate Template Invariance

### 7.1 Scoresheet Template Preservation
- Match scoresheets must adhere to the standardized paper scoresheet layout established by the Maharashtra Kho-Kho Association.
- Online forms reproduce the exact fields: Turns (Innings 1 & 2), Chasers, Defenders, Running Scores, Out Timings, Extra Points, and Official Signatures.
- No arbitrary digital alterations to the score recording structure are permitted.

### 7.2 Dynamic Certificate Overlays
- Certificates (Competition Winner/Participation, Eligibility Certificate) utilize fixed vector/image template backgrounds provided by the Association.
- The generation engine (`pdf-lib`) overlays text dynamically at fixed coordinates:
  - Player Full Name
  - State Registration Number
  - District Name
  - Tournament Title & Category
  - Standing / Position Secured
  - Date & Digital Signature Stamps

---

## 8. Agent Engineering & Coding Directives

### 8.1 Ponytail Code Efficiency Principles
- Write concise, idiomatic TypeScript and Next.js Server Actions.
- Eliminate redundant explanatory comments and generic boilerplate wrappers.
- Rely on native PostgreSQL types and Zod schemas for end-to-end type safety.

### 8.2 Taste-Skill Visual Directives
- Follow an authoritative, dignified institutional aesthetic suitable for a state sports body.
- Strictly avoid playful AI gradients, glowing borders, or oversized bubbly cards.
- Ensure Devanagari typography accommodates proper line heights (`leading-relaxed`) to prevent cutting vowel diacritics (matras).

### 8.3 Impeccable Interaction Directives
- Mandatory tactile feedback: loading skeletons, disabled button states during async dispatch, and clear focus-visible rings.
- Dense table ergonomics: Sticky headers and sticky action columns for large district registries.

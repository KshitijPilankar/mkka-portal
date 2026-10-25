# Product Requirements Document (PRD)
## Project Name: Maharashtra Kho-Kho Association Official State Web Portal
**Version:** 1.0.0  
**Target Platform:** Web (Desktop & Mobile Responsive)  
**Target Stack:** Next.js 15+ (App Router, TypeScript), Supabase (PostgreSQL, Auth, Storage), Tailwind CSS, shadcn/ui  

---

## 1. Executive Summary & Objective
The Maharashtra Kho-Kho Association portal is a centralized digital management system designed to streamline athlete governance, referee accreditation, 36 district administration, and state-level tournament lifecycle management. The system replaces fragmented paper-based processes with an automated state-machine workflow covering registration, document verification, dynamic age-category eligibility, tournament squad locking, scoresheet publishing, and certified credentials.

---

## 2. Core User Personas & Access Control

### 2.1 Association Super Admin (`ROLE_ASSOCIATION`)
- Single state-level authoritative entity.
- Approves or rejects player registrations, referee applications, district profile changes, and inter-district transfers with mandatory rejection reasons.
- Creates and announces tournaments with custom age categories and fixed Cutoff Dates.
- Generates official State Numbers (`STATE NO.`) for players.
- Resets passwords for all 36 District Logins.
- Enters and publishes digital match scoresheets and tournament results.
- Exports comprehensive state/district player registries to Excel.

### 2.2 District Admin (`ROLE_DISTRICT`)
- 36 pre-seeded district accounts across Maharashtra (e.g., Mumbai City, Thane, Pune, Ratnagiri, etc.).
- Views approved active players and pending applicants mapped to their district.
- Enrolls a squad of 12 to 15 eligible players into state-announced competitions prior to the entry submission deadline.
- Initiates player transfer requests to other districts.
- Requests district profile updates subject to Association approval.
- Downloads Eligibility Certificates and Competition Certificates for admitted players.

### 2.3 Public Applicants (No Persistent Login)
- **Player Applicant:** Submits a 22-field registration form with 5 document attachments and accepts statutory Terms & Conditions.
- **Referee Applicant:** Submits official credentials, contact details, and accreditation proofs for Association verification.
- **Status Updates:** Applicants receive transactional emails regarding approval status or rejection reasons (with secure single-use edit tokens for rapid resubmission).

---

## 3. Public Registration Specifications

### 3.1 Player Registration Form (खेडाळू नोंदणी)
The form features dual-language labels (Marathi + English) organized into logical sections:

#### Section 1: Personal Information / वैयक्तिक माहिती
1. First Name / प्रथम नाव* (Text, Compulsory)
2. Middle Name / मधले नाव* (Text, Compulsory)
3. Surname / आडनाव* (Text, Compulsory)
4. Father Name / वडिलांचे नाव (Text)
5. Mother Name / आईचे नाव (Text)
6. Aadhar Card No. / आधार कार्ड क्र.* (12 Digits, Unique среди PENDING/APPROVED)
7. Gender / लिंग* (Radio: Male / पुरुष, Female / महिला)
8. DOB / जन्मदिनांक* (Calendar Date Picker)

#### Section 2: Contact Details / संपर्क तपशील
9. Mobile Number / मोबाईल क्रमांक* (10 Digits)
10. Re-Enter Same Mobile Number / तोच मोबाईल क्रमांक पुन्हा लिहा* (Validation check matching field 9)
11. Email / इमेल* (Valid Email Address)
12. Re-Enter Same Email / तोच इमेल पुन्हा लिहा* (Validation check matching field 11)

#### Section 3: Residential Address / संपर्क पत्ता
13. Residential District / संपर्क जिल्हा* (Dropdown: Maharashtra 36 Districts)
14. Taluka / तालुका (Text)
15. City / शहर (Text)
16. Pincode / पिनकोड* (6 Digits)
17. Complete Address including Pincode / पिनकोड सहित संपूर्ण पत्ता* (Textarea)

#### Section 4: Playing District Selection / नोंदणी जिल्हा
18. Playing District / नोंदणी कोणत्या जिल्ह्यामध्ये करायची आहे? जिल्हा निवडा* (Dropdown: Maharashtra 36 Districts)
    - *Business Rule:* Player may reside in District A (Point 13) but can legitimately register to represent District B (Point 18).

#### Section 5: Mandatory Document Attachments (Max 5MB per file, PDF/JPG/PNG)
19. Photograph / फोटो* (Recent passport-size photo)
20. Address Proof / वास्तव्याचा पुरावा* (Front & Back of Aadhaar Card)
21. ID Proof / आईडी प्रमाण* (School ID, Voter ID, Driving License, or Passport)
22. DOB Proof / जन्माचा पुरावा* (Municipal Corporation / Gram Panchayat Birth Certificate)
23. Other Document / इतर कागदपत्र (Optional: Gazette notification for name/address disparity)

#### Section 6: Terms & Conditions / अटी व शर्ती
- Checkbox 1: Certify that all the information is true to the best of my knowledge. / मी प्रमाणित करतो की, सर्व माहिती माझ्या माहितीनुसार खरी आहे.
- Checkbox 2: Membership cancellation consent upon discovery of incorrect info. / जर वरीलपैकी कोणत्याही टप्प्यावर कोणतीही माहिती चुकीची आढळली तर महाराष्ट्र खो खो असोसिएशन द्वारे माझे सभासदत्व रद्द केले जाऊ शकते.
- Checkbox 3: Consent to share personal info & documents with Technical Committee and potential promotional/website usage. / येथे मी माझी वैयक्तिक माहिती आणि कागदपत्रे महाराष्ट्र खो खो असोसिएशनच्या तांत्रिक समितीला देण्यास सहमत आहे.
- Submission CTA: "SUBMIT FOR MEMBERSHIP" with confirmation disclaimer.

---

### 3.2 Referee Registration Form (पंच नोंदणी)
- Personal Information: Full Name, Gender, DOB, Blood Group, Residential Address, Mobile, Email.
- Professional Referee Qualifications: Exam Passing Year, Grade/Level (State/National), District Affiliation.
- Attachments: Passport Photograph, Identity Proof, Referee Certification Proof.
- Submission triggers approval workflow to Association Referee Desk.

---

## 4. Association Admin Portal Modules

### 4.1 Dashboard
- Real-time KPI Metric Cards:
  - Total Players (Across all 36 Districts)
  - Active Players (Association Approved)
  - Pending Players (Awaiting review)
  - Total Districts (36)
  - Active Referees (Approved)
  - Pending Referees (Awaiting review)

### 4.2 Notice Board
- Upload official circulars (Fields: Subject, File Attachment PDF/Image).
- Archive table listing previously published notices.
- Actions: Direct Download and Delete (with confirmation modal).

### 4.3 Referee Information
- **Approval & Rejection Queue:** Table of pending applicants (Sr. No, Name, Photo, District, Date of Application, Action).
  - "Information" modal: Displays complete application details.
  - Approve Action: Sets status to APPROVED, sends automated welcome email.
  - Reject Action: Opens mandatory "Reason for Rejection" textarea; sets status to REJECTED, dispatches email with explanation and one-time edit link.
- **Referee List:** Directory of all active approved referees with contact details and district badges.

### 4.4 All District Management
- **District List:** Table of 36 districts displaying Contact Person, Mobile, Username, and Active Player counts.
- **Update Approval:** Review and approve/reject profile modifications submitted by District Admins.
- **Change Password:** Master password override allowing Association Admin to reset login credentials for any of the 36 districts.

### 4.5 Players Management
- **Approval and Rejection Queue:**
  - Table of pending player registrations sorted chronologically.
  - Detail drawer displaying all 22 fields, inline preview of 5 uploaded documents, and age category preview.
  - Approve Action: Assigns sequential State Number (`MH-KK-2026-XXXX`), assigns player to selected Playing District, dispatches approval email.
  - Reject Action: Mandatory rejection remark, triggers email notification.
- **District Change Requests:**
  - Table of inter-district transfer requests initiated by districts.
  - Association actions: Approve transfer (updates player's `current_district_id`) or Reject (with reason).
- **Download Player List:**
  - Single-click Excel export (`.xlsx`) via ExcelJS.
  - Option 1: District-Wise Export (filtered by selected district).
  - Option 2: All Players Export (state-wide registry).
  - File contains all 22 attributes and direct authenticated/secure server paths for attachments.
- **Players Master Directory:**
  - Columns: Sr. No, Player Name, State No., Federation No., Mobile, DOB, Section, District, Action.
  - Edit Modal: Association can assign/edit `FEDERATION NO.` and modify player details.
- **Player Update Approval:** Reviews player detail edits submitted by district administrators.

### 4.6 Competition Announcement
- **New Competition Form:**
  - Competition Name*
  - Competition Place / Venue*
  - Competition Start Date* & End Date*
  - Category Selection*: (Sub Jr. Boys, Jr. Boys, Men, Sub Jr. Girls, Jr. Girls, Women)
  - Last Date to Participate* (Strict cutoff timestamp for district squad submissions)
  - DOB Limit / Cutoff Date* (Eligibility boundary overriding standard calendar year calculations)
- **Competitions Announced List:** Directory of published tournaments with period, location, and detailed view modal.

### 4.7 Competition Setup
- **Competition Entries:** View registered district squads (12 to 15 players per team).
- **Scoresheet:** Digital recreation of the official standardized Kho-Kho scoresheet template for recording turns, chases, running scores, and individual foul/point tallies.
- **Result:** Official winner, runner-up, score declarations, and match standing updates.

### 4.8 Certificates
- **Competition Certificates:** Dynamic rendering on pre-defined association graphic templates overlaying Player Name, State No, District, Event, and Standing.
- **Eligibility Certificates:** Verification certificates for district teams prior to match commencements.
- **Add Member & Other Certificates:** Specialized participation and administrative credentials.

---

## 5. District Portal Modules

### 5.1 Dashboard
- Quick view of District's approved active players, pending applications, announced tournaments, and submitted competition squads.

### 5.2 All Players List
- Sub-sections: All Players, Active Players, Pending Players.
- Real-time search, filter by age category, and detail modal.
- "Request Profile Update" action sending changes to Association Approval Queue.

### 5.3 Competition Management
- **Upcoming Events:** View state tournaments accepting entries.
- **Submit Squad:** Multi-select interface picking 12 to 15 approved players meeting tournament `DOB Limit`.
- **Lock Enforcement:** Editable by District Admin until `Last date to participate`. Locked immediately post-deadline; subsequent roster changes require Association Super Admin override.
- **Competition Admitted:** View confirmed team registrations and schedules.
- **Certificates:** Access and batch-download earned player certificates.

### 5.4 District Change (Inter-District Transfer)
- Search player by State No. or Name.
- Select destination district, attach release justification, and submit transfer request to Association.

### 5.5 Eligibility Certificate
- Generate and download standardized association eligibility roster sheets for tournament participation.

---

## 6. Non-Functional & Operational Requirements

### 6.1 Performance & Reliability
- Optimized image delivery via CDN/Storage bucket with client-side compression prior to upload.
- Table pagination and server-side cursor querying to handle thousands of player records without UI lag.

### 6.2 Data Security & RBAC
- PostgreSQL Row-Level Security (RLS) ensuring District Admin accounts can read/modify only their district's records.
- Identity document security: Private storage buckets with signed URLs; sensitive identifier redaction across public views.
- Partial Unique Constraints on player identifiers allowing rejected candidates to reapply without database collisions.

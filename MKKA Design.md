# UI/UX Design System Specification (Design.md)
## Project Name: Maharashtra Kho-Kho Association Official State Web Portal
**Version:** 1.0.0  
**Design System:** Material You / Material Design 3 (Enhanced MD3 Specification)  
**Primary Aesthetic:** Friendly, tactile, organic, and authoritative state sports portal  
**Seed Theme Palette:** Purple/Violet Seed (`#6750A4`) with warm tonal surfaces  
**Typography Core:** Roboto (Google Fonts) paired with Noto Sans Devanagari / Mukta for Marathi script  

---

## 1. Design Philosophy & High-Level Vibe

The Maharashtra Kho-Kho Association web platform adopts **Google's Material You (Material Design 3)** with rich architectural elevation, atmospheric layered depth, and tactile micro-interactions:
- **Tonal Hierarchy Over Stark Whites:** Pure white (`#FFFFFF`) is banned for backgrounds. Instead, the interface relies on calibrated tonal surfaces (`#FFFBFE` Base, `#F3EDF7` Container, `#E7E0EC` Low).
- **Organic & Pill-Shaped Geometry:** Pill buttons (`rounded-full`), generous card curves (`rounded-3xl` / `24px`), and sweeping hero shells (`rounded-[40px]`).
- **Tactile State Layers:** Color shifts on hover are replaced by semi-transparent state layers (`bg-primary/90`, `bg-primary/10`) coupled with physical press feedback (`active:scale-95`).
- **Athletic State Presence:** The design blends modern Material You fluidity with the dignity and legibility required for official state governance, match scoresheets, and verifiable certificates.

---

## 2. Design Tokens & Color System (Light Mode Primary)

### 2.1 Core Palette Tokens
Derived from the authoritative Material 3 Purple/Violet seed (`#6750A4`):

```css
:root {
  /* Surface Tonal System */
  --md-surface: #FFFBFE;                    /* Base canvas (warm off-white) */
  --md-on-surface: #1C1B1F;                 /* Near-black with subtle warmth */
  --md-surface-container: #F3EDF7;          /* Default card & section background */
  --md-surface-container-low: #E7E0EC;      /* Input fields & recessed surfaces */
  --md-surface-variant: #E7E0EC;            /* Sub-panels & container borders */
  --md-on-surface-variant: #49454F;         /* Secondary text, hints, helper icons */

  /* Brand & Interactive Colors */
  --md-primary: #6750A4;                    /* Seed purple - CTAs & active highlights */
  --md-on-primary: #FFFFFF;                 /* Text on primary */
  --md-primary-container: #EADDFF;          /* Highlighted cards & active tabs */
  --md-on-primary-container: #21005D;       /* Text on primary container */

  --md-secondary-container: #E8DEF8;        /* Pill chips, badges, and filters */
  --md-on-secondary-container: #1D192B;     /* Chip text */

  --md-tertiary: #7D5260;                   /* Mauve/rose - Floating actions & alerts */
  --md-on-tertiary: #FFFFFF;

  --md-outline: #79747E;                    /* Crisp 1px borders & input underlines */
  --md-outline-variant: #CAC4D0;            /* Soft dividers */

  /* State Status Semantic Accents */
  --status-approved: #2E7D32;               /* Green for approved players/referees */
  --status-approved-container: #E8F5E9;
  --status-pending: #EF6C00;                /* Amber/orange for review queues */
  --status-pending-container: #FFF3E0;
  --status-rejected: #C62828;               /* Red for rejected applications/disputes */
  --status-rejected-container: #FFEBEE;
}
```

### 2.2 Tailwind CSS Configuration Mapping (`tailwind.config.ts`)
```ts
module.exports = {
  theme: {
    extend: {
      colors: {
        'md-surface': 'var(--md-surface)',
        'md-on-surface': 'var(--md-on-surface)',
        'md-surface-container': 'var(--md-surface-container)',
        'md-surface-container-low': 'var(--md-surface-container-low)',
        'md-primary': 'var(--md-primary)',
        'md-on-primary': 'var(--md-on-primary)',
        'md-primary-container': 'var(--md-primary-container)',
        'md-on-primary-container': 'var(--md-on-primary-container)',
        'md-secondary-container': 'var(--md-secondary-container)',
        'md-on-secondary-container': 'var(--md-on-secondary-container)',
        'md-tertiary': 'var(--md-tertiary)',
        'md-outline': 'var(--md-outline)',
        'md-on-surface-variant': 'var(--md-on-surface-variant)',
      },
      borderRadius: {
        'md-xs': '8px',
        'md-sm': '12px',
        'md-md': '16px',
        'md-lg': '24px',
        'md-xl': '28px',
        'md-2xl': '32px',
        'md-3xl': '48px',
      },
      transitionTimingFunction: {
        'md-emphasized': 'cubic-bezier(0.2, 0.0, 0, 1.0)',
      }
    }
  }
}
```

---

## 3. Typography & Bilingual Devanagari Standards

### 3.1 Typeface Families
* **English Typography:** `Roboto, sans-serif` (Google Fonts: 400, 500, 700).
* **Marathi (Devanagari) Typography:** `Mukta, "Noto Sans Devanagari", sans-serif`.
* **Devanagari Diacritic Rule:** All bilingual labels MUST use `leading-relaxed` (line-height: 1.625) to prevent clipping of upper and lower vowel accents (matras like ु, ू, ौ, ं).

### 3.2 Type Scale
| Role | Size (rem / px) | Weight | Tailwind Utility | Application |
| :--- | :--- | :--- | :--- | :--- |
| **Display Large** | 3.5rem (56px) | 700 Bold | `text-5xl font-bold` | Hero landing headlines |
| **Headline Large** | 2.5rem (40px) | 500 Medium | `text-4xl font-medium` | Portal page headers |
| **Headline Medium** | 2.0rem (32px) | 500 Medium | `text-2xl font-medium` | Section division titles |
| **Title Large** | 1.5rem (24px) | 500 Medium | `text-xl font-medium` | Card & modal titles |
| **Body Large** | 1.125rem (18px)| 400 Regular | `text-lg font-normal leading-relaxed` | Lead paragraphs |
| **Body Medium** | 1.0rem (16px) | 400 Regular | `text-base leading-relaxed` | Standard text & bilingual descriptions |
| **Label Medium** | 0.875rem (14px)| 500 Medium | `text-sm font-medium tracking-wide` | Pill buttons & table headers |
| **Label Small** | 0.75rem (12px) | 400 Regular | `text-xs font-normal` | Form helper notes & metadata |

---

## 4. Component Styling & Interactive States

### 4.1 Buttons (Pill-Shaped Architecture)
All standard buttons are strictly **pill-shaped** (`rounded-full`):

```tsx
// 1. Primary Filled CTA
<button className="h-12 px-8 rounded-full bg-md-primary text-md-on-primary font-medium shadow-sm transition-all duration-300 ease-md-emphasized hover:bg-md-primary/90 hover:shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2">
  SUBMIT FOR MEMBERSHIP / सभासदत्वासाठी अर्ज करा
</button>

// 2. Tonal Secondary Button (Filter / Secondary action)
<button className="h-10 px-6 rounded-full bg-md-secondary-container text-md-on-secondary-container font-medium transition-all duration-300 ease-md-emphasized hover:bg-md-secondary-container/80 active:scale-95">
  Download Excel / एक्सेल डाऊनलोड
</button>

// 3. Outlined Action Button
<button className="h-10 px-6 rounded-full border border-md-outline bg-transparent text-md-primary font-medium transition-all duration-300 hover:bg-md-primary/10 active:scale-95">
  View Information / माहिती पहा
</button>

// 4. Floating Action Button (FAB)
<button className="h-14 w-14 rounded-2xl bg-md-tertiary text-white shadow-md flex items-center justify-center transition-all duration-300 hover:shadow-xl active:scale-95">
  <PlusIcon className="w-6 h-6" />
</button>
```

### 4.2 Material 3 Filled Text Field (Inputs)
Adheres to the official MD3 filled input style:
- Top corners rounded (`rounded-t-xl`), bottom corners sharp (`rounded-b-none`).
- Background: `#E7E0EC` (Surface Container Low).
- Bottom border: 2px solid `#79747E`, changing smoothly to 2px solid `#6750A4` on focus.
- Height: 56px (`h-14`) with floating or clear bilingual labels.

```tsx
<div className="relative flex flex-col">
  <label className="text-xs font-medium text-md-on-surface-variant mb-1">
    Aadhar Card No. / आधार कार्ड क्र.*
  </label>
  <input 
    type="text" 
    placeholder="Enter 12-digit number"
    className="h-14 px-4 rounded-t-xl rounded-b-none bg-md-surface-container-low text-md-on-surface border-b-2 border-md-outline focus:border-md-primary focus:outline-none transition-colors duration-200"
  />
</div>
```

### 4.3 Cards & Atmospheric Layered Depth
- Standard card background: `#F3EDF7` (`bg-md-surface-container`), borderless.
- Border radius: `24px` (`rounded-3xl`).
- Hover state: Elevation shifts from `shadow-sm` to `shadow-md`, accompanied by subtle scale: `hover:scale-[1.01]`.
- Ambient Background Aura: Sections include off-canvas blurred organic circles (`blur-3xl bg-md-primary/15 rounded-full`) behind key containers to produce depth.

---

## 5. Public Registration Form Layout (22 Fields + 5 Attachments)

The public registration page utilizes a centered, generous card shell (`max-w-4xl mx-auto rounded-[36px] bg-md-surface-container p-8 md:p-12 shadow-sm`):

```
+-------------------------------------------------------------------+
|  [Logo]  MAHARASHTRA KHO-KHO ASSOCIATION (महाराष्ट्र खो-खो असोसिएशन)   |
|  खेडाळू नोंदणी फॉर्म (Player Membership Application 2026-27)           |
+-------------------------------------------------------------------+
|  1. वैयक्तिक माहिती (Personal Information)                          |
|  [ First Name* ]      [ Middle Name* ]      [ Surname* ]         |
|  [ Father Name ]      [ Mother Name ]       [ Aadhar Card No.* ] |
|  [ Gender (M/F)* ]    [ Date of Birth (Calendar Picker)* ]        |
+-------------------------------------------------------------------+
|  2. संपर्क तपशील (Contact Details)                                |
|  [ Mobile Number* ]                   [ Re-Enter Mobile* ]        |
|  [ Email Address* ]                   [ Re-Enter Email* ]         |
+-------------------------------------------------------------------+
|  3. पत्ता व जिल्हा निवड (Residential vs Playing District)          |
|  [ Residential District* ]            [ Taluka / City ]           |
|  [ Pincode* ]                         [ Full Address* ]           |
|  --> नोंदणी कोणत्या जिल्ह्यामध्ये करायची आहे? (Playing District)*    |
|      [ Select from 36 Districts Dropdown ]                        |
+-------------------------------------------------------------------+
|  4. आवश्यक कागदपत्रे (Mandatory Document Uploads - Max 5MB)       |
|  [ + Photo* ]  [ + Aadhaar Proof* ]  [ + ID Proof* ]  [ + DOB* ]  |
+-------------------------------------------------------------------+
|  5. अटी व शर्ती (Terms & Conditions Checkboxes)                    |
|  [x] सर्व माहिती खरी आहे...                                        |
|  [x] सभासदत्व रद्द होऊ शकते...                                    |
|  [x] तांत्रिक समितीशी शेअर करण्यास संमती...                       |
+-------------------------------------------------------------------+
|               [ SUBMIT FOR MEMBERSHIP (Pill CTA) ]                |
+-------------------------------------------------------------------+
```

---

## 6. Official Digital Scoresheet Grid (Preserving PDF & Excel Format)

Based on `scoresheet (1).pdf` and `New Scoresheet English.xlsx`, the digital scoresheet form in `/association/competitions/[id]/scoresheet` renders a dense, legible tactical grid:

### 6.1 Match Header Bar
- Rounded-2xl card displaying: Tournament Name, Solapur Venue, Court No, Match No, Session (Morning/Evening), Toss Winner, and Choice (Defence/Chase).

### 6.2 15-Player Side-by-Side Roster Grid
Two responsive columns (Team A on Left, Team B on Right) formatted as:
* Columns: `CHEST NO.` (1 to 15) | `NAME OF PLAYERS` | `DEFENCE-TURNS (W, I, II, III, IV)` | `CHASE-TURNS (1, 2, 3, 4)` | `SUBSTITUTES (A, B, C, D)`.
* Footer under each team: Manager Name, Coach Name, and Supporting Staff.

### 6.3 Action Entry Matrix & Symbol Palette
* Quick-action symbol buttons styled as MD3 chips (`rounded-full px-3 py-1 bg-md-secondary-container text-xs font-semibold`):
  - `S` (Simple Touch), `P` (Post Dive), `L` (Late Entry), `D` (Dive), `O` (Out of Field), `T` (Tap), `W` (Warning), `B` (Blue Card), `SA` (Sudden Attack), `Y` (Yellow Card), `F` (Red Card / Turn Close).
* Summary tally box calculating automatic running points, turn totals, and Grand Total.

### 6.4 Bench Officials Signatory Footer
* Clean two-row input grid capturing: Scorer 1 & 2, Dugout 1 & 2, Umpire 1 & 2, Timekeeper, Post Umpires 1 & 2, and Chief Referee.

---

## 7. Dynamic Certificate Layout & Signatory Settings UI

Reflecting `image (20).png` structure:

### 7.1 Visual Layout Architecture
* **Border Canvas:** Official royal blue and gold gradient framed border (`bg-[radial-gradient]`).
* **Header:** Central Maharashtra Kho-Kho Association crest with state registration details (`Regd. No. BOM 13/1966 GBBSDF/34329 (MUMBAI)`).
* **Tournament Headline:** `52nd JUNIOR STATE KHO KHO CHAMPIONSHIP 2026-27` in bold crimson.
* **Certificate Banner:** Ribbon badge displaying **"Merit Certificate"** or **"Participation Certificate"**.
* **Dynamic Athlete Fields:**
  - `Awarded to: [NAME]`
  - `Father's Name: [NAME] as Player / Coach / Manager`
  - `Date of Birth: [DD MMMM YYYY]      District: [DISTRICT]`
  - `Position: [FIRST / SECOND / THIRD]`
* **Photo & Verifiable QR Anchor:**
  - Centered bottom player photo accompanied by a scannable QR Code linking to `https://[domain]/verify/cert/[certNo]`.
* **Dynamic Signatory Anchors:**
  - Left Anchor: Digital signature of **Hon. Sunetra Pawar (President)**.
  - Right Anchor: Digital signature of **Dr. Chandrajit Jadhav (General Secretary)**.

### 7.2 Association Signatory Management Dashboard (`/association/certificates/templates`)
A dedicated admin panel where the Association Super Admin can:
1. Update President Name & Upload new transparent PNG signature stamp.
2. Update General Secretary Name & Upload new signature stamp.
3. Preview live sample certificate in real-time before batch generation.

---

## 8. Association & District Admin Navigation Layout

* **Top App Bar:** Tonal glassmorphism (`bg-md-surface/80 backdrop-blur-md border-b border-md-outline/10`) with state emblem, active role badge (`ROLE_ASSOCIATION` or `District: Thane`), and profile menu.
* **Navigation Drawer / Rail:**
  - Icons accompanied by clear bilingual labels.
  - Active item indicator: Pill pill container (`bg-md-primary-container text-md-on-primary-container font-medium rounded-full`).
  - Smooth 300ms hover transition with 10% opacity state overlay.
* **Data Table Ergonomics:**
  - Sticky header with `#F3EDF7` surface fill.
  - Generous row height (56px) for touch and desktop.
  - Status Pills:
    - `APPROVED`: `bg-green-100 text-green-900 rounded-full px-3 py-1 text-xs font-semibold`
    - `PENDING`: `bg-amber-100 text-amber-900 rounded-full px-3 py-1 text-xs font-semibold`
    - `REJECTED`: `bg-red-100 text-red-900 rounded-full px-3 py-1 text-xs font-semibold`
  - Sticky `ACTION` column keeping "Information", "Approve", and "Reject" buttons accessible during horizontal scrolling on mobile screens.

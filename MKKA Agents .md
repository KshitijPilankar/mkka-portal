# AI Agent Engineering & Antigravity IDE Directives (Agents.md)
## Project Name: Maharashtra Kho-Kho Association Official State Web Portal
**Version:** 1.0.0  
**Target Environment:** Antigravity IDE / Cursor / Claude Code  
**Coding Philosophy:** Ponytail Token-Efficiency, Zero Boilerplate, Type-Safe Next.js 15+ Server Actions  
**Design Reference:** Material You (Material Design 3) with Bilingual Devanagari Ergonomics  

---

## 1. Prime Directives for AI Agents

When authoring code, refactoring, or generating components inside Antigravity IDE, all AI agents MUST strictly comply with these core tenets:

1. **Ponytail Brevity & Zero Fluff:**
   - Eliminate redundant explanations, self-evident inline comments (e.g., `// return response`, `// handle click`), and verbose wrapper classes.
   - Favor compact, idiomatic TypeScript, Next.js App Router conventions, and native PostgreSQL features over deeply nested abstractions.
   - Do not hallucinate external packages. Stick to: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, `exceljs`, `pdf-lib`, `lucide-react`, `sonner`, and `tailwind-merge`.

2. **Bilingual Devanagari Integrity:**
   - Never omit or truncate Marathi strings to save tokens. Every form label, action button, and status indicator must maintain dual-language parity (e.g., `First Name / प्रथम नाव*`).
   - All Marathi text containers must declare `leading-relaxed` to prevent font clipping of vowel diacritics (matras).

3. **Strict Sensitive Identity Protection:**
   - Never log, echo in plain text, or expose government identification numbers (Aadhaar).
   - In form placeholders, code examples, test fixtures, or mock seed files, always use masked tokens (e.g., `[Aadhaar Redacted]`).

4. **Server-Side Security Enforcement:**
   - Never rely on client-side state for competition squad locking or role authorization. Always re-verify timestamps and `auth.jwt() ->> 'role'` inside Server Actions.

---

## 2. Specialized Agent Personas & Domain Scopes

When tackling specific modules, adopt the corresponding specialist agent profile:

```
                  +-----------------------------------+
                  |      Master Antigravity Agent     |
                  +-----------------------------------+
                                    |
     +-----------------+------------+------------+-----------------+
     |                 |                         |                 |
     ▼                 ▼                         ▼                 ▼
[Schema & Data]   [Material 3 UI]        [State & Workflows]  [Doc & Sports Grid]
 Supabase, SQL,    Tailwind, shadcn,      Server Actions,      Scoresheet PDF,
 RLS & Indexes     Forms & Touch UX       Tokens & Rejection   pdf-lib & ExcelJS
```

### 2.1 Agent 1: Database & Security Architect (`@agent-db`)
* **Focus:** PostgreSQL schema migrations, Row Level Security (RLS) policies, and performance indexes.
* **Directives:**
  - Enforce Partial Unique Indexes on `players` and `referees` so `REJECTED` records do not trigger uniqueness collisions on re-application.
  - Maintain the 36 Maharashtra Districts pre-seeded catalog without renaming district codes.
  - Isolate private player proof documents into private storage buckets accessed exclusively via 15-minute expiring signed URLs.

### 2.2 Agent 2: Material You UI/UX Artisan (`@agent-ui`)
* **Focus:** Next.js client components, bilingual form steps, responsive tables, and tactile feedback.
* **Directives:**
  - Implement Google's Material You (MD3) token hierarchy: Canvas `#FFFBFE`, Containers `#F3EDF7`, Low `#E7E0EC`, Primary `#6750A4`.
  - Buttons must be strictly pill-shaped (`rounded-full`) with `active:scale-95` tactile response.
  - Text fields must follow the MD3 filled style: rounded top corners (`rounded-t-xl`), sharp bottom, with a 2px underline transition.
  - Avoid generic AI gradients, glowing borders, or sharp rectangular cards.

### 2.3 Agent 3: Workflow & State Machine Engineer (`@agent-workflow`)
* **Focus:** Next.js Server Actions, status transitions, tokenized re-application links, and transactional emails.
* **Directives:**
  - Auto-generate the sequential official State Registration Number (`MH-KK-2026-XXXX`) strictly on Association approval.
  - Enforce the 12–15 player squad limit per district tournament entry.
  - Enforce immutable server-side squad lock after `last_date_to_participate` (23:59:59 IST), allowing changes only via authenticated Association Super Admin override.
  - Wire Resend/SMTP email triggers on approval and rejection (with mandatory reason and pre-filled magic token URL).

### 2.4 Agent 4: Scoresheet & Certificate Engine Specialist (`@agent-docs`)
* **Focus:** Exact reproduction of `scoresheet (1).pdf`, `New Scoresheet English.xlsx`, and `image (20).png`.
* **Directives:**
  - Build the digital twin of the standardized 15-player Kho-Kho scoresheet grid (turns I–IV, batches, chest numbers 1–15, substitutes, and official symbols `S`, `P`, `L`, `D`, `O`, etc.).
  - Implement dynamic certificate generation using `pdf-lib`, overlaying recipient details, scannable QR verification code, and dynamic President/General Secretary signature stamps.
  - Implement the 48-hour anti-fixing review lock (`UNDER_REVIEW_48H` -> `DECLARED`).

---

## 3. Ponytail Code Generation Rules & Templates

### 3.1 Next.js 15 Server Action Template (Ponytail Style)
Concise, robust, type-safe, zero unnecessary boilerplate:

```ts
"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ApprovePlayerSchema = z.object({
  playerId: z.string().uuid(),
});

export async function approvePlayerAction(formData: FormData) {
  const parsed = ApprovePlayerSchema.safeParse({
    playerId: formData.get("playerId"),
  });
  if (!parsed.success) return { error: "Invalid player identifier" };

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.user_metadata?.role !== "ROLE_ASSOCIATION") {
    return { error: "Unauthorized access" };
  }

  // Generate atomic State Number: MH-KK-2026-XXXX
  const { data, error } = await supabase.rpc("generate_player_state_no", {
    target_player_id: parsed.data.playerId,
    admin_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/association/players/approvals");
  return { success: true, stateNo: data };
}
```

### 3.2 Zod Validation Pattern for 22-Field Public Registration
```ts
import { z } from "zod";

export const PlayerRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is compulsory"),
  middleName: z.string().min(1, "Middle name is compulsory"),
  surname: z.string().min(1, "Surname is compulsory"),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  aadharNo: z.string().regex(/^\d{12}$/, "Aadhaar must be exactly 12 digits"),
  gender: z.enum(["MALE", "FEMALE"]),
  dob: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid birth date"),
  mobileNo: z.string().regex(/^[6-9]\d{9}$/, "Invalid 10-digit mobile number"),
  reMobileNo: z.string(),
  email: z.string().email("Invalid email address"),
  reEmail: z.string(),
  residentialDistrictId: z.string().uuid(),
  taluka: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  fullAddress: z.string().min(5, "Complete address is required"),
  playingDistrictId: z.string().uuid("Playing district selection is compulsory"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Must accept terms and conditions" }),
  }),
}).refine((data) => data.mobileNo === data.reMobileNo, {
  message: "Mobile numbers do not match",
  path: ["reMobileNo"],
}).refine((data) => data.email === data.reEmail, {
  message: "Email addresses do not match",
  path: ["reEmail"],
});
```

### 3.3 Dynamic Cutoff Age Validation Helper
```ts
export function evaluatePlayerTournamentEligibility(
  dobString: string,
  dobLimitString: string,
  category: "SUB_JUNIOR" | "JUNIOR" | "SENIOR"
): boolean {
  const dob = new Date(dobString);
  const cutoff = new Date(dobLimitString);
  
  const ageInYears = (cutoff.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

  if (category === "SUB_JUNIOR") return ageInYears < 14;
  if (category === "JUNIOR") return ageInYears >= 14 && ageInYears <= 18;
  return ageInYears > 18;
}
```

---

## 4. Antigravity Agent Command Prompts

When directing the AI inside Antigravity IDE, use these standard task prompts for maximum precision:

* **Task: Scaffold Registration Form**  
  > `"Act as @agent-ui and @agent-workflow. Scaffold the bilingual 22-field Player Registration Form with client-side image compression and Zod validation. Adhere strictly to Material You pill buttons and filled inputs defined in Design.md."`

* **Task: Implement Squad Lock & Validation**  
  > `"Act as @agent-workflow and @agent-db. Implement the competition squad submission action for District Admins. Validate 12 to 15 player bounds, check DOB Limit against tournament cutoff date, and reject mutations if current time > last_date_to_participate."`

* **Task: Digitized Kho-Kho Scoresheet**  
  > `"Act as @agent-docs and @agent-ui. Create the digital twin of scoresheet (1).pdf for /association/competitions/[id]/scoresheet. Include 15 player side-by-side roster, action chips (S, P, L, D, etc.), turn totals, and match official signatories."`

* **Task: Dynamic Certificate Generation**  
  > `"Act as @agent-docs. Implement the pdf-lib generator for merit certificates using image (20).png layout. Overlay dynamic player details, fetch active President and Secretary signatures from certificate_templates, and stamp verifiable QR code."`

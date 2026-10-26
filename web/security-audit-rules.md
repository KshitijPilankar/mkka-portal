# MKKA Security Audit Checklist & Rules

Audit the repository with strict focus on web application security standards (OWASP Top 10):

1. Authentication & Authorization:
   - Check for client-side hardcoded secrets, passwords, or bypassable PINs.
   - Verify that all admin routes and sensitive operations (Create, Edit, Delete) are strictly guarded on the server level (Server Actions / Middleware / Supabase Auth), not merely hidden via frontend UI.

2. Database & Data Exposure (Supabase):
   - Audit Supabase client initialization. Ensure service role keys are never exposed in public code.
   - Verify Row Level Security (RLS) policies for tables: `tournaments`, `players`, `referees`.
   - Check if Personally Identifiable Information (PII) like Aadhaar numbers, phone numbers, and birth certificates are protected from unauthorized public queries.

3. Input Validation & File Uploads:
   - Validate file upload endpoints (MIME types, file size limits, safe file naming).
   - Ensure SQL injection, script injection, and XSS risks are mitigated in all form handlers.

4. HTTP & Response Security:
   - Check security headers in `next.config.ts`.
   - Ensure proper CORS configuration on API endpoints (`/api/scan-roster`, etc.).
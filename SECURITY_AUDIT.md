# OffStories Security Audit

**Reviewed:** 9 September 2026  
**Scope:** Cloudflare Pages Worker, D1, R2 documents, authentication, collaboration invites, RSVP, public invitation pages, and server functions.  
**Overall posture:** Needs Improvement → core P1 findings remediated in this change; production abuse controls still need Cloudflare configuration.

## Remediated Findings

| ID | Severity | Area | Issue | Resolution |
| --- | --- | --- | --- | --- |
| SEC-01 | P1 | Partner invites | Two users could race to accept the same link invite and both become members. | Invite acceptance now atomically claims an active invite before inserting membership, and rejects a workspace that already has an editor/viewer partner. |
| SEC-02 | P1 | Authorization / RSVP | RSVP-link creation did not validate request origin and only considered owner workspaces. | Both RSVP mutations now enforce same-origin requests, rate limits, accessible-workspace membership, and read-only roles. |
| SEC-03 | P1 | CSRF | Origin validation accepted overly broad `*.pages.dev` and `*.offstories.fun` origins; no-origin requests were accepted. | Origin validation now uses an explicit allowlist plus only OffStories preview subdomains; a trusted Referer is required when Origin is absent. |
| SEC-04 | P2 | Session | Logout could be triggered cross-site. | Logout now enforces the same server-side origin validation as every other authenticated mutation. |
| SEC-05 | P2 | Authentication | Signup response revealed whether an email was already registered. | Signup now returns a neutral message rather than confirming account existence. |
| SEC-06 | P2 | Dependencies | `npm audit` reported vulnerable transitive build dependencies. | Lockfile-only non-breaking updates reduce `npm audit --omit=dev` to zero advisories. |
| SEC-07 | P2 | Error handling | An unauthenticated document request threw through SSR and returned HTTP 500. | The private document endpoint now returns an explicit non-cacheable HTTP 401 without internal error detail. |
| SEC-08 | P2 | Telemetry | Authenticated client-error reporting had no CSRF or rate-limit gate, allowing log-noise abuse. | Telemetry now requires a trusted origin and has a per-client request limit. |

## Verified Controls

- Passwords are PBKDF2-SHA-256 hashes with a unique 16-byte salt; plaintext passwords are not stored.
- Sessions are random 256-bit bearer tokens stored only as SHA-256 digests in D1; cookies are `HttpOnly`, `Secure` on HTTPS, `SameSite=Lax`, and invalidated on logout.
- Workspace reads and writes resolve membership server-side; viewers cannot mutate `workspace_data` or upload documents.
- D1 access uses parameterized statements. No raw user-controlled SQL was found.
- D1 foreign keys, membership primary keys, invite token uniqueness, and R2 workspace-prefixed object keys protect ownership boundaries.
- Documents are limited to PDF/DOCX, 5 MB, private R2 access, workspace authorization, safe filenames, `nosniff`, and private no-store delivery.
- Public RSVP and invitation pages use high-entropy bearer tokens, validation, revocation checks, and request rate limits.
- Production headers include CSP, HSTS, COOP, frame restrictions, MIME sniffing protection, a restrictive permissions policy, and Trusted Types.

## Remaining Production Hardening

| ID | Severity | Area | Risk | Required next action |
| --- | --- | --- | --- | --- |
| SEC-09 | P2 | Distributed rate limiting | The current in-memory limiter is per Worker isolate and cannot guarantee global throttling during coordinated abuse. | Configure Cloudflare WAF Rate Limiting rules for auth, newsletter, invite, RSVP, analytics, and document-upload endpoints. |
| SEC-10 | P2 | Bot prevention | Turnstile verification is implemented as an optional server check, but is inactive without a production secret and client widget. | Configure Turnstile for signup and public RSVP, then set `TURNSTILE_SECRET_KEY` in Pages secrets. |
| SEC-11 | P2 | Concurrent editing | Workspace kinds are stored as JSON blobs. Concurrent saves of the same kind can still produce a last-write-wins update. | Add per-kind revision values and conditional D1 updates, then surface a conflict/reload flow in the client. |
| SEC-12 | P3 | Account lifecycle | Password-reset and email-verification flows are not implemented. | Add time-limited, hashed, single-use reset and verification tokens before broad public launch. |

## Regression Checks

- `npm audit --omit=dev --json`: 0 vulnerabilities.
- `npm run lint`: passes with 9 existing Fast Refresh warnings and no errors.
- `npm run build`: passes.
- Manual destructive or brute-force testing was not performed against production.

## Deployment Notes

This change contains no D1 migration and is safe to roll back by reverting the application commit. Cloudflare WAF and Turnstile setup are external configuration changes and should be tested in a preview deployment before enforcement is enabled on production.

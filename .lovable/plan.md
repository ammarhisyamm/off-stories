# Plan: Auth, Invites, Calendar, Phosphor Icons, Mobile Nav

## 1. Backend (Lovable Cloud)

Enable Cloud, then add migration:

- `profiles` — `id (uuid, fk auth.users)`, `display_name`, `avatar_url`, `email`. Auto-created on signup via trigger.
- `workspaces` — one per wedding; `owner_id`, `event_name`, `event_date`, `event_type`.
- `workspace_members` — `workspace_id`, `user_id`, `role` (`owner|editor|viewer`), unique.
- `workspace_invites` — `workspace_id`, `token (uuid)`, `role`, `expires_at`, `created_by`, `accepted_at`.
- `calendar_connections` — `user_id`, `provider_token`, `provider_refresh_token`, `google_calendar_id`, `expires_at`.
- `calendar_sync_log` — track which milestones synced to which GCal event ids.

RLS: workspace members can read; only owner/editor can write. Invite token lookup allowed to authenticated users (`select` policy by token match). Grants follow standard pattern.

## 2. Authentication

- Enable Google provider via `supabase--configure_social_auth` and call `lovable.auth.signInWithOAuth("google", ...)` with scopes including `https://www.googleapis.com/auth/calendar.events` so the same Google login yields a calendar-capable provider token.
- Route `/auth` — public; Google button. Redirects to `/` after sign-in.
- Wrap protected routes under `_authenticated/` layout (integration-managed).
- Move all current app routes into `_authenticated/` subtree (`/`, `/timeline`, `/checklist`, etc.).
- Public routes remain: `/auth`, `/invite/$token`.

## 3. Shareable Invite Links

- `/settings` (under auth): "Invite collaborators" panel — pick role, click Create → shows copyable URL `https://app/invite/<token>`. List active/revoked invites.
- Public route `/invite/$token`: if signed-out, prompts Google sign-in (preserves token), then accepts invite via server fn — inserts `workspace_members` row, marks invite `accepted_at`, redirects to `/`.
- Server fns: `createInvite`, `listInvites`, `revokeInvite`, `acceptInvite`.

## 4. Google Calendar Sync

- Use the **Google session provider token** from Supabase (no extra connector needed since user signs in with Google + calendar scope).
- Store/refresh `provider_token` server-side in `calendar_connections` when session updates.
- Server fns:
  - `getCalendarStatus` — is connected? returns calendar id.
  - `syncMilestonesToCalendar` — fetch milestones from `mock-data` (or future DB), push as GCal events via `https://www.googleapis.com/calendar/v3/calendars/primary/events`. Update log to upsert vs insert.
  - `disconnectCalendar` — clear stored tokens.
- UI: `/settings` "Calendar" section — Connect/Disconnect, "Sync timeline now" button, last-synced timestamp.

## 5. Phosphor Icons in Sidebar

- `bun add @phosphor-icons/react`
- Replace each nav label with a Phosphor icon + label: House, Calendar, CheckSquare, CurrencyDollar, Storefront, Users, NoteBlank, FolderOpen, Gear.

## 6. Mobile Hamburger Nav

- Refactor `AppLayout`:
  - Desktop (`md+`): existing fixed left sidebar.
  - Mobile: top bar with hamburger button → opens shadcn `Sheet` from the left containing the same nav list. Active route highlights stay.
- Ensure header layout uses responsive grid pattern (avoid overflow on 731px width).

## 7. Files Touched

New:
- `supabase/migrations/<ts>_init_auth_invites_calendar.sql`
- `src/routes/_authenticated/route.tsx` (managed; create if missing)
- `src/routes/_authenticated/index.tsx`, `_authenticated/timeline.tsx`, `…` (move existing route files)
- `src/routes/auth.tsx`
- `src/routes/invite.$token.tsx`
- `src/lib/invites.functions.ts`
- `src/lib/calendar.functions.ts`
- `src/lib/workspace.functions.ts`
- `src/components/mobile-nav.tsx`

Edited:
- `src/components/app-layout.tsx` — Phosphor icons, mobile sheet, current-user display.
- `src/routes/__root.tsx` — auth listener, query invalidation.
- `src/routes/settings.tsx` → moved; invites + calendar panels added.
- `src/start.ts` — append `attachSupabaseAuth`.

## Confirmation needed

The Google Calendar sync uses the **same Google sign-in** with extra calendar scope — users get one consent screen for login + calendar. OK to proceed?

# KulaTam Restaurant

React (Vite) menu site for KulaTam, Owang Energy, Kitengela.

## Run locally

```bash
npm install
cp .env.example .env   # then fill in this branch's Supabase URL + anon key
npm run dev
```

The site works without Supabase: it falls back to the bundled menu in
`src/data/menu.json`. Once the migration has been run, it loads the live menu
from Supabase instead.

## Database (Supabase)

All tables, functions and policies end in `_kt` (`categories_kt`,
`subcategories_kt`, `menu_items_kt`, `admins_kt`, `announcements_kt`) so they never clash with the
other branch's tables in the shared project.

1. Open `supabase/migrations/20261010000000_kulatam_menu_kt.sql`.
2. Paste the whole file into the Supabase SQL editor and run it. It creates
   the tables and RLS policies and inserts the full menu. It is safe to re-run.
3. To let someone edit the menu, add them to `admins_kt` (see the bottom of the
   SQL file). Being signed in is not enough, so other-branch users can't edit.

### Announcements

Run `supabase/migrations/20261010120000_announcements_kt.sql` in the SQL editor
after the menu migration. Announcements appear under the bell icon.

Staff post them at `/admin`: sign in with an existing account that has been
added to `admins_kt`. Announcements can be scheduled (show from / until) or
saved as drafts. Visitors only ever see published announcements that are live.

### Password reset

Staff who forget their password use "Forgot password?" on `/admin`. The email
links back to `/admin/reset-password` on this site. Because sign-in is shared
with the other branch, add these to **Supabase → Authentication → URL
Configuration → Redirect URLs**, or the link falls back to the project's Site URL:

- `https://<this-site's-domain>/admin/reset-password`
- `http://localhost:5173/admin/reset-password` (local development)

Accounts are shared, so a new password applies at both branches.

To change the seed menu, edit `src/data/menu.json` and regenerate the SQL:

```bash
npm run db:migration
```

## Settings

Opening hours, address and Google rating live in `src/config.js`.

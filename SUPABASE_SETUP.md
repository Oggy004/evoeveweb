# Supabase setup for EVOEVE website

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and create a project.
2. Open **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key

## 2. Configure environment variables

Create `.env` from `.env.example` and set:

```env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
```

Generate frontend config:

```bash
npm run config
```

## 3. Create the database table

In Supabase **SQL Editor**, run the full contents of `supabase/schema.sql`.

This creates `contact_inquiries` and allows anonymous inserts from the contact form.

## 4. Admin authentication

1. **Authentication → Providers → Email** — enable Email sign-in.
2. **Authentication → Users** — add admin users manually.
3. **Authentication → URL Configuration** — add redirect URLs:
   - `http://localhost:3000/reset-password.html` (use your actual dev port)
   - `https://your-domain.com/reset-password.html` (production)
4. **login.html** — admin sign in and forgot password (email reset link).
5. **admin.html** — inquiry dashboard (requires sign in).

## 5. Security checklist

1. Keep `.env` private and never commit it.
2. Use only the **anon key** in frontend; never expose `service_role`.
3. Keep auth messages generic (avoid revealing if an account exists).
4. Enable strong passwords in Supabase Auth settings.
5. Add production reset URL in **Authentication → URL Configuration**.

## 6. Test

Serve the site over HTTP (not `file://`), for example:

```bash
npx serve .
```

- **Contact form** (`index.html#contact`): submit the form; a row should appear in **Table Editor → contact_inquiries**.
- **Login** (`login.html`): sign in with a user you created in Supabase Auth.

## File map

| File | Role |
|------|------|
| `js/supabase-config.js` | Your project URL and anon key |
| `js/supabase-client.js` | Creates the Supabase client |
| `js/contact-form.js` | Saves contact form to `contact_inquiries` |
| `js/admin-auth.js` | Admin sign-in and forgot password flow |
| `js/reset-password.js` | Password update after email verification |
| `supabase/schema.sql` | Database table and security policies |

# MotoStore.rs — Netlify Deploy Guide

## Korak 1: Postavi bazu (lokalno, jednom)

```bash
# Raspakuj ZIP, otvori terminal u folderu
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

## Korak 2: Deploy na Netlify

### Opcija A — Drag & Drop
1. `npm run build` lokalno
2. Zipuj `.next` folder
3. Netlify → Sites → Deploy manually → prevuci ZIP

### Opcija B — Git (preporučeno)
1. Push na GitHub
2. Netlify → New site → Import from GitHub
3. Build command: `npm run build`
4. Publish dir: `.next`
5. Plugin: @netlify/plugin-nextjs (automatski detektuje)

## Korak 3: Environment Variables u Netlify

Idi na: **Site Settings → Environment Variables → Add variable**

| Key | Value |
|-----|-------|
| DATABASE_URL | `postgresql://postgres.nowwrjqdmsiottemvbvd:11Malichevu!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| DIRECT_URL | `postgresql://postgres.nowwrjqdmsiottemvbvd:11Malichevu!@aws-0-eu-central-1.pooler.supabase.com:5432/postgres` |
| NEXT_PUBLIC_SUPABASE_URL | `https://nowwrjqdmsiottemvbvd.supabase.co` |
| ADMIN_JWT_SECRET | `motostore-admin-jwt-secret-nowwrjqdmsiottemvbvd-2024` |
| SMTP_HOST | `smtp.gmail.com` |
| SMTP_PORT | `587` |
| SMTP_USER | vukrajovic95@gmail.com |
| SMTP_PASS | opyuyjblkddoorlp |
| EMAIL_FROM | `MotoStore.rs <noreply@motostore.rs>` |
| ADMIN_EMAIL | `admin@motostore.rs` |
| NEXT_PUBLIC_SITE_URL | `https://motostore.netlify.app` |

## Korak 4: Admin pristup

- URL: `https://your-site.netlify.app/admin`
- Email: `admin@motostore.rs`  
- Lozinka: `admin123`

⚠️ Promenite lozinku u produkciji!

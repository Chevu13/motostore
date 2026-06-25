# MotoStore.rs — Installation Guide

## Prerequisites

- Node.js 18+
- PostgreSQL (or Supabase account)
- npm or yarn

---

## 1. Clone & Install

```bash
cd motostore
npm install
```

---

## 2. Environment Variables

Copy and fill in your values:

```bash
cp .env.example .env.local
```

### Required Variables

```env
# Database (Supabase connection string)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"

# Supabase (from your project settings)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Admin JWT (generate with: openssl rand -base64 32)
ADMIN_JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Email (SMTP config)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="MotoStore.rs <noreply@motostore.rs>"

# Admin notification email
ADMIN_EMAIL="admin@motostore.rs"

# Site URL (for SEO, sitemap)
NEXT_PUBLIC_SITE_URL="https://motostore.rs"
```

---

## 3. Supabase Setup

### 3a. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New project
2. Copy your connection string from Settings → Database

### 3b. Create Storage Bucket (for product images)
1. Supabase Dashboard → Storage → New bucket
2. Name: `product-images`
3. Set as **Public**
4. Enable file size limit: 5MB
5. Allowed MIME types: `image/jpeg, image/png, image/webp`

---

## 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data (14 categories, 12 products, 1 admin user)
npm run db:seed
```

**Default admin credentials after seed:**
- Email: `admin@motostore.rs`
- Password: `admin123`

> ⚠️ Change the admin password in production!

---

## 5. Development

```bash
npm run dev
```

App runs at: http://localhost:3000

- Store: http://localhost:3000/store
- Admin: http://localhost:3000/admin

---

## 6. Project Structure

```
src/
├── app/
│   ├── admin/                    # Admin panel pages
│   │   ├── layout.tsx            # Auth check
│   │   ├── login/                # Admin login
│   │   ├── dashboard/            # Overview stats
│   │   ├── porudzbine/           # Orders list
│   │   │   └── [id]/             # Order detail + status change
│   │   ├── proizvodi/            # Products list
│   │   │   ├── novi/             # Add product
│   │   │   └── [id]/             # Edit product
│   │   ├── kategorije/           # Category management
│   │   ├── analitika/            # Analytics
│   │   └── podesavanja/          # Settings
│   ├── api/                      # API routes
│   │   ├── admin/
│   │   │   ├── auth/login/       # POST - admin login
│   │   │   ├── auth/logout/      # POST - logout
│   │   │   ├── orders/           # GET list, PATCH by id
│   │   │   ├── products/         # CRUD
│   │   │   ├── categories/       # CRUD
│   │   │   ├── upload/           # POST - image upload
│   │   │   └── analytics/        # GET - stats
│   │   ├── orders/               # POST - create order
│   │   │   └── track/            # GET - order tracking
│   │   └── products/search/      # GET - search
│   ├── store/                    # Public store pages
│   │   ├── layout.tsx            # Header + Footer
│   │   ├── page.tsx              # Homepage
│   │   ├── kategorija/[slug]/    # Category page
│   │   ├── proizvod/[slug]/      # Product detail
│   │   ├── korpa/                # Cart
│   │   ├── porudzbina/           # Checkout
│   │   ├── pracenje/             # Order tracking
│   │   └── pretraga/             # Search
│   ├── sitemap.ts                # Dynamic sitemap
│   └── robots.ts                 # Robots.txt
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   └── ProductForm.tsx       # Reusable add/edit form
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── CategoriesSection.tsx
│   │   ├── FeaturedProducts.tsx
│   │   ├── WhyChooseUs.tsx
│   │   ├── DeliveryBanner.tsx
│   │   └── NewsletterSection.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── ui/
│       └── toaster.tsx
├── hooks/
│   └── use-toast.ts
├── lib/
│   ├── auth.ts                   # JWT admin auth
│   ├── cart-store.ts             # Zustand cart
│   ├── email.ts                  # Nodemailer templates
│   ├── prisma.ts                 # Prisma singleton
│   └── utils.ts                  # Helpers, formatPrice, etc.
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

---

## 7. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Vercel Environment Variables

Set all variables from `.env.local` in Vercel Dashboard → Project → Settings → Environment Variables.

### Build Settings
- Framework: Next.js
- Build command: `npm run build`
- Output directory: `.next`

### Post-deploy
```bash
# Run migrations on production DB
npx prisma db push --schema=./prisma/schema.prisma

# Seed (only once!)
npm run db:seed
```

---

## 8. Email Configuration

### Gmail Setup
1. Enable 2FA on your Google account
2. Go to Security → App Passwords
3. Generate app password for "Mail"
4. Use that password in `SMTP_PASS`

### Alternative: Resend.com (recommended for production)
```env
SMTP_HOST="smtp.resend.com"
SMTP_PORT="465"
SMTP_USER="resend"
SMTP_PASS="re_your_api_key"
```

---

## 9. Order Flow

```
Customer places order → 
  DB: Order saved (status: ORDERED) →
  Email: Customer receives confirmation →
  Email: Admin receives notification →

Admin reviews order →
  Admin Panel: Changes status →
  Email: Customer notified of status change

Statuses: ORDERED → CONFIRMED → PURCHASED → IN_TRANSIT → ARRIVED → DELIVERED
```

---

## 10. Admin Usage

| Feature | URL |
|---------|-----|
| Login | `/admin/login` |
| Dashboard | `/admin/dashboard` |
| All orders | `/admin/porudzbine` |
| Order detail | `/admin/porudzbine/[id]` |
| All products | `/admin/proizvodi` |
| Add product | `/admin/proizvodi/novi` |
| Edit product | `/admin/proizvodi/[id]` |
| Categories | `/admin/kategorije` |
| Analytics | `/admin/analitika` |
| Settings | `/admin/podesavanja` |

---

## 11. Future Scaling

- **CSV Import**: Add `/api/admin/import` with `papaparse` for bulk product upload
- **Supplier Integration**: Use `externalId` + `supplierName` + `supplierPrice` fields on Product model
- **Dynamic Pricing**: Add markup % to supplierPrice automatically
- **Payment Gateway**: Add Nestpay or Allsecure for Serbian online payments
- **Multi-language**: Add `next-intl` for English/Serbian

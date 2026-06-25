-- Dodaj supplierUrl kolonu (pokreni ovo ako si već kreirao tabele)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "supplierUrl" TEXT;

-- MotoStore.rs - Complete Database Schema
-- Run this in Supabase Dashboard → SQL Editor

-- Enums
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'LOW_STOCK', 'PREORDER');
CREATE TYPE "OrderStatus" AS ENUM ('ORDERED', 'CONFIRMED', 'PURCHASED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED');
CREATE TYPE "VariantType" AS ENUM ('SIZE', 'COLOR', 'MATERIAL');

-- Category
CREATE TABLE "Category" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
    "name"        TEXT NOT NULL,
    "slug"        TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "imageUrl"    TEXT,
    "parentId"    TEXT REFERENCES "Category"("id"),
    "sortOrder"   INTEGER NOT NULL DEFAULT 0,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product
CREATE TABLE "Product" (
    "id"               TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
    "name"             TEXT NOT NULL,
    "slug"             TEXT NOT NULL UNIQUE,
    "description"      TEXT,
    "shortDescription" TEXT,
    "price"            DECIMAL(10,2) NOT NULL,
    "oldPrice"         DECIMAL(10,2),
    "sku"              TEXT UNIQUE,
    "brand"            TEXT,
    "stockStatus"      "StockStatus" NOT NULL DEFAULT 'IN_STOCK',
    "stockQuantity"    INTEGER NOT NULL DEFAULT 0,
    "isActive"         BOOLEAN NOT NULL DEFAULT true,
    "isFeatured"       BOOLEAN NOT NULL DEFAULT false,
    "categoryId"       TEXT NOT NULL REFERENCES "Category"("id"),
    "externalId"       TEXT,
    "supplierName"     TEXT,
    "supplierSku"      TEXT,
    "supplierPrice"    DECIMAL(10,2),
    "supplierUrl"      TEXT,
    "metaTitle"        TEXT,
    "metaDescription"  TEXT,
    "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ProductImage
CREATE TABLE "ProductImage" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "url"       TEXT NOT NULL,
    "alt"       TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false
);

-- ProductVariant
CREATE TABLE "ProductVariant" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
    "productId"   TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "type"        "VariantType" NOT NULL,
    "value"       TEXT NOT NULL,
    "priceAdjust" DECIMAL(10,2),
    "stock"       INTEGER NOT NULL DEFAULT 0,
    "isActive"    BOOLEAN NOT NULL DEFAULT true
);

-- ProductSpec
CREATE TABLE "ProductSpec" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "label"     TEXT NOT NULL,
    "value"     TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- Order
CREATE TABLE "Order" (
    "id"            TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
    "orderNumber"   TEXT NOT NULL UNIQUE,
    "status"        "OrderStatus" NOT NULL DEFAULT 'ORDERED',
    "firstName"     TEXT NOT NULL,
    "lastName"      TEXT NOT NULL,
    "email"         TEXT NOT NULL,
    "phone"         TEXT NOT NULL,
    "address"       TEXT NOT NULL,
    "city"          TEXT NOT NULL,
    "postalCode"    TEXT NOT NULL,
    "note"          TEXT,
    "subtotal"      DECIMAL(10,2) NOT NULL,
    "shippingCost"  DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total"         DECIMAL(10,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'cash_on_delivery',
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- OrderItem
CREATE TABLE "OrderItem" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
    "orderId"     TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "productId"   TEXT NOT NULL REFERENCES "Product"("id"),
    "productName" TEXT NOT NULL,
    "variantInfo" TEXT,
    "quantity"    INTEGER NOT NULL,
    "unitPrice"   DECIMAL(10,2) NOT NULL,
    "totalPrice"  DECIMAL(10,2) NOT NULL
);

-- OrderStatusHistory
CREATE TABLE "OrderStatusHistory" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
    "orderId"   TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "status"    "OrderStatus" NOT NULL,
    "note"      TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AdminUser
CREATE TABLE "AdminUser" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
    "email"     TEXT NOT NULL UNIQUE,
    "password"  TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Settings
CREATE TABLE "Settings" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
    "key"       TEXT NOT NULL UNIQUE,
    "value"     TEXT NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_isActive_isFeatured_idx" ON "Product"("isActive", "isFeatured");
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_email_idx" ON "Order"("email");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");

-- Auto-update updatedAt triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW."updatedAt" = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_updated_at BEFORE UPDATE ON "Category" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_product_updated_at BEFORE UPDATE ON "Product" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_order_updated_at BEFORE UPDATE ON "Order" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_admin_updated_at BEFORE UPDATE ON "AdminUser" FOR EACH ROW EXECUTE FUNCTION update_updated_at();

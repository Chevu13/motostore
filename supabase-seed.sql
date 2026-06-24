-- MotoStore.rs - Seed Data
-- Run AFTER supabase-schema.sql

-- =====================
-- ADMIN USER
-- Password: admin123
-- =====================
INSERT INTO "AdminUser" ("id", "email", "password", "name") VALUES
('admin_001', 'admin@motostore.rs', '$2a$12$xxiJsisd1QOAHCOtWz0FsOL4UADFMfOpXB2fx93Zqv3huSQEEZDR2', 'Admin');

-- =====================
-- CATEGORIES (4 glavne)
-- =====================
INSERT INTO "Category" ("id", "name", "slug", "description", "imageUrl", "sortOrder") VALUES
('cat_kacige',   'Kacige',    'kacige',    'Moto kacige - integralne, modularni, jet',  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 1),
('cat_jakne',    'Jakne',     'jakne',     'Moto jakne - kožne, tekstilne, adventure',  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80', 2),
('cat_pantalone','Pantalone', 'pantalone', 'Moto pantalone sa CE zastitom',             'https://images.unsplash.com/photo-1609902726285-00668009f004?w=800&q=80', 3),
('cat_cizme',    'Čizme',     'cizme',     'Moto čizme - touring, sport, adventure',    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 4);

-- =====================
-- PRODUCTS - Kacige
-- =====================
INSERT INTO "Product" ("id","name","slug","shortDescription","description","price","oldPrice","brand","sku","stockStatus","stockQuantity","isActive","isFeatured","categoryId") VALUES
('p_shoei_gt',
 'Shoei GT-Air 3 Integralka',
 'shoei-gt-air-3',
 'Premium integralka sa ugrađenom sun vizirom i odličnom ventilacijom',
 'Shoei GT-Air 3 je vrhunska integralka za touring. Ugrađeni sun vizir, tiha kabina, P-MAX ljuska za maksimalnu zaštitu. CE ECE 22.06 sertifikovana.',
 89990, 99990, 'Shoei', 'SHO-GTA3-BLK', 'IN_STOCK', 15, true, true, 'cat_kacige'),

('p_agv_k6',
 'AGV K6 S Integralka',
 'agv-k6-s',
 'Sportska integralka vrhunske aerodinamike, carbon ljuska',
 'AGV K6 S donosi race-proven tehnologiju na ulicu. Ultra-lagana carbon ljuska, Pinlock 120 vizir, odlična ventilacija. Idealna za sport touring.',
 74990, NULL, 'AGV', 'AGV-K6S-BLK', 'IN_STOCK', 8, true, true, 'cat_kacige'),

('p_bell_qualifier',
 'Bell Qualifier DLX MIPS',
 'bell-qualifier-dlx-mips',
 'Odličan odnos cena-kvalitet, MIPS sistem za bolje upravljanje udarima',
 'Bell Qualifier DLX MIPS pruža solidnu zaštitu uz MIPS tehnologiju za rotacione udare. Polycarbonate/ABS ljuska, Pinlock spreman vizir.',
 34990, 39990, 'Bell', 'BELL-QDLX-GRY', 'IN_STOCK', 22, true, false, 'cat_kacige');

-- =====================
-- PRODUCTS - Jakne
-- =====================
INSERT INTO "Product" ("id","name","slug","shortDescription","description","price","oldPrice","brand","sku","stockStatus","stockQuantity","isActive","isFeatured","categoryId") VALUES
('p_alpinestars_andes',
 'Alpinestars Andes V3 Adventure Jakna',
 'alpinestars-andes-v3',
 'All-season adventure jakna, vodootporna, CE Level 2 štitnici',
 'Andes V3 je svestrана adventure jakna sa vodootpornom membranom, CE Level 2 štitnicima za ramena i laktove, džepom za leđni štitnik. Tri sloja ventilacije.',
 59990, 69990, 'Alpinestars', 'ALP-AND3-BLK-L', 'IN_STOCK', 12, true, true, 'cat_jakne'),

('p_dainese_smart',
 'Dainese Smart Jacket LS',
 'dainese-smart-jacket-ls',
 'Revolučna jakna sa ugrađenim air bag sistemom',
 'Smart Jacket LS integriše Dainese D-Air airbag sistem koji štiti grudni koš i leđa. Kompaktna, lagana, naizgled obična jakna - revolucija u zaštiti.',
 99990, NULL, 'Dainese', 'DAN-SJ-LS-BLK', 'LOW_STOCK', 4, true, true, 'cat_jakne'),

('p_revit_dominator',
 'REV''IT! Dominator 3 GTX Jakna',
 'revit-dominator-3-gtx',
 'Gore-Tex jakna za sve uslove, tekstilna, CE Level 2',
 'Dominator 3 GTX koristi originalnu Gore-Tex Pro membranu za potpunu vodootpornost. CE Level 2 PWR|SPEED štitnici. Idealna za daleka putovanja.',
 79990, 89990, 'REV''IT!', 'REV-DOM3-GTX-L', 'IN_STOCK', 7, true, false, 'cat_jakne');

-- =====================
-- PRODUCTS - Pantalone
-- =====================
INSERT INTO "Product" ("id","name","slug","shortDescription","description","price","oldPrice","brand","sku","stockStatus","stockQuantity","isActive","isFeatured","categoryId") VALUES
('p_alpinestars_andes_p',
 'Alpinestars Andes V3 Pantalone',
 'alpinestars-andes-v3-pantalone',
 'Adventure pantalone, vodootporne, CE Level 1 štitnici, zip za jaknu',
 'Andes V3 pantalone idealno se kombinuju sa Andes jaknom. Vodootporna membrana, CE Level 1 štitnici za kolena i kukove, ventilacija sa zipovima.',
 35990, 39990, 'Alpinestars', 'ALP-AND3P-BLK-L', 'IN_STOCK', 18, true, true, 'cat_pantalone'),

('p_revit_cayenne_p',
 'REV''IT! Cayenne Pro Pantalone',
 'revit-cayenne-pro-pantalone',
 'Touring pantalone sa removable podstavom i CE Level 2 zaštitom',
 'Cayenne Pro kombinuje polyester ljusku sa PWR|SHIELD materijalima na kritičnim mestima. Removable thermal podstava, CE Level 2 štitnici.',
 29990, NULL, 'REV''IT!', 'REV-CAY-PRO-L', 'IN_STOCK', 14, true, false, 'cat_pantalone');

-- =====================
-- PRODUCTS - Čizme
-- =====================
INSERT INTO "Product" ("id","name","slug","shortDescription","description","price","oldPrice","brand","sku","stockStatus","stockQuantity","isActive","isFeatured","categoryId") VALUES
('p_sidi_adventure',
 'Sidi Adventure 2 Gore-Tex Čizme',
 'sidi-adventure-2-gore-tex',
 'Premium adventure čizme, Gore-Tex, CE Level 2',
 'Sidi Adventure 2 su referentne adventure čizme. Gore-Tex obloga, CE Level 2 zaštita, podesiva Tecno-3 kuka. Komforne za dugo hodanje i vožnju.',
 39990, 44990, 'Sidi', 'SIDI-ADV2-GTX-42', 'IN_STOCK', 10, true, true, 'cat_cizme'),

('p_alpinestars_corozal',
 'Alpinestars Corozal Adventure Čizme',
 'alpinestars-corozal-adventure',
 'Touring čizme sa vodootpornom membranom i ankleštitom',
 'Corozal Adventure nude odličan balans između zaštite i komfora za touring. Waterproof membrana, TPU ankle zaštita, non-slip đon.',
 28990, 32990, 'Alpinestars', 'ALP-COR-ADV-42', 'IN_STOCK', 16, true, true, 'cat_cizme'),

('p_tcx_blend',
 'TCX Blend WP Urban Čizme',
 'tcx-blend-wp-urban',
 'Urban čizme - izgledaju kao casual, nude moto zaštitu',
 'TCX Blend WP kombinuje urbani stil sa solidnom moto zaštitom. Waterproof membrana, CE Level 1 zaštita, Vibram đon. Nosive i van motocikla.',
 18990, NULL, 'TCX', 'TCX-BLD-WP-42', 'IN_STOCK', 20, true, false, 'cat_cizme');

-- =====================
-- PRODUCT IMAGES
-- =====================
-- Kacige
INSERT INTO "ProductImage" ("productId","url","alt","isPrimary","sortOrder") VALUES
('p_shoei_gt',  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 'Shoei GT-Air 3', true, 0),
('p_shoei_gt',  'https://images.unsplash.com/photo-1609902726285-00668009f004?w=800&q=80', 'Shoei GT-Air 3 strana', false, 1),
('p_agv_k6',    'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80', 'AGV K6 S', true, 0),
('p_bell_qualifier', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80', 'Bell Qualifier', true, 0);

-- Jakne
INSERT INTO "ProductImage" ("productId","url","alt","isPrimary","sortOrder") VALUES
('p_alpinestars_andes', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80', 'Alpinestars Andes V3', true, 0),
('p_dainese_smart',     'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80', 'Dainese Smart Jacket', true, 0),
('p_revit_dominator',   'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'REV''IT Dominator GTX', true, 0);

-- Pantalone
INSERT INTO "ProductImage" ("productId","url","alt","isPrimary","sortOrder") VALUES
('p_alpinestars_andes_p', 'https://images.unsplash.com/photo-1609902726285-00668009f004?w=800&q=80', 'Alpinestars Andes Pantalone', true, 0),
('p_revit_cayenne_p',     'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80', 'REV''IT Cayenne Pro', true, 0);

-- Čizme
INSERT INTO "ProductImage" ("productId","url","alt","isPrimary","sortOrder") VALUES
('p_sidi_adventure',      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'Sidi Adventure 2', true, 0),
('p_alpinestars_corozal',  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80', 'Alpinestars Corozal', true, 0),
('p_tcx_blend',           'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'TCX Blend WP', true, 0);

-- =====================
-- VARIANTS - Kacige (veličine)
-- =====================
INSERT INTO "ProductVariant" ("productId","type","value","stock") VALUES
('p_shoei_gt','SIZE','XS',2),('p_shoei_gt','SIZE','S',3),('p_shoei_gt','SIZE','M',4),
('p_shoei_gt','SIZE','L',3),('p_shoei_gt','SIZE','XL',2),('p_shoei_gt','SIZE','XXL',1),
('p_agv_k6','SIZE','S',1),('p_agv_k6','SIZE','M',3),('p_agv_k6','SIZE','L',2),('p_agv_k6','SIZE','XL',2),
('p_bell_qualifier','SIZE','XS',3),('p_bell_qualifier','SIZE','S',4),('p_bell_qualifier','SIZE','M',6),
('p_bell_qualifier','SIZE','L',5),('p_bell_qualifier','SIZE','XL',4);

INSERT INTO "ProductVariant" ("productId","type","value","stock") VALUES
('p_alpinestars_andes','SIZE','S',2),('p_alpinestars_andes','SIZE','M',3),
('p_alpinestars_andes','SIZE','L',4),('p_alpinestars_andes','SIZE','XL',2),('p_alpinestars_andes','SIZE','XXL',1),
('p_dainese_smart','SIZE','S',1),('p_dainese_smart','SIZE','M',2),('p_dainese_smart','SIZE','L',1),
('p_revit_dominator','SIZE','M',2),('p_revit_dominator','SIZE','L',3),('p_revit_dominator','SIZE','XL',2);

INSERT INTO "ProductVariant" ("productId","type","value","stock") VALUES
('p_sidi_adventure','SIZE','41',2),('p_sidi_adventure','SIZE','42',3),
('p_sidi_adventure','SIZE','43',2),('p_sidi_adventure','SIZE','44',2),('p_sidi_adventure','SIZE','45',1),
('p_alpinestars_corozal','SIZE','41',3),('p_alpinestars_corozal','SIZE','42',4),
('p_alpinestars_corozal','SIZE','43',4),('p_alpinestars_corozal','SIZE','44',3),('p_alpinestars_corozal','SIZE','45',2),
('p_tcx_blend','SIZE','40',2),('p_tcx_blend','SIZE','41',4),('p_tcx_blend','SIZE','42',5),
('p_tcx_blend','SIZE','43',4),('p_tcx_blend','SIZE','44',3),('p_tcx_blend','SIZE','45',2);

-- =====================
-- PRODUCT SPECS
-- =====================
INSERT INTO "ProductSpec" ("productId","label","value","sortOrder") VALUES
('p_shoei_gt','Homologacija','ECE 22.06',0),
('p_shoei_gt','Ljuska','P-MAX (Fiberglass + Organics)',1),
('p_shoei_gt','Sun vizir','Da - ugrađen',2),
('p_shoei_gt','Težina','1.450g (M)',3),
('p_shoei_gt','Ventilacija','5 ulaza, 3 izlaza',4),

('p_agv_k6','Homologacija','ECE 22.06',0),
('p_agv_k6','Ljuska','Carbon/Aramid/Fiberglass',1),
('p_agv_k6','Težina','1.280g (M)',2),
('p_agv_k6','Vizir','Pinlock 120 Max Vision',3),

('p_alpinestars_andes','Homologacija','CE Level 2 (ruke i ramena)',0),
('p_alpinestars_andes','Membrana','Vodootporna laminirana',1),
('p_alpinestars_andes','Leđni štitnik','Džep (nije uključen)',2),
('p_alpinestars_andes','Ventilacija','3 zone',3),

('p_sidi_adventure','Homologacija','CE Level 2',0),
('p_sidi_adventure','Membrana','Gore-Tex',1),
('p_sidi_adventure','Kuka','Tecno-3 podesiva',2),
('p_sidi_adventure','Đon','Non-slip Vibram',3),
('p_sidi_adventure','Visina','19cm',4);

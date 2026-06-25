import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding MotoStore.rs database...')

  // Admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  await prisma.adminUser.upsert({
    where: { email: 'admin@motostore.rs' },
    update: {},
    create: {
      email: 'admin@motostore.rs',
      password: hashedPassword,
      name: 'Admin',
    },
  })
  console.log('✅ Admin user created: admin@motostore.rs / admin123')

  // 4 main categories
  const categories = [
    { id: 'cat_kacige',    name: 'Kacige',     slug: 'kacige',     description: 'Integralne, modularni, jet kacige', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', sortOrder: 1 },
    { id: 'cat_jakne',     name: 'Jakne',      slug: 'jakne',      description: 'Kožne, tekstilne i adventure jakne', imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80', sortOrder: 2 },
    { id: 'cat_pantalone', name: 'Pantalone',  slug: 'pantalone',  description: 'CE zaštitne moto pantalone', imageUrl: 'https://images.unsplash.com/photo-1609902726285-00668009f004?w=800&q=80', sortOrder: 3 },
    { id: 'cat_cizme',     name: 'Čizme',      slug: 'cizme',      description: 'Touring, sport i adventure čizme', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', sortOrder: 4 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, imageUrl: cat.imageUrl },
      create: cat,
    })
  }
  console.log('✅ 4 kategorije kreirane')

  // Products
  const products = [
    // KACIGE
    {
      id: 'p_shoei_gt', name: 'Shoei GT-Air 3 Integralka', slug: 'shoei-gt-air-3',
      shortDescription: 'Premium integralka sa ugrađenom sun vizirom i odličnom ventilacijom',
      description: 'Shoei GT-Air 3 je vrhunska integralka za touring. Ugrađeni sun vizir, tiha kabina, P-MAX ljuska. CE ECE 22.06 sertifikovana.',
      price: 89990, oldPrice: 99990, brand: 'Shoei', sku: 'SHO-GTA3-BLK',
      stockStatus: 'IN_STOCK' as const, stockQuantity: 15, isActive: true, isFeatured: true, categoryId: 'cat_kacige',
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'],
      variants: ['XS','S','M','L','XL','XXL'],
      specs: [['Homologacija','ECE 22.06'],['Ljuska','P-MAX Fiberglass'],['Sun vizir','Ugrađen'],['Težina','1.450g (M)']],
    },
    {
      id: 'p_agv_k6', name: 'AGV K6 S Sport Integralka', slug: 'agv-k6-s',
      shortDescription: 'Sportska integralka vrhunske aerodinamike, carbon ljuska',
      description: 'AGV K6 S donosi race-proven tehnologiju na ulicu. Ultra-lagana carbon ljuska, Pinlock 120 vizir.',
      price: 74990, oldPrice: null, brand: 'AGV', sku: 'AGV-K6S-BLK',
      stockStatus: 'IN_STOCK' as const, stockQuantity: 8, isActive: true, isFeatured: true, categoryId: 'cat_kacige',
      images: ['https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80'],
      variants: ['S','M','L','XL'],
      specs: [['Homologacija','ECE 22.06'],['Ljuska','Carbon/Aramid'],['Težina','1.280g (M)']],
    },
    {
      id: 'p_bell_qualifier', name: 'Bell Qualifier DLX MIPS', slug: 'bell-qualifier-dlx-mips',
      shortDescription: 'Odličan odnos cena-kvalitet, MIPS sistem zaštite',
      description: 'Bell Qualifier DLX MIPS pruža solidnu zaštitu uz MIPS tehnologiju. Polycarbonate ljuska, Pinlock spreman vizir.',
      price: 34990, oldPrice: 39990, brand: 'Bell', sku: 'BELL-QDLX-GRY',
      stockStatus: 'IN_STOCK' as const, stockQuantity: 22, isActive: true, isFeatured: false, categoryId: 'cat_kacige',
      images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80'],
      variants: ['XS','S','M','L','XL'],
      specs: [['Homologacija','DOT / ECE 22.06'],['MIPS','Da']],
    },
    // JAKNE
    {
      id: 'p_alpinestars_andes', name: 'Alpinestars Andes V3 Adventure Jakna', slug: 'alpinestars-andes-v3',
      shortDescription: 'All-season adventure jakna, vodootporna, CE Level 2',
      description: 'Andes V3 je svestrana adventure jakna sa vodootpornom membranom, CE Level 2 štitnicima. Tri sloja ventilacije.',
      price: 59990, oldPrice: 69990, brand: 'Alpinestars', sku: 'ALP-AND3-BLK-L',
      stockStatus: 'IN_STOCK' as const, stockQuantity: 12, isActive: true, isFeatured: true, categoryId: 'cat_jakne',
      images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80'],
      variants: ['S','M','L','XL','XXL'],
      specs: [['CE zaštita','Level 2 (ruke i ramena)'],['Membrana','Vodootporna laminirana'],['Ventilacija','3 zone']],
    },
    {
      id: 'p_dainese_smart', name: 'Dainese Smart Jacket LS Airbag', slug: 'dainese-smart-jacket-ls',
      shortDescription: 'Jakna sa ugrađenim D-Air airbag sistemom',
      description: 'Smart Jacket LS integriše Dainese D-Air airbag sistem koji štiti grudni koš i leđa. Revolucija u zaštiti.',
      price: 99990, oldPrice: null, brand: 'Dainese', sku: 'DAN-SJ-LS-BLK',
      stockStatus: 'LOW_STOCK' as const, stockQuantity: 4, isActive: true, isFeatured: true, categoryId: 'cat_jakne',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
      variants: ['S','M','L','XL'],
      specs: [['Airbag','D-Air ugrađen'],['Aktivacija','Automatska']],
    },
    {
      id: 'p_revit_dominator', name: "REV'IT! Dominator 3 GTX Jakna", slug: 'revit-dominator-3-gtx',
      shortDescription: 'Gore-Tex jakna za sve uslove, CE Level 2',
      description: 'Dominator 3 GTX koristi originalnu Gore-Tex Pro membranu. CE Level 2 PWR|SPEED štitnici. Idealna za daleka putovanja.',
      price: 79990, oldPrice: 89990, brand: "REV'IT!", sku: 'REV-DOM3-GTX-L',
      stockStatus: 'IN_STOCK' as const, stockQuantity: 7, isActive: true, isFeatured: false, categoryId: 'cat_jakne',
      images: ['https://images.unsplash.com/photo-1609902726285-00668009f004?w=800&q=80'],
      variants: ['M','L','XL','XXL'],
      specs: [['Membrana','Gore-Tex Pro'],['CE zaštita','Level 2']],
    },
    // PANTALONE
    {
      id: 'p_alpinestars_andes_p', name: 'Alpinestars Andes V3 Pantalone', slug: 'alpinestars-andes-v3-pantalone',
      shortDescription: 'Adventure pantalone, vodootporne, CE Level 1',
      description: 'Andes V3 pantalone idealno se kombinuju sa Andes jaknom. CE Level 1 štitnici, ventilacija sa zipovima.',
      price: 35990, oldPrice: 39990, brand: 'Alpinestars', sku: 'ALP-AND3P-BLK-L',
      stockStatus: 'IN_STOCK' as const, stockQuantity: 18, isActive: true, isFeatured: true, categoryId: 'cat_pantalone',
      images: ['https://images.unsplash.com/photo-1609902726285-00668009f004?w=800&q=80'],
      variants: ['S','M','L','XL','XXL'],
      specs: [['CE zaštita','Level 1 (kolena i kukovi)'],['Membrana','Vodootporna']],
    },
    {
      id: 'p_revit_cayenne_p', name: "REV'IT! Cayenne Pro Pantalone", slug: 'revit-cayenne-pro-pantalone',
      shortDescription: 'Touring pantalone sa removable podstavom i CE Level 2',
      description: 'Cayenne Pro kombinuje polyester ljusku sa PWR|SHIELD materijalima. CE Level 2 štitnici, removable podstava.',
      price: 29990, oldPrice: null, brand: "REV'IT!", sku: 'REV-CAY-PRO-L',
      stockStatus: 'IN_STOCK' as const, stockQuantity: 14, isActive: true, isFeatured: false, categoryId: 'cat_pantalone',
      images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80'],
      variants: ['S','M','L','XL'],
      specs: [['CE zaštita','Level 2'],['Podstava','Removable thermal']],
    },
    // ČIZME
    {
      id: 'p_sidi_adventure', name: 'Sidi Adventure 2 Gore-Tex Čizme', slug: 'sidi-adventure-2-gore-tex',
      shortDescription: 'Premium adventure čizme, Gore-Tex, CE Level 2',
      description: 'Sidi Adventure 2 su referentne adventure čizme. Gore-Tex obloga, CE Level 2 zaštita, Tecno-3 kuka.',
      price: 39990, oldPrice: 44990, brand: 'Sidi', sku: 'SIDI-ADV2-GTX-42',
      stockStatus: 'IN_STOCK' as const, stockQuantity: 10, isActive: true, isFeatured: true, categoryId: 'cat_cizme',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
      variants: ['41','42','43','44','45'],
      specs: [['Membrana','Gore-Tex'],['CE zaštita','Level 2'],['Đon','Vibram non-slip'],['Visina','19cm']],
    },
    {
      id: 'p_alpinestars_corozal', name: 'Alpinestars Corozal Adventure Čizme', slug: 'alpinestars-corozal-adventure',
      shortDescription: 'Touring čizme sa vodootpornom membranom',
      description: 'Corozal Adventure nude odličan balans između zaštite i komfora. Waterproof membrana, TPU ankle zaštita.',
      price: 28990, oldPrice: 32990, brand: 'Alpinestars', sku: 'ALP-COR-ADV-42',
      stockStatus: 'IN_STOCK' as const, stockQuantity: 16, isActive: true, isFeatured: true, categoryId: 'cat_cizme',
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'],
      variants: ['41','42','43','44','45'],
      specs: [['Membrana','Waterproof'],['Zaštita','TPU ankle']],
    },
    {
      id: 'p_tcx_blend', name: 'TCX Blend WP Urban Čizme', slug: 'tcx-blend-wp-urban',
      shortDescription: 'Urban čizme — casual izgled, moto zaštita',
      description: 'TCX Blend WP kombinuje urbani stil sa solidnom moto zaštitom. CE Level 1, Vibram đon, waterproof membrana.',
      price: 18990, oldPrice: null, brand: 'TCX', sku: 'TCX-BLD-WP-42',
      stockStatus: 'IN_STOCK' as const, stockQuantity: 20, isActive: true, isFeatured: false, categoryId: 'cat_cizme',
      images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80'],
      variants: ['40','41','42','43','44','45'],
      specs: [['CE zaštita','Level 1'],['Membrana','Waterproof'],['Đon','Vibram']],
    },
  ]

  for (const p of products) {
    const { images, variants, specs, ...productData } = p
    
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { name: p.name, price: p.price, oldPrice: p.oldPrice, stockStatus: p.stockStatus, stockQuantity: p.stockQuantity },
      create: {
        ...productData,
        images: {
          create: images.map((url, i) => ({ url, alt: p.name, isPrimary: i === 0, sortOrder: i })),
        },
        variants: {
          create: variants.map(v => ({ type: 'SIZE' as const, value: v, stock: 3 })),
        },
        specifications: {
          create: specs.map(([label, value], i) => ({ label, value, sortOrder: i })),
        },
      },
    })
  }
  console.log('✅ 11 proizvoda kreirana')
  console.log('')
  console.log('🏍️  MotoStore.rs je spreman!')
  console.log('   Admin: admin@motostore.rs / admin123')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

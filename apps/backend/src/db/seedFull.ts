import bcrypt from 'bcryptjs';

export async function seedFullDatabase(db: any) {
  console.log('🌱 Starting Rajkanwari database seeder...');

// Clean existing data
const tablesToClean = [
  'offer_redemptions',
  'order_status_history',
  'order_items',
  'orders',
  'cart_items',
  'carts',
  'product_variants',
  'products',
  'categories',
  'banners',
  'offers',
  'addresses',
  'refresh_tokens',
  'customer_profiles',
  'audit_log',
  'users',
];

for (const table of tablesToClean) {
  try {
    await db.prepare(`DELETE FROM ${table}`).run();
  } catch (err) {
    // Ignore table missing errors
  }
}

console.log('ðŸ§¹ Existing data wiped.');

// â”€â”€ 1. Users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ownerPassword = process.env.RAJKANWARI_OWNER_PASSWORD || process.env.SHIKKIS_OWNER_PASSWORD || '123456';
const customerPassword = process.env.RAJKANWARI_CUSTOMER_PASSWORD || process.env.SHIKKIS_CUSTOMER_PASSWORD || '123456';

const ownerHash = bcrypt.hashSync(ownerPassword, 12);
const customerHash = bcrypt.hashSync(customerPassword, 12);

const insertUser = db.prepare(`
  INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active)
  VALUES (@id, @email, @password_hash, @first_name, @last_name, @phone, @role, @is_active)
`);

const insertProfile = db.prepare(`
  INSERT INTO customer_profiles (id, user_id, date_of_birth, total_orders, lifetime_spend, last_order_date)
  VALUES (@id, @user_id, @date_of_birth, @total_orders, @lifetime_spend, @last_order_date)
`);

const insertAddress = db.prepare(`
  INSERT INTO addresses (id, user_id, label, full_name, line1, line2, city, state, pincode, phone, is_default)
  VALUES (@id, @user_id, @label, @full_name, @line1, @line2, @city, @state, @pincode, @phone, @is_default)
`);

const ownerId = 'usr_owner_01';
await insertUser.run({
  id: ownerId,
  email: 'owner@rajkanwari.in',
  password_hash: ownerHash,
  first_name: 'Vikram',
  last_name: 'Singhania',
  phone: '9820011223',
  role: 'owner',
  is_active: 1,
});

const customers = [
  {
    id: 'usr_cust_01',
    email: 'priya@example.com',
    first_name: 'Priya',
    last_name: 'Sharma',
    phone: '9811122334',
    dob: '1992-05-14',
    orders: 4,
    spend: 3849900, // in paise
    last_order: '2026-03-01 14:30:00',
    address: {
      id: 'addr_01',
      label: 'Home',
      full_name: 'Priya Sharma',
      line1: 'Flat 402, Royale Palms, Bandra West',
      line2: 'Near Mehboob Studio',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      phone: '9811122334',
      is_default: 1,
    },
  },
  {
    id: 'usr_cust_02',
    email: 'rahul@example.com',
    first_name: 'Rahul',
    last_name: 'Verma',
    phone: '9822233445',
    dob: '1989-11-23',
    orders: 3,
    spend: 2199900,
    last_order: '2026-03-05 18:15:00',
    address: {
      id: 'addr_02',
      label: 'Office',
      full_name: 'Rahul Verma',
      line1: '12th Floor, Cyber City, DLF Phase 2',
      line2: 'Sector 24',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      phone: '9822233445',
      is_default: 1,
    },
  },
  {
    id: 'usr_cust_03',
    email: 'anita@example.com',
    first_name: 'Anita',
    last_name: 'Deshmukh',
    phone: '9833344556',
    dob: '1995-08-09',
    orders: 1,
    spend: 1450000,
    last_order: '2026-03-10 11:20:00',
    address: {
      id: 'addr_03',
      label: 'Residence',
      full_name: 'Anita Deshmukh',
      line1: 'Bungalow 7, Koregaon Park',
      line2: 'Lane 3',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      phone: '9833344556',
      is_default: 1,
    },
  },
];

for (const c of customers) {
  await insertUser.run({
    id: c.id,
    email: c.email,
    password_hash: customerHash,
    first_name: c.first_name,
    last_name: c.last_name,
    phone: c.phone,
    role: 'customer',
    is_active: 1,
  });

  await insertProfile.run({
    id: `prof_${c.id}`,
    user_id: c.id,
    date_of_birth: c.dob,
    total_orders: c.orders,
    lifetime_spend: c.spend,
    last_order_date: c.last_order,
  });

  await insertAddress.run({
    id: c.address.id,
    user_id: c.id,
    label: c.address.label,
    full_name: c.address.full_name,
    line1: c.address.line1,
    line2: c.address.line2,
    city: c.address.city,
    state: c.address.state,
    pincode: c.address.pincode,
    phone: c.address.phone,
    is_default: c.address.is_default,
  });
}


console.log('âœ… Users, profiles, and addresses seeded.');

// â”€â”€ 2. Categories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const categories = [
  {
    id: 'cat_anarkali',
    name: 'Anarkali',
    slug: 'anarkali',
    description: 'Bespoke floor-length Anarkali gowns and embroidered flared suit sets.',
    image_url: '/images/banner_scarlet_anarkali.jpg',
    display_order: 1,
  },
  {
    id: 'cat_croptop_skirt',
    name: 'Croptop Skirt',
    slug: 'croptop-skirt',
    description: 'Contemporary crop top skirt ensembles featuring modern hand embroidery.',
    image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    display_order: 2,
  },
  {
    id: 'cat_gown',
    name: 'Gown',
    slug: 'gown',
    description: 'Grand Indo-Western wedding and reception designer gowns.',
    image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    display_order: 3,
  },
  {
    id: 'cat_indo_western',
    name: 'Indo Western',
    slug: 'indo-western',
    description: 'Fusion silhouettes blending classic Rajasthani textures with modern cuts.',
    image_url: '/images/banner_whats_new.jpg',
    display_order: 4,
  },
  {
    id: 'cat_lehanga',
    name: 'Lehanga',
    slug: 'lehanga',
    description: 'Heritage bridal & festive lehengas featuring intricate zardozi and gota patti work.',
    image_url: '/images/banner_festive_trio.jpg',
    display_order: 5,
  },
  {
    id: 'cat_rajputi_poshak',
    name: 'Rajputi Poshak',
    slug: 'rajputi-poshak',
    description: 'Royal Jodhpur Rajputi Poshaks crafted with traditional danka and zari handwork.',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    display_order: 6,
  },
  {
    id: 'cat_saree',
    name: 'Saree',
    slug: 'saree',
    description: 'Timeless handloom, Banarasi, tissue silk, and pre-draped designer sarees.',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    display_order: 7,
  },
  {
    id: 'cat_sharara_suits',
    name: 'Sharara / Suits',
    slug: 'sharara-suits',
    description: 'Elaborate ghararas, sharara sets, and festive straight-cut suits.',
    image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    display_order: 8,
  },
  {
    id: 'cat_accessories',
    name: 'Tesols & Accessories',
    slug: 'accessories',
    description: 'Handcrafted latent tassels, latkans, potlis, and royal ethnic accessories.',
    image_url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    display_order: 9,
  },
];

const insertCategory = db.prepare(`
  INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active)
  VALUES (@id, @name, @slug, @description, @image_url, @display_order, 1)
`);

for (const cat of categories) {
  await insertCategory.run(cat);
}

console.log('✅ 9 Rajkanwari categories seeded.');

// â”€â”€ 3. Offers & Banners â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const insertOffer = db.prepare(`
  INSERT INTO offers (
    id, name, code, type, value, max_discount, min_cart_value,
    starts_at, ends_at, is_active, stackable, usage_limit, used_count,
    per_user_limit, scope, scope_ids, banner_image_url, priority, created_by
  ) VALUES (
    @id, @name, @code, @type, @value, @max_discount, @min_cart_value,
    @starts_at, @ends_at, @is_active, @stackable, @usage_limit, @used_count,
    @per_user_limit, @scope, @scope_ids, @banner_image_url, @priority, @created_by
  )
`);

const now = new Date();
const pastDate = new Date(now.getTime() - 30 * 86400000).toISOString();
const futureDate = new Date(now.getTime() + 60 * 86400000).toISOString();
const farFutureDate = new Date(now.getTime() + 180 * 86400000).toISOString();
const expiredDate = new Date(now.getTime() - 5 * 86400000).toISOString();

// 1. Running 10% auto-applied discount (or code SHIKKIS10)
await insertOffer.run({
  id: 'ofr_festive_10',
  name: 'Curated Heritage 10% Off',
  code: null, // null means auto-applied across the catalog!
  type: 'percent',
  value: 10,
  max_discount: 500000, // ₹5,000 max discount in paise
  min_cart_value: 199900, // ₹1,999 minimum order
  starts_at: pastDate,
  ends_at: futureDate,
  is_active: 1,
  stackable: 0,
  usage_limit: 1000,
  used_count: 84,
  per_user_limit: 2,
  scope: 'all',
  scope_ids: '[]',
  banner_image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
  priority: 10,
  created_by: ownerId,
});

// 2. Scheduled Diwali / Festival offer with banner
await insertOffer.run({
  id: 'ofr_diwali_grand',
  name: 'Royal Celebrations Flat ₹2,000 Off',
  code: 'ROYAL2000',
  type: 'flat',
  value: 200000, // ₹2,000 in paise
  max_discount: 200000,
  min_cart_value: 999900, // ₹9,999 minimum
  starts_at: now.toISOString(),
  ends_at: farFutureDate,
  is_active: 1,
  stackable: 0,
  usage_limit: 500,
  used_count: 12,
  per_user_limit: 1,
  scope: 'category',
  scope_ids: JSON.stringify(['cat_saree', 'cat_lehanga']),
  banner_image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80',
  priority: 5,
  created_by: ownerId,
});

// 3. Expired Offer
await insertOffer.run({
  id: 'ofr_newyear_expired',
  name: 'Early Bird Winter Sale',
  code: 'WINTER15',
  type: 'percent',
  value: 15,
  max_discount: 300000,
  min_cart_value: 499900,
  starts_at: '2025-12-01 00:00:00',
  ends_at: expiredDate,
  is_active: 0,
  stackable: 0,
  usage_limit: 200,
  used_count: 200,
  per_user_limit: 1,
  scope: 'all',
  scope_ids: '[]',
  banner_image_url: null,
  priority: 1,
  created_by: ownerId,
});

console.log('✅ 3 Offers seeded (1 running, 1 festival scheduled, 1 expired).');

// ── Banners for Home Hero Carousel ──────────────────────────────────────────
const insertBanner = db.prepare(`
  INSERT INTO banners (id, title, subtitle, image_url, cta_text, cta_link, text_alignment, display_order, starts_at, ends_at, is_active, created_by)
  VALUES (@id, @title, @subtitle, @image_url, @cta_text, @cta_link, @text_alignment, @display_order, @starts_at, @ends_at, 1, @created_by)
`);

const banners = [
  {
    id: 'bnr_01',
    title: 'Heritage Handloom Festive Edit',
    subtitle: 'Graceful emerald green suits, woven zari brocades & artisan dupattas for timeless celebrations.',
    image_url: '/images/banner_festive_trio.jpg',
    cta_text: 'EXPLORE FESTIVE COLLECTION',
    cta_link: '/catalog?occasion=Festive',
    text_alignment: 'left',
    display_order: 1,
  },
  {
    id: 'bnr_02',
    title: "Make Room For What's New",
    subtitle: 'Too Rajkunwari To Blend In. Discover our newest handcrafted arrivals & festive edits.',
    image_url: '/images/hero-timeless-elegance.jpg',
    cta_text: 'SHOP NEW ARRIVALS',
    cta_link: '/catalog?sort=newest',
    text_alignment: 'right',
    display_order: 2,
  },
  {
    id: 'bnr_03',
    title: 'The Royal Anarkali & Suit Edit',
    subtitle: 'Scarlet red silk flared Anarkalis & hand-embroidered heritage couture crafted for royalty.',
    image_url: '/images/banner_scarlet_anarkali.jpg',
    cta_text: 'SHOP ANARKALIS & SUITS',
    cta_link: '/catalog?category=anarkalis',
    text_alignment: 'right',
    display_order: 3,
  },
];

for (const b of banners) {
  await insertBanner.run({
    ...b,
    starts_at: pastDate,
    ends_at: farFutureDate,
    created_by: ownerId,
  });
}


console.log('âœ… 3 Hero Banners seeded.');

// â”€â”€ 4. Products and Variants (30 products) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const insertProduct = db.prepare(`
  INSERT INTO products (
    id, category_id, name, slug, description, long_description,
    fabric, occasion, gender, care_instructions, mrp, discount_percent,
    sku, images, is_active, is_featured
  ) VALUES (
    @id, @category_id, @name, @slug, @description, @long_description,
    @fabric, @occasion, @gender, @care_instructions, @mrp, @discount_percent,
    @sku, @images, 1, @is_featured
  )
`);

const insertVariant = db.prepare(`
  INSERT INTO product_variants (
    id, product_id, size, color, variant_sku, price_override, stock, weight_grams, is_active
  ) VALUES (
    @id, @product_id, @size, @color, @variant_sku, @price_override, @stock, @weight_grams, 1
  )
`);

// 43 rich, realistic products across all 9 Rajkanwari Categories
const productsData = [
  // SAREE (1-5)
  {
    id: 'prd_01',
    category_id: 'cat_saree',
    name: 'Champagne Floral Corset Pre-Draped Saree',
    slug: 'champagne-drape-saree',
    description: 'Pre-stitched champagne beige drape saree with floral threadwork embroidered corset bodice and sculpted pleats.',
    long_description: 'An elegant contemporary saree drape highlighting a sculpted corset bodice with delicate pastel floral embroidery.',
    fabric: 'Tissue Silk & Satin',
    occasion: 'Cocktail & Party, Weddings',
    gender: 'women',
    care_instructions: 'Strictly dry clean only.',
    mrp: 2899900,
    discount_percent: 10,
    sku: 'SHK-SAR-001',
    is_featured: 1,
    images: [
      '/images/products/champagne-drape-saree.jpg',
    ],
    variants: [
      { size: 'FREE_SIZE', color: 'Champagne Gold', stock: 8, override: null },
      { size: 'FREE_SIZE', color: 'Blush Cream', stock: 3, override: null },
    ],
  },
  {
    id: 'prd_03',
    category_id: 'cat_saree',
    name: 'Deep Emerald Teal Halter Corset Draped Saree',
    slug: 'emerald-halter-corset-saree',
    description: 'Fluid emerald teal drape saree featuring a halter-neck sequined corset blouse and sculpted pleats.',
    long_description: 'Modern luxury meets festive glamour in this deep teal draped saree paired with a shimmering halter-neck bustier.',
    fabric: 'Fluid Satin Silk & Sequin Bustier',
    occasion: 'Cocktail & Party, Reception',
    gender: 'women',
    care_instructions: 'Gentle dry clean only.',
    mrp: 2699900,
    discount_percent: 15,
    sku: 'SHK-SAR-003',
    is_featured: 1,
    images: [
      '/images/products/emerald-halter-saree.jpg',
    ],
    variants: [
      { size: 'FREE_SIZE', color: 'Emerald Teal', stock: 12, override: null },
      { size: 'FREE_SIZE', color: 'Bottle Green', stock: 5, override: null },
    ],
  },
  {
    id: 'prd_04',
    category_id: 'cat_saree',
    name: 'Royal Indigo Ajrakh Modal Silk Saree',
    slug: 'royal-indigo-ajrakh-modal-silk-saree',
    description: 'Natural dye 16-stage hand block printed Ajrakh saree with vegetable colors and zari patti.',
    long_description: 'Handcrafted in Kutch, this modal silk saree offers unmatched drape and softness, enriched with geometric stars and traditional floral patterns.',
    fabric: 'Natural Modal Silk',
    occasion: 'Festive & Casual',
    gender: 'women',
    care_instructions: 'Cold hand wash with mild shampoo or dry clean.',
    mrp: 999900,
    discount_percent: 0,
    sku: 'SHK-SAR-004',
    is_featured: 0,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'FREE_SIZE', color: 'Indigo Blue', stock: 15, override: null },
      { size: 'FREE_SIZE', color: 'Madder Red', stock: 7, override: null },
    ],
  },
  {
    id: 'prd_05',
    category_id: 'cat_saree',
    name: 'Midnight Black Chiffon Saree with Sequin Zari',
    slug: 'midnight-black-chiffon-saree',
    description: 'Glamorous pure chiffon saree detailed with hand-embellished self-toned sequin borders.',
    long_description: 'An ethereal evening ensemble designed for modern celebrations with effortless fluid movement and sparkling accents under evening lights.',
    fabric: 'Pure Silk Chiffon',
    occasion: 'Evening & Reception',
    gender: 'women',
    care_instructions: 'Dry clean only. Store wrapped in protective cloth.',
    mrp: 1499900,
    discount_percent: 10,
    sku: 'SHK-SAR-005',
    is_featured: 1,
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'FREE_SIZE', color: 'Midnight Black', stock: 10, override: null },
      { size: 'FREE_SIZE', color: 'Sapphire Navy', stock: 4, override: null },
    ],
  },
  {
    id: 'prd_06',
    category_id: 'cat_saree',
    name: 'Blush Pink Tussar Silk Saree with Kantha Stitch',
    slug: 'blush-pink-tussar-kantha-saree',
    description: 'Wild forest Tussar silk hand-embroidered with Bengal Kantha story motifs in pastel threads.',
    long_description: 'Celebrates Indian tribal handloom with natural beige sheen and intricate threadwork detailing peacocks, blooming lotus, and countryside foliage.',
    fabric: 'Pure Tussar Silk',
    occasion: 'Festive & Formal',
    gender: 'women',
    care_instructions: 'Dry clean only to protect delicate Kantha stitches.',
    mrp: 2199900,
    discount_percent: 12,
    sku: 'SHK-SAR-006',
    is_featured: 0,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'FREE_SIZE', color: 'Blush Pink', stock: 5, override: null },
      { size: 'FREE_SIZE', color: 'Natural Tussar Gold', stock: 3, override: null },
    ],
  },

  // ANARKALI (6-9)
  {
    id: 'prd_07',
    category_id: 'cat_anarkali',
    name: 'Blush Peach Embellished Cape & Anarkali Palazzo Set',
    slug: 'blush-peach-cape-set',
    description: 'Elegantly hand-embroidered blush peach corset bustier paired with wide flared Anarkali palazzo and flowing floor-length cape jacket.',
    long_description: 'An elegant ensemble combining a floral hand-embroidered corset bustier with a flowing floor-length cape jacket and wide pleated flared Anarkali pants.',
    fabric: 'Pure Georgette & Organza',
    occasion: 'Cocktail & Party, Festive',
    gender: 'women',
    care_instructions: 'Dry clean only.',
    mrp: 2499900,
    discount_percent: 15,
    sku: 'SHK-ANK-001',
    is_featured: 1,
    images: [
      '/images/products/peach-cape-set.jpg',
    ],
    variants: [
      { size: 'S', color: 'Blush Peach', stock: 4, override: null },
      { size: 'M', color: 'Blush Peach', stock: 7, override: null },
      { size: 'L', color: 'Blush Peach', stock: 5, override: null },
    ],
  },
  {
    id: 'prd_12',
    category_id: 'cat_anarkali',
    name: 'Sapphire Blue Silk Anarkali with Banarasi Dupatta',
    slug: 'sapphire-blue-silk-anarkali',
    description: 'Regal flare Anarkali in jewel blue silk complemented by a full woven Banarasi silk dupatta.',
    long_description: 'Features a fitted bodice with antique gold embroidery, full sleeves, and 4 meters of swirling flared flair.',
    fabric: 'Raw Silk & Katan Weave',
    occasion: 'Weddings & Reception',
    gender: 'women',
    care_instructions: 'Dry clean only.',
    mrp: 2750000,
    discount_percent: 20,
    sku: 'SHK-ANK-002',
    is_featured: 1,
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'S', color: 'Sapphire Blue', stock: 3, override: null },
      { size: 'M', color: 'Sapphire Blue', stock: 5, override: null },
      { size: 'L', color: 'Sapphire Blue', stock: 4, override: null },
    ],
  },
  {
    id: 'prd_31',
    category_id: 'cat_anarkali',
    name: 'Scarlet Crimson Layered Floor-Length Anarkali Gown',
    slug: 'scarlet-crimson-layered-anarkali',
    description: 'Floor-length scarlet crimson silk Anarkali featuring gold gota patti and multi-tiered swirling ghera.',
    long_description: 'A masterpiece in royal crimson crafted with 32 kalis and intricate gold zardozi embellishments along the jewel neckline.',
    fabric: 'Pure Mulberry Silk & Net Tulle',
    occasion: 'Weddings, Bridal & Festive',
    gender: 'women',
    care_instructions: 'Specialist dry clean only.',
    mrp: 3200000,
    discount_percent: 15,
    sku: 'SHK-ANK-003',
    is_featured: 1,
    images: [
      '/images/banner_scarlet_anarkali.jpg',
    ],
    variants: [
      { size: 'S', color: 'Scarlet Crimson', stock: 4, override: null },
      { size: 'M', color: 'Scarlet Crimson', stock: 6, override: null },
      { size: 'L', color: 'Scarlet Crimson', stock: 2, override: null },
    ],
  },
  {
    id: 'prd_32',
    category_id: 'cat_anarkali',
    name: 'Ivory Gold Gota Patti Georgette Anarkali Suit',
    slug: 'ivory-gold-gota-patti-anarkali',
    description: 'Ethereal ivory Anarkali suit enriched with Rajasthani gota patti handwork and zari dupatta.',
    long_description: 'Soft flowing ivory georgette with gold border detailing across the 5-meter flare, paired with fitted churidar.',
    fabric: 'Pure Viscose Georgette & Banarasi Tissue Dupatta',
    occasion: 'Haldi, Sangeet & Mehendi',
    gender: 'women',
    care_instructions: 'Dry clean only.',
    mrp: 2450000,
    discount_percent: 10,
    sku: 'SHK-ANK-004',
    is_featured: 0,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'S', color: 'Ivory Gold', stock: 5, override: null },
      { size: 'M', color: 'Ivory Gold', stock: 8, override: null },
      { size: 'L', color: 'Ivory Gold', stock: 3, override: null },
    ],
  },

  // CROPTOP SKIRT (10-12)
  {
    id: 'prd_09',
    category_id: 'cat_croptop_skirt',
    name: 'Tangerine Orange Embroidered Crop Top & Flared Skirt Set',
    slug: 'tangerine-orange-croptop-skirt-set',
    description: 'Vibrant tangerine orange embroidered crop top with high-waist flared tiered skirt and sheer dupatta drape.',
    long_description: 'An eye-catching festive co-ord set featuring a heavy zardozi embroidered crop top, wide flared skirt, and matching scarf.',
    fabric: 'Pure Georgette & Zardozi Threadwork',
    occasion: 'Haldi, Sangeet & Mehendi',
    gender: 'women',
    care_instructions: 'Strictly dry clean.',
    mrp: 1999900,
    discount_percent: 15,
    sku: 'SHK-CTS-001',
    is_featured: 1,
    images: [
      '/images/products/tangerine-palazzo-set.jpg',
    ],
    variants: [
      { size: 'XS', color: 'Tangerine Orange', stock: 3, override: null },
      { size: 'S', color: 'Tangerine Orange', stock: 6, override: null },
      { size: 'M', color: 'Tangerine Orange', stock: 9, override: null },
      { size: 'L', color: 'Tangerine Orange', stock: 4, override: null },
    ],
  },
  {
    id: 'prd_33',
    category_id: 'cat_croptop_skirt',
    name: 'Pastel Mint Zardozi Crop Top with Tiered Silk Skirt',
    slug: 'pastel-mint-zardozi-croptop-skirt',
    description: 'Contemporary mint green hand-embroidered crop top with a voluminous pleated silk skirt.',
    long_description: 'A modern silhouette featuring delicate silver zardozi embroidery on a cropped bodice, paired with a full ghera silk skirt.',
    fabric: 'Silk Georgette & Raw Silk Skirt',
    occasion: 'Cocktail & Party, Sangeet & Mehendi',
    gender: 'women',
    care_instructions: 'Dry clean only.',
    mrp: 2850000,
    discount_percent: 12,
    sku: 'SHK-CTS-002',
    is_featured: 1,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'S', color: 'Pastel Mint', stock: 5, override: null },
      { size: 'M', color: 'Pastel Mint', stock: 7, override: null },
      { size: 'L', color: 'Pastel Mint', stock: 3, override: null },
    ],
  },
  {
    id: 'prd_34',
    category_id: 'cat_croptop_skirt',
    name: 'Royal Velvet Corset Crop Top with Brocade Skirt',
    slug: 'royal-velvet-corset-croptop-skirt',
    description: 'Deep navy velvet corset top adorned with antique zari, paired with a gold Banarasi brocade skirt.',
    long_description: 'Opulent festive co-ord set designed for grand winter weddings and evening celebrations.',
    fabric: 'Silk Velvet & Banarasi Brocade',
    occasion: 'Weddings, Reception & Evening',
    gender: 'women',
    care_instructions: 'Dry clean only.',
    mrp: 3100000,
    discount_percent: 18,
    sku: 'SHK-CTS-003',
    is_featured: 1,
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'S', color: 'Midnight Navy & Gold', stock: 4, override: null },
      { size: 'M', color: 'Midnight Navy & Gold', stock: 6, override: null },
      { size: 'L', color: 'Midnight Navy & Gold', stock: 2, override: null },
    ],
  },

  // GOWN (13-16)
  {
    id: 'prd_02',
    category_id: 'cat_gown',
    name: 'Bronze Metallic Embellished Pre-Draped Saree Gown',
    slug: 'metallic-bronze-saree-gown',
    description: 'Statement metallic bronze pre-draped saree gown featuring an embellished asymmetrical corset blouse and flowing pallu.',
    long_description: 'High fashion pre-draped saree gown featuring hand-embellished sequins along the metallic metallic drape.',
    fabric: 'Metallic Satin Silk & Sequin Mesh',
    occasion: 'Weddings, Reception',
    gender: 'women',
    care_instructions: 'Dry clean only.',
    mrp: 3249900,
    discount_percent: 15,
    sku: 'SHK-GWN-001',
    is_featured: 1,
    images: [
      '/images/products/metallic-saree-gown.jpg',
    ],
    variants: [
      { size: 'FREE_SIZE', color: 'Bronze Gold', stock: 6, override: null },
      { size: 'FREE_SIZE', color: 'Gunmetal Silver', stock: 4, override: null },
    ],
  },
  {
    id: 'prd_13',
    category_id: 'cat_gown',
    name: 'Royal Wine Sequin Mermaid Gown with Cape',
    slug: 'wine-sequin-cape-gown',
    description: 'Deep wine purple flared mermaid gown with delicate grid cape, sweetheart corset neckline, and all-over metallic sequin embroidery.',
    long_description: 'A showstopping evening ensemble detailed with intricate sequin lattice work, a corseted bodice, and an ethereal sheer cape.',
    fabric: 'Net Tulle & Sequins',
    occasion: 'Sangeet & Mehendi, Cocktail',
    gender: 'women',
    care_instructions: 'Specialist dry clean only.',
    mrp: 3499900,
    discount_percent: 20,
    sku: 'SHK-GWN-002',
    is_featured: 1,
    images: [
      '/images/products/wine-embellished-gown.jpg',
    ],
    variants: [
      { size: 'S', color: 'Royal Wine', stock: 2, override: null },
      { size: 'M', color: 'Royal Wine', stock: 3, override: null },
      { size: 'L', color: 'Royal Wine', stock: 1, override: null },
    ],
  },
  {
    id: 'prd_35',
    category_id: 'cat_gown',
    name: 'Midnight Navy Off-Shoulder Embroidered Wedding Gown',
    slug: 'midnight-navy-offshoulder-wedding-gown',
    description: 'Sculpted off-shoulder midnight navy gown drenched in silver cutdana and glass bead embroidery.',
    long_description: 'Red-carpet glamour tailored with structured boning, an ornate sweetheart neckline, and a sweeping train.',
    fabric: 'Silk Satin & Sequin Net',
    occasion: 'Reception & Evening, Black-Tie',
    gender: 'women',
    care_instructions: 'Specialist dry clean only.',
    mrp: 4100000,
    discount_percent: 10,
    sku: 'SHK-GWN-003',
    is_featured: 1,
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'S', color: 'Midnight Navy', stock: 3, override: null },
      { size: 'M', color: 'Midnight Navy', stock: 5, override: null },
      { size: 'L', color: 'Midnight Navy', stock: 2, override: null },
    ],
  },
  {
    id: 'prd_36',
    category_id: 'cat_gown',
    name: 'Rose Gold Shimmer Indo-Western Reception Gown',
    slug: 'rose-gold-shimmer-reception-gown',
    description: 'Fluid rose gold metallic shimmer gown with a structured draped waist and crystal brooch detailing.',
    long_description: 'An Indo-Western evening dress featuring cascading pleats and a flattering defined waistline.',
    fabric: 'Metallic Lurex Jersey',
    occasion: 'Cocktail & Party, Reception',
    gender: 'women',
    care_instructions: 'Gentle dry clean only.',
    mrp: 3850000,
    discount_percent: 15,
    sku: 'SHK-GWN-004',
    is_featured: 0,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'S', color: 'Rose Gold', stock: 4, override: null },
      { size: 'M', color: 'Rose Gold', stock: 6, override: null },
      { size: 'L', color: 'Rose Gold', stock: 3, override: null },
    ],
  },

  // INDO WESTERN (17-22)
  {
    id: 'prd_08',
    category_id: 'cat_indo_western',
    name: 'Olive Gold Embroidered Vest & Sequin Flared Co-Ord Set',
    slug: 'olive-sequin-co-ord-set',
    description: 'Gold sequin flared bell-bottom pants paired with a metallic crop bustier, cut-out embroidered vest, and matching embroidered potli bag.',
    long_description: 'A dazzling festive ensemble featuring shimmering metallic co-ord trousers, an ornate cut-out vest jacket, and a matching embroidered potli bag.',
    fabric: 'Sequin Georgette & Velvet Vest',
    occasion: 'Cocktail & Party, Sangeet & Mehendi',
    gender: 'women',
    care_instructions: 'Gentle dry clean recommended.',
    mrp: 2299900,
    discount_percent: 12,
    sku: 'SHK-IDW-001',
    is_featured: 1,
    images: [
      '/images/products/olive-sequin-co-ord.jpg',
    ],
    variants: [
      { size: 'S', color: 'Olive Gold', stock: 8, override: null },
      { size: 'M', color: 'Olive Gold', stock: 12, override: null },
      { size: 'L', color: 'Olive Gold', stock: 6, override: null },
    ],
  },
  {
    id: 'prd_21',
    category_id: 'cat_indo_western',
    name: 'Saffron Raw Silk Flared High-Low Fusion Kurti',
    slug: 'saffron-raw-silk-flared-kurti',
    description: 'Modern Indo-Western fusion silhouette with flared peplum hem, structured stand collar and thread embroidered cuffs.',
    long_description: 'Contemporary festive styling engineered with structured tailoring and clean lines.',
    fabric: 'Matka Raw Silk',
    occasion: 'Pooja & Celebrations',
    gender: 'women',
    care_instructions: 'Dry clean only.',
    mrp: 720000,
    discount_percent: 0,
    sku: 'SHK-IDW-002',
    is_featured: 0,
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'S', color: 'Saffron', stock: 7, override: null },
      { size: 'M', color: 'Saffron', stock: 8, override: null },
      { size: 'L', color: 'Saffron', stock: 4, override: null },
    ],
  },
  {
    id: 'prd_26',
    category_id: 'cat_indo_western',
    name: 'Pastel Mint & Emerald Hand-Embroidered Kurta Set',
    slug: 'mens-festive-kurta-set',
    description: 'Designer men’s festive trio featuring a sky-blue mirror-work kurta, olive draped wrap suit, and emerald green palm jacket kurta.',
    long_description: 'Vibrant celebratory menswear featuring pastel mint silk embroidered kurtas, statement lapel jackets, and tailored trousers.',
    fabric: 'Chanderi Silk & Raw Silk',
    occasion: 'Weddings, Sangeet & Mehendi',
    gender: 'men',
    care_instructions: 'Strictly professional dry clean only.',
    mrp: 2799900,
    discount_percent: 15,
    sku: 'SHK-MEN-001',
    is_featured: 1,
    images: [
      '/images/products/mens-festive-trio.jpg',
    ],
    variants: [
      { size: 'M', color: 'Pastel Mint', stock: 3, override: null },
      { size: 'L', color: 'Emerald Green', stock: 4, override: null },
      { size: 'XL', color: 'Olive Yellow', stock: 2, override: null },
    ],
  },
  {
    id: 'prd_28',
    category_id: 'cat_indo_western',
    name: 'Heritage Refined Mauve & Navy Bandhgala Duo',
    slug: 'heritage-refined-mauve-navy-bandhgala',
    description: 'Bespoke men’s Heritage Refined bandhgala suits in dusty mauve silk and textured midnight navy embroidered velvet.',
    long_description: 'An iconic dual ensemble featuring tailored mandarin-neck jackets, subtle tonal thread embroidery, and fitted trousers.',
    fabric: 'Italian Wool & Pure Silk',
    occasion: 'Weddings, Reception & Formal',
    gender: 'men',
    care_instructions: 'Dry clean only.',
    mrp: 3899900,
    discount_percent: 10,
    sku: 'SHK-MEN-003',
    is_featured: 1,
    images: [
      '/images/products/heritage-refined-mens.jpg',
    ],
    variants: [
      { size: 'S', color: 'Dusty Mauve', stock: 6, override: null },
      { size: 'M', color: 'Dusty Mauve', stock: 9, override: null },
      { size: 'L', color: 'Midnight Navy', stock: 8, override: null },
      { size: 'XL', color: 'Midnight Navy', stock: 4, override: null },
    ],
  },
  {
    id: 'prd_29',
    category_id: 'cat_indo_western',
    name: 'Royal Black Embroidered Sash Tuxedo Suit',
    slug: 'royal-black-embroidered-sash-tuxedo',
    description: 'Black double-breasted tuxedo suit featuring hand-embroidered shoulder branch motifs and a tied satin waist sash.',
    long_description: 'High-fashion evening couture with a draped satin belt sash, satin shawl lapels, and exquisite hand-stitched floral branch work.',
    fabric: 'Bespoke Satin & Embroidered Velvet',
    occasion: 'Reception & Formal, Black-Tie',
    gender: 'men',
    care_instructions: 'Dry clean only.',
    mrp: 4699900,
    discount_percent: 12,
    sku: 'SHK-MEN-004',
    is_featured: 1,
    images: [
      '/images/products/black-tuxedo-suit.jpg',
      '/images/products/black-tuxedo-detail.jpg',
    ],
    variants: [
      { size: 'M', color: 'Royal Black', stock: 8, override: null },
      { size: 'L', color: 'Royal Black', stock: 11, override: null },
      { size: 'XL', color: 'Royal Black', stock: 5, override: null },
    ],
  },
  {
    id: 'prd_30',
    category_id: 'cat_indo_western',
    name: 'Timeless Dusty Mauve Embroidered Bandhgala Suit',
    slug: 'timeless-dusty-mauve-bandhgala',
    description: 'Understated elegant dusty mauve bandhgala suit with vertical placket detailing and subtle leaf embroidery.',
    long_description: 'Timeless elegance designed for daytime weddings and formal celebrations.',
    fabric: 'Chanderi Silk & Resham Thread',
    occasion: 'Weddings, Reception & Formal',
    gender: 'men',
    care_instructions: 'Hand wash in cold water or dry clean.',
    mrp: 3599900,
    discount_percent: 15,
    sku: 'SHK-MEN-005',
    is_featured: 1,
    images: [
      '/images/products/timeless-mauve-bandhgala.jpg',
    ],
    variants: [
      { size: 'S', color: 'Dusty Mauve', stock: 8, override: null },
      { size: 'M', color: 'Dusty Mauve', stock: 14, override: null },
      { size: 'L', color: 'Dusty Mauve', stock: 9, override: null },
      { size: 'XL', color: 'Dusty Mauve', stock: 5, override: null },
    ],
  },

  // LEHANGA (23-26)
  {
    id: 'prd_14',
    category_id: 'cat_lehanga',
    name: 'Rani Pink Zardozi Hand-Embroidered Bridal Lehenga',
    slug: 'rani-pink-bridal-lehanga',
    description: 'Majestic rani pink / magenta bridal lehenga choli hand-crafted with zardozi, resham threadwork, and scalloped border dupatta.',
    long_description: 'Heirloom bridal couture in vibrant rani pink featuring handcrafted zardozi embroidery across the expansive flared kalis.',
    fabric: 'Raw Silk & Fine Net',
    occasion: 'Bridal & Festive, Weddings',
    gender: 'women',
    care_instructions: 'Specialist dry clean only.',
    mrp: 5499900,
    discount_percent: 10,
    sku: 'SHK-LHG-002',
    is_featured: 1,
    images: [
      '/images/products/magenta-bridal-lehenga.jpg',
    ],
    variants: [
      { size: 'XS', color: 'Rani Pink', stock: 2, override: null },
      { size: 'S', color: 'Rani Pink', stock: 4, override: null },
      { size: 'M', color: 'Rani Pink', stock: 3, override: null },
    ],
  },
  {
    id: 'prd_15',
    category_id: 'cat_lehanga',
    name: 'Dusty Rose Mirror-Work & Cutdana Bridal Lehenga',
    slug: 'dusty-rose-mirror-lehanga',
    description: 'Blush pink / dusty rose flared net lehenga drenched in genuine Kutch mirror-work and cutdana sequins.',
    long_description: 'An ethereal dusty rose lehenga with intricate mirror kalis, ornate choker-style neckline blouse, and sheer net dupatta.',
    fabric: 'Fine Net Tulle & Mirror Work',
    occasion: 'Weddings, Sangeet & Mehendi',
    gender: 'women',
    care_instructions: 'Dry clean only.',
    mrp: 4899900,
    discount_percent: 10,
    sku: 'SHK-LHG-003',
    is_featured: 1,
    images: [
      '/images/products/dusty-rose-mirror-lehenga.jpg',
    ],
    variants: [
      { size: 'S', color: 'Dusty Rose', stock: 3, override: null },
      { size: 'M', color: 'Dusty Rose', stock: 5, override: null },
      { size: 'L', color: 'Dusty Rose', stock: 2, override: null },
    ],
  },
  {
    id: 'prd_16',
    category_id: 'cat_lehanga',
    name: 'Marigold Yellow Mirror Work Mehendi Lehenga',
    slug: 'marigold-yellow-mirror-work-lehanga',
    description: 'Radiant sunny yellow flared lehenga with genuine Kutch abhla mirror embellishment and tassels.',
    long_description: 'Brimming with joy and movement, ideal for sunlit haldi ceremonies and poolside mehendi parties.',
    fabric: 'Georgette & Crepe',
    occasion: 'Haldi & Mehendi',
    gender: 'women',
    care_instructions: 'Dry clean only.',
    mrp: 3600000,
    discount_percent: 18,
    sku: 'SHK-LHG-004',
    is_featured: 0,
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'S', color: 'Marigold Yellow', stock: 4, override: null },
      { size: 'M', color: 'Marigold Yellow', stock: 6, override: null },
      { size: 'L', color: 'Marigold Yellow', stock: 3, override: null },
    ],
  },
  {
    id: 'prd_17',
    category_id: 'cat_lehanga',
    name: 'Lavender Whisper Organza Floral Printed Lehenga',
    slug: 'lavender-whisper-organza-lehanga',
    description: 'Botanical watercolour print on silk organza with delicate pearl and sitara hand embroidery.',
    long_description: 'Light as a summer breeze, with 16-meter ghera volume supported by soft cancan layers.',
    fabric: 'Silk Organza',
    occasion: 'Destination Wedding',
    gender: 'women',
    care_instructions: 'Gentle dry clean only.',
    mrp: 4200000,
    discount_percent: 10,
    sku: 'SHK-LHG-005',
    is_featured: 1,
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'XS', color: 'Lavender', stock: 3, override: null },
      { size: 'S', color: 'Lavender', stock: 5, override: null },
      { size: 'M', color: 'Lavender', stock: 4, override: null },
    ],
  },

  // RAJPUTI POSHAK (27-30)
  {
    id: 'prd_27',
    category_id: 'cat_rajputi_poshak',
    name: 'Royal Ivory & Sage Embroidered Sherwani & Poshak Set',
    slug: 'mens-shadi-fits-sherwani-poshak',
    description: 'Bespoke groom and wedding fits featuring ivory chikankari tunics, sage embroidered bundi jackets, and royal open Rajputi poshak accents.',
    long_description: 'Part of the signature Shadi Fits collection, showcasing hand-embroidered raw silk sherwanis and tailored Jodhpuri royal poshaks.',
    fabric: 'Pure Raw Silk & Zari Threads',
    occasion: 'Bridal & Festive, Weddings',
    gender: 'men',
    care_instructions: 'Dry clean only. Steam press.',
    mrp: 4299900,
    discount_percent: 10,
    sku: 'SHK-RJP-001',
    is_featured: 1,
    images: [
      '/images/products/mens-shadi-fits.jpg',
    ],
    variants: [
      { size: 'S', color: 'Royal Ivory', stock: 4, override: null },
      { size: 'M', color: 'Royal Ivory', stock: 7, override: null },
      { size: 'L', color: 'Sage Embroidered', stock: 5, override: null },
      { size: 'XL', color: 'Cream Gold', stock: 3, override: null },
    ],
  },
  {
    id: 'prd_37',
    category_id: 'cat_rajputi_poshak',
    name: 'Royal Crimson Pure Silk Heavy Rajputi Poshak with Danka Work',
    slug: 'royal-crimson-danka-rajputi-poshak',
    description: 'Traditional Jodhpur Rajputi poshak in crimson silk adorned with metal danka, gota patti, and heavy Odhani.',
    long_description: 'Heirloom Rajasthani royal apparel featuring hand-hammered danka metal work along the kurti, kanchali, lehenga, and full Odhani.',
    fabric: 'Pure Pure Silk Satin & Zari Odhani',
    occasion: 'Weddings, Bridal & Festive',
    gender: 'women',
    care_instructions: 'Specialist dry clean only. Store wrapped in cotton.',
    mrp: 4500000,
    discount_percent: 10,
    sku: 'SHK-RJP-002',
    is_featured: 1,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'FREE_SIZE', color: 'Royal Crimson', stock: 4, override: null },
      { size: 'FREE_SIZE', color: 'Rani Magenta', stock: 2, override: null },
    ],
  },
  {
    id: 'prd_38',
    category_id: 'cat_rajputi_poshak',
    name: 'Kesariya Gold Royal Jodhpur Poshak with Zari Dupatta',
    slug: 'kesariya-gold-jodhpur-poshak',
    description: 'Traditional saffron Kesariya gold poshak set crafted in rich georgette with intricate silver and gold marodi embroidery.',
    long_description: 'Inspired by authentic Marwari heritage, featuring dense marodi threadwork on the kanchali bodice and flared ghera.',
    fabric: 'Pure Georgette & Handloom Tissue',
    occasion: 'Festive & Royal Ceremonies',
    gender: 'women',
    care_instructions: 'Dry clean only.',
    mrp: 3950000,
    discount_percent: 12,
    sku: 'SHK-RJP-003',
    is_featured: 1,
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'FREE_SIZE', color: 'Kesariya Gold', stock: 5, override: null },
    ],
  },
  {
    id: 'prd_39',
    category_id: 'cat_rajputi_poshak',
    name: 'Emerald Green Bandhej Rajputi Poshak with Gota Patti',
    slug: 'emerald-green-bandhej-poshak',
    description: 'Vibrant emerald green tie-dye Bandhej poshak detailed with authentic Jaipur silver gota lace.',
    long_description: 'Celebrates traditional Rajasthani bandhani artistry on pure gajji silk with gleaming silver borders.',
    fabric: 'Gajji Silk Bandhej & Sheer Odhani',
    occasion: 'Sangeet & Mehendi, Pooja',
    gender: 'women',
    care_instructions: 'Dry clean only.',
    mrp: 3690000,
    discount_percent: 15,
    sku: 'SHK-RJP-004',
    is_featured: 0,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'FREE_SIZE', color: 'Emerald Green', stock: 6, override: null },
    ],
  },

  // SHARARA / SUITS (31-36)
  {
    id: 'prd_10',
    category_id: 'cat_sharara_suits',
    name: 'Mustard Yellow Bandhani Silk Suit with Gota Patti',
    slug: 'mustard-yellow-bandhani-suit',
    description: 'Traditional Gujarati tie-and-dye pure silk suit adorned with handmade Jaipur gota patti.',
    long_description: 'Hand-tied Bandhani dots on pure gajji silk with heavy gota lace on the dupatta and neckline.',
    fabric: 'Pure Gajji Silk',
    occasion: 'Haldi & Festive',
    gender: 'women',
    care_instructions: 'Dry clean only.',
    mrp: 1650000,
    discount_percent: 0,
    sku: 'SHK-SRS-001',
    is_featured: 0,
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'S', color: 'Mustard Yellow', stock: 5, override: null },
      { size: 'M', color: 'Mustard Yellow', stock: 8, override: null },
      { size: 'L', color: 'Mustard Yellow', stock: 2, override: null },
    ],
  },
  {
    id: 'prd_11',
    category_id: 'cat_sharara_suits',
    name: 'Dusty Rose Raw Silk Angrakha Sharara Suit Set',
    slug: 'dusty-rose-raw-silk-angrakha-sharara',
    description: 'Cross-over Angrakha silhouette in Bhagalpur raw silk with threadwork and tasseled dori ties paired with flared sharara.',
    long_description: 'An asymmetrical masterpiece detailed with micro-pearls and paired with flared sharara pants and a hand-painted floral organza dupatta.',
    fabric: 'Bhagalpur Raw Silk',
    occasion: 'Pooja & Celebrations',
    gender: 'women',
    care_instructions: 'Dry clean only.',
    mrp: 2100000,
    discount_percent: 15,
    sku: 'SHK-SRS-002',
    is_featured: 0,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'S', color: 'Dusty Rose', stock: 4, override: null },
      { size: 'M', color: 'Dusty Rose', stock: 7, override: null },
      { size: 'L', color: 'Dusty Rose', stock: 5, override: null },
    ],
  },
  {
    id: 'prd_18',
    category_id: 'cat_sharara_suits',
    name: 'Hand-Block Printed Chanderi A-Line Suit',
    slug: 'hand-block-chanderi-aline-suit',
    description: 'Bagh block printed silk-cotton tunic with mandarin collar and hand-carved mother-of-pearl buttons paired with straight pants.',
    long_description: 'Versatile everyday luxury that pairs seamlessly with straight trousers, palazzos, or denim for an elevated aesthetic.',
    fabric: 'Chanderi Silk Cotton',
    occasion: 'Casual & Office',
    gender: 'women',
    care_instructions: 'Hand wash separately in cold water with liquid soap.',
    mrp: 499900,
    discount_percent: 15,
    sku: 'SHK-SRS-003',
    is_featured: 0,
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'S', color: 'Indigo White', stock: 15, override: null },
      { size: 'M', color: 'Indigo White', stock: 20, override: null },
      { size: 'L', color: 'Indigo White', stock: 14, override: null },
    ],
  },
  {
    id: 'prd_19',
    category_id: 'cat_sharara_suits',
    name: 'Chikankari Hand-Embroidered Georgette Sharara Suit',
    slug: 'chikankari-georgette-sharara-suit',
    description: 'Authentic Lucknowi bakhiya and phanda stitches on pastel georgette tunic with matching multi-tier sharara.',
    long_description: 'Heritage hand embroidery from the lanes of Lucknow, boasting 32 traditional needle stitches on breathable georgette.',
    fabric: 'Viscose Georgette with Cotton Slip',
    occasion: 'Festive & Daytime',
    gender: 'women',
    care_instructions: 'Gentle hand wash or dry clean.',
    mrp: 649900,
    discount_percent: 20,
    sku: 'SHK-SRS-004',
    is_featured: 1,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'S', color: 'Peach Sorbet', stock: 10, override: null },
      { size: 'M', color: 'Peach Sorbet', stock: 12, override: null },
      { size: 'L', color: 'Peach Sorbet', stock: 7, override: null },
    ],
  },
  {
    id: 'prd_20',
    category_id: 'cat_sharara_suits',
    name: 'Crimson Silk Velvet Suit with Zari Border',
    slug: 'crimson-silk-velvet-suit',
    description: 'Opulent silk velvet kurta with antique gold cord embroidery paired with straight velvet pants.',
    long_description: 'Pair with brocade trousers for intimate festive dinners or winter weddings.',
    fabric: 'Pure Silk Velvet',
    occasion: 'Festive & Evening',
    gender: 'women',
    care_instructions: 'Dry clean only.',
    mrp: 899900,
    discount_percent: 10,
    sku: 'SHK-SRS-005',
    is_featured: 0,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'S', color: 'Crimson', stock: 6, override: null },
      { size: 'M', color: 'Crimson', stock: 9, override: null },
      { size: 'L', color: 'Crimson', stock: 5, override: null },
    ],
  },

  // TESOLS & ACCESSORIES (37-42)
  {
    id: 'prd_22',
    category_id: 'cat_accessories',
    name: 'Pure Katan Banarasi Silk Floral Jaal Dupatta',
    slug: 'katan-banarasi-silk-jaal-dupatta',
    description: 'Regal Banarasi odhani woven in antique gold zari with floral Shikargah and meenakari highlights.',
    long_description: 'Elevates any simple suit or lehenga into a statement festive ensemble with 2.5 meters of heirloom weaving.',
    fabric: 'Pure Katan Silk',
    occasion: 'Weddings & Celebrations',
    gender: 'women',
    care_instructions: 'Dry clean only. Roll in muslin.',
    mrp: 1450000,
    discount_percent: 15,
    sku: 'SHK-ACC-001',
    is_featured: 1,
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'FREE_SIZE', color: 'Red Gold', stock: 12, override: null },
      { size: 'FREE_SIZE', color: 'Emerald Gold', stock: 8, override: null },
    ],
  },
  {
    id: 'prd_23',
    category_id: 'cat_accessories',
    name: 'Handcrafted Amritsari Phulkari Silk Dupatta',
    slug: 'amritsari-phulkari-silk-dupatta',
    description: 'Geometric darn-stitch embroidery using vibrant pat silk floss on natural chinon base.',
    long_description: 'An authentic tribute to Punjab folklore, featuring joyful kaleidoscopic blooms and gold gota fringes.',
    fabric: 'Chinon Silk',
    occasion: 'Festive & Sangeet',
    gender: 'women',
    care_instructions: 'Gentle dry clean only.',
    mrp: 850000,
    discount_percent: 20,
    sku: 'SHK-ACC-002',
    is_featured: 0,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'FREE_SIZE', color: 'Multicolor Rani', stock: 10, override: null },
      { size: 'FREE_SIZE', color: 'Multicolor Black', stock: 6, override: null },
    ],
  },
  {
    id: 'prd_24',
    category_id: 'cat_accessories',
    name: 'Hand-Painted Kalamkari Tussar Silk Dupatta',
    slug: 'handpainted-kalamkari-tussar-dupatta',
    description: 'Srikalahasti pen Kalamkari depicting mythological flora and fauna with natural dyes.',
    long_description: 'Pure wearable art, each piece takes 15 days of organic milk processing and vegetable pigment hand-painting.',
    fabric: 'Pure Tussar Silk',
    occasion: 'Formal & Cultural',
    gender: 'unisex',
    care_instructions: 'Strictly dry clean.',
    mrp: 1199900,
    discount_percent: 10,
    sku: 'SHK-ACC-003',
    is_featured: 0,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'FREE_SIZE', color: 'Earthy Ochre', stock: 5, override: null },
      { size: 'FREE_SIZE', color: 'Indigo Forest', stock: 4, override: null },
    ],
  },
  {
    id: 'prd_25',
    category_id: 'cat_accessories',
    name: 'Sheer Organza Dupatta with Scalloped Gota Borders',
    slug: 'sheer-organza-scalloped-dupatta',
    description: 'Featherlight pastel organza finished with hand-cut triangular gota laces and pearl tassels.',
    long_description: 'An effortless accent for summer weddings and daytime celebrations with crisp translucency.',
    fabric: 'Silk Organza',
    occasion: 'Casual & Festive',
    gender: 'women',
    care_instructions: 'Dry clean only.',
    mrp: 450000,
    discount_percent: 0,
    sku: 'SHK-ACC-004',
    is_featured: 0,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'FREE_SIZE', color: 'Blush Ivory', stock: 15, override: null },
      { size: 'FREE_SIZE', color: 'Mint Green', stock: 9, override: null },
    ],
  },
  {
    id: 'prd_40',
    category_id: 'cat_accessories',
    name: 'Hand-Carved Royal Latkan & Tassel Set (Tesols)',
    slug: 'royal-latkan-tassel-tesols-set',
    description: 'Handcrafted pair of heavy zardozi, pearl, and metallic bead tassels (Tesols) for bridal lehengas and poshaks.',
    long_description: 'Bespoke Rajasthani tassel latkans designed to be tied on lehenga waist dori string ties.',
    fabric: 'Zardozi, Freshwater Pearls & Gold Threads',
    occasion: 'Bridal & Festive',
    gender: 'women',
    care_instructions: 'Store wrapped in velvet box.',
    mrp: 350000,
    discount_percent: 10,
    sku: 'SHK-ACC-005',
    is_featured: 1,
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'FREE_SIZE', color: 'Antique Gold', stock: 20, override: null },
      { size: 'FREE_SIZE', color: 'Ruby Red & Gold', stock: 15, override: null },
    ],
  },
  {
    id: 'prd_41',
    category_id: 'cat_accessories',
    name: 'Heritage Embroidered Velvet Potli Bag with Pearl Handle',
    slug: 'heritage-embroidered-velvet-potli-bag',
    description: 'Royal velvet drawstring potli pouch embellished with gold dabka handwork and cultured pearl wristlet strand.',
    long_description: 'An elegant wedding accessory designed to hold essentials while complementing festive ensembles.',
    fabric: 'Silk Velvet & Pearl Hardware',
    occasion: 'Weddings & Reception',
    gender: 'women',
    care_instructions: 'Spot clean only.',
    mrp: 599900,
    discount_percent: 15,
    sku: 'SHK-ACC-006',
    is_featured: 1,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { size: 'FREE_SIZE', color: 'Crimson Red', stock: 12, override: null },
      { size: 'FREE_SIZE', color: 'Emerald Green', stock: 8, override: null },
    ],
  },
];

for (const p of productsData) {
  await insertProduct.run({
    id: p.id,
    category_id: p.category_id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    long_description: p.long_description,
    fabric: p.fabric,
    occasion: p.occasion,
    gender: p.gender,
    care_instructions: p.care_instructions,
    mrp: p.mrp,
    discount_percent: p.discount_percent,
    sku: p.sku,
    images: JSON.stringify(p.images),
    is_featured: p.is_featured,
  });

  for (let i = 0; i < p.variants.length; i++) {
    const v = p.variants[i];
    const varSku = `${p.sku}-${v.size}-${v.color.replace(/\s+/g, '').toUpperCase()}`;
    await insertVariant.run({
      id: `var_${p.id}_${i + 1}`,
      product_id: p.id,
      size: v.size,
      color: v.color,
      variant_sku: varSku,
      price_override: v.override,
      stock: v.stock,
      weight_grams: 850,
    });
  }
}


console.log('✅ All products and variants seeded across all 9 Rajkanwari categories.');

// â”€â”€ 5. Orders (8 orders covering all statuses, fulfillment, and payment states)
const insertOrder = db.prepare(`
  INSERT INTO orders (
    id, order_number, user_id, subtotal, discount_amount, shipping_cost, tax, total_amount,
    fulfillment_type, delivery_address_snapshot, pickup_slot, payment_status, payment_method,
    razorpay_order_id, razorpay_payment_id, order_status, customer_notes, internal_notes
  ) VALUES (
    @id, @order_number, @user_id, @subtotal, @discount_amount, @shipping_cost, @tax, @total_amount,
    @fulfillment_type, @delivery_address_snapshot, @pickup_slot, @payment_status, @payment_method,
    @razorpay_order_id, @razorpay_payment_id, @order_status, @customer_notes, @internal_notes
  )
`);

const insertOrderItem = db.prepare(`
  INSERT INTO order_items (
    id, order_id, variant_id, product_name, size, color, quantity, price_at_purchase, discount_at_purchase
  ) VALUES (
    @id, @order_id, @variant_id, @product_name, @size, @color, @quantity, @price_at_purchase, @discount_at_purchase
  )
`);

const insertStatusHistory = db.prepare(`
  INSERT INTO order_status_history (id, order_id, status, note, changed_by)
  VALUES (@id, @order_id, @status, @note, @changed_by)
`);

const sampleOrders = [
  {
    id: 'ord_001',
    order_number: 'SHK-2026-0001',
    user_id: 'usr_cust_01',
    subtotal: 2464900,
    discount_amount: 246490,
    shipping_cost: 0,
    tax: 110920,
    total_amount: 2329330,
    fulfillment_type: 'delivery',
    delivery_address_snapshot: JSON.stringify(customers[0].address),
    pickup_slot: null,
    payment_status: 'paid',
    payment_method: 'online',
    razorpay_order_id: 'order_Rp01A1',
    razorpay_payment_id: 'pay_Rp01A1B2',
    order_status: 'delivered',
    customer_notes: 'Please ring bell before 4 PM.',
    internal_notes: 'VIP customer. Delivered via BlueDart Express.',
    items: [
      {
        id: 'oit_01',
        variant_id: 'var_prd_01_1',
        product_name: 'Crimson Vermilion Katan Silk Banarasi Saree',
        size: 'FREE_SIZE',
        color: 'Crimson Red',
        quantity: 1,
        price: 2464900,
        discount: 246490,
      },
    ],
  },
  {
    id: 'ord_002',
    order_number: 'SHK-2026-0002',
    user_id: 'usr_cust_02',
    subtotal: 1387400,
    discount_amount: 138740,
    shipping_cost: 15000,
    tax: 62433,
    total_amount: 1326093,
    fulfillment_type: 'delivery',
    delivery_address_snapshot: JSON.stringify(customers[1].address),
    pickup_slot: null,
    payment_status: 'paid',
    payment_method: 'online',
    razorpay_order_id: 'order_Rp02A2',
    razorpay_payment_id: 'pay_Rp02A2B3',
    order_status: 'out_for_delivery',
    customer_notes: null,
    internal_notes: 'Tracking ID: DTDC987654321',
    items: [
      {
        id: 'oit_02',
        variant_id: 'var_prd_08_2',
        product_name: 'Ivory Chanderi Straight Kurta & Palazzo Set',
        size: 'M',
        color: 'Ivory Gold',
        quantity: 1,
        price: 1169900,
        discount: 116990,
      },
    ],
  },
  {
    id: 'ord_003',
    order_number: 'SHK-2026-0003',
    user_id: 'usr_cust_01',
    subtotal: 3105000,
    discount_amount: 310500,
    shipping_cost: 0,
    tax: 139725,
    total_amount: 2934225,
    fulfillment_type: 'pickup',
    delivery_address_snapshot: null,
    pickup_slot: '2026-03-18 16:00 - 18:00',
    payment_status: 'paid',
    payment_method: 'online',
    razorpay_order_id: 'order_Rp03A3',
    razorpay_payment_id: 'pay_Rp03A3B4',
    order_status: 'ready_for_pickup',
    customer_notes: 'Will pick up in person at Colaba boutique.',
    internal_notes: 'Packed in bridal gold gift box.',
    items: [
      {
        id: 'oit_03',
        variant_id: 'var_prd_02_1',
        product_name: 'Mustard Gold Handwoven Kanjivaram Silk Saree',
        size: 'FREE_SIZE',
        color: 'Mustard Gold',
        quantity: 1,
        price: 3105000,
        discount: 310500,
      },
    ],
  },
  {
    id: 'ord_004',
    order_number: 'SHK-2026-0004',
    user_id: 'usr_cust_03',
    subtotal: 1387500,
    discount_amount: 0,
    shipping_cost: 0,
    tax: 69375,
    total_amount: 1456875,
    fulfillment_type: 'delivery',
    delivery_address_snapshot: JSON.stringify(customers[2].address),
    pickup_slot: null,
    payment_status: 'pending',
    payment_method: 'cod',
    razorpay_order_id: null,
    razorpay_payment_id: null,
    order_status: 'confirmed',
    customer_notes: 'Cash on delivery payment confirmed via phone.',
    internal_notes: 'Verified customer by phone on 15 March.',
    items: [
      {
        id: 'oit_04',
        variant_id: 'var_prd_09_2',
        product_name: 'Teal Green Georgette Sharara Set with Mirror Work',
        size: 'S',
        color: 'Teal Green',
        quantity: 1,
        price: 1387500,
        discount: 0,
      },
    ],
  },
  {
    id: 'ord_005',
    order_number: 'SHK-2026-0005',
    user_id: 'usr_cust_02',
    subtotal: 7650000,
    discount_amount: 765000,
    shipping_cost: 0,
    tax: 344250,
    total_amount: 7229250,
    fulfillment_type: 'pickup',
    delivery_address_snapshot: null,
    pickup_slot: '2026-03-19 14:00 - 16:00',
    payment_status: 'paid',
    payment_method: 'online',
    razorpay_order_id: 'order_Rp05A5',
    razorpay_payment_id: 'pay_Rp05A5B6',
    order_status: 'picked_up',
    customer_notes: null,
    internal_notes: 'Customer collected on 14 March. Signed receipt filed.',
    items: [
      {
        id: 'oit_05',
        variant_id: 'var_prd_13_2',
        product_name: 'Royal Heritage Scarlet Red Bridal Lehenga',
        size: 'M',
        color: 'Scarlet Red',
        quantity: 1,
        price: 7650000,
        discount: 765000,
      },
    ],
  },
  {
    id: 'ord_006',
    order_number: 'SHK-2026-0006',
    user_id: 'usr_cust_01',
    subtotal: 3314900,
    discount_amount: 331490,
    shipping_cost: 0,
    tax: 149170,
    total_amount: 3132580,
    fulfillment_type: 'delivery',
    delivery_address_snapshot: JSON.stringify(customers[0].address),
    pickup_slot: null,
    payment_status: 'paid',
    payment_method: 'online',
    razorpay_order_id: 'order_Rp06A6',
    razorpay_payment_id: 'pay_Rp06A6B7',
    order_status: 'placed',
    customer_notes: 'Please add gift wrap with note: Happy Anniversary Mom & Dad!',
    internal_notes: 'Awaiting warehouse pick list.',
    items: [
      {
        id: 'oit_06',
        variant_id: 'var_prd_27_2',
        product_name: 'Midnight Navy Velvet Bandhgala Jodhpuri Suit',
        size: 'M',
        color: 'Midnight Navy',
        quantity: 1,
        price: 3314900,
        discount: 331490,
      },
    ],
  },
  {
    id: 'ord_007',
    order_number: 'SHK-2026-0007',
    user_id: 'usr_cust_02',
    subtotal: 1232500,
    discount_amount: 0,
    shipping_cost: 15000,
    tax: 55462,
    total_amount: 1302962,
    fulfillment_type: 'delivery',
    delivery_address_snapshot: JSON.stringify(customers[1].address),
    pickup_slot: null,
    payment_status: 'failed',
    payment_method: 'online',
    razorpay_order_id: 'order_Rp07A7',
    razorpay_payment_id: null,
    order_status: 'cancelled',
    customer_notes: null,
    internal_notes: 'Bank declined transaction (insufficient funds / timeout).',
    items: [
      {
        id: 'oit_07',
        variant_id: 'var_prd_22_1',
        product_name: 'Pure Katan Banarasi Silk Floral Jaal Dupatta',
        size: 'FREE_SIZE',
        color: 'Red Gold',
        quantity: 1,
        price: 1232500,
        discount: 0,
      },
    ],
  },
  {
    id: 'ord_008',
    order_number: 'SHK-2026-0008',
    user_id: 'usr_cust_03',
    subtotal: 1479900,
    discount_amount: 147990,
    shipping_cost: 0,
    tax: 66595,
    total_amount: 1398505,
    fulfillment_type: 'delivery',
    delivery_address_snapshot: JSON.stringify(customers[2].address),
    pickup_slot: null,
    payment_status: 'refunded',
    payment_method: 'online',
    razorpay_order_id: 'order_Rp08A8',
    razorpay_payment_id: 'pay_Rp08A8B9',
    order_status: 'cancelled',
    customer_notes: 'Requested cancellation due to color preference change.',
    internal_notes: 'Refund of â‚¹13,985.05 processed via Razorpay refund API.',
    items: [
      {
        id: 'oit_08',
        variant_id: 'var_prd_03_1',
        product_name: 'Pastel Sage Organza Saree with Cutwork Border',
        size: 'FREE_SIZE',
        color: 'Sage Green',
        quantity: 1,
        price: 1479900,
        discount: 147990,
      },
    ],
  },
];

for (const o of sampleOrders) {
  await insertOrder.run({
    id: o.id,
    order_number: o.order_number,
    user_id: o.user_id,
    subtotal: o.subtotal,
    discount_amount: o.discount_amount,
    shipping_cost: o.shipping_cost,
    tax: o.tax,
    total_amount: o.total_amount,
    fulfillment_type: o.fulfillment_type,
    delivery_address_snapshot: o.delivery_address_snapshot,
    pickup_slot: o.pickup_slot,
    payment_status: o.payment_status,
    payment_method: o.payment_method,
    razorpay_order_id: o.razorpay_order_id,
    razorpay_payment_id: o.razorpay_payment_id,
    order_status: o.order_status,
    customer_notes: o.customer_notes,
    internal_notes: o.internal_notes,
  });

  for (const itm of o.items) {
    await insertOrderItem.run({
      id: itm.id,
      order_id: o.id,
      variant_id: itm.variant_id,
      product_name: itm.product_name,
      size: itm.size,
      color: itm.color,
      quantity: itm.quantity,
      price_at_purchase: itm.price,
      discount_at_purchase: itm.discount,
    });
  }

  await insertStatusHistory.run({
    id: `his_${o.id}`,
    order_id: o.id,
    status: o.order_status,
    note: `Order status set to ${o.order_status}`,
    changed_by: ownerId,
  });
}


console.log('âœ… 8 Sample Orders (covering all order_status, payment_status, & fulfillment_types) seeded.');
console.log('ðŸŽ‰ Seeding successfully completed!');

}

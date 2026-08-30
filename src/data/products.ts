import { Product, ProductCategory } from '@/types';

export const products: Product[] = [
  // Necklaces
  {
    id: 'p1',
    slug: 'celestial-pearl-necklace',
    name: 'Celestial Pearl Necklace',
    category: 'Necklaces',
    price: 2450,
    currency: 'BDT',
    shortDescription: 'A graceful pearl necklace with a refined gold-tone finish.',
    description: 'The Celestial Pearl Necklace exudes understated elegance. Delicate pearl drops are suspended from a refined gold-tone chain, making it a polished choice for evening soirees and celebrations.',
    material: 'Gold-tone finish with pearl accents',
    color: 'Gold/White',
    finish: 'Polished',
    occasion: ['Evening Wear', 'Wedding Guest', 'Anniversary'],
    productCode: 'AJ-N001',
    images: [
      '/images/source/pexels-pearl-necklace-set-33370257.jpg',
      '/images/source/photo-1599643478518-a784e5dc4c8f.jpg'
    ],
    featured: true,
    newArrival: false,
    bestSeller: true,
    availability: 'Ask About Availability',
    collection: 'necklaces'
  },
  {
    id: 'p2',
    slug: 'aurelia-layered-necklace',
    name: 'Aurelia Layered Necklace',
    category: 'Necklaces',
    price: 3200,
    currency: 'BDT',
    shortDescription: 'Multi-layered gold-tone necklace for a bohemian luxe vibe.',
    description: 'Make a statement without saying a word. The Aurelia features three cascading layers of intricately designed chains and subtle charms, offering a curated layered look in one effortless clasp.',
    material: 'Layered gold-tone finish with textured details',
    color: 'Gold',
    finish: 'Matte Gold',
    occasion: ['Party', 'Casual Chic'],
    productCode: 'AJ-N002',
    images: [
      '/images/source/photo-1506630448388-4e683c67ddb0.jpg',
      '/images/source/photo-1630019852942-f89202989a59.jpg'
    ],
    featured: true,
    newArrival: false,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'necklaces'
  },
  {
    id: 'p3',
    slug: 'golden-bloom-choker',
    name: 'Golden Bloom Choker',
    category: 'Necklaces',
    price: 1850,
    currency: 'BDT',
    shortDescription: 'A chic floral-inspired choker that sits beautifully on the collarbone.',
    description: 'Embrace nature\'s beauty with the Golden Bloom Choker. Featuring a sequence of stylized gold petals, this snug-fitting piece adds a touch of glamour to both traditional and modern outfits.',
    material: 'Gold-tone floral detail',
    color: 'Gold',
    finish: 'Polished',
    occasion: ['Festive', 'Party'],
    productCode: 'AJ-N003',
    images: [
      '/images/source/pexels-gold-choker-6228276.jpg',
      '/images/source/photo-1611085583191-a3b181a88401.jpg'
    ],
    featured: false,
    newArrival: true,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'necklaces'
  },
  {
    id: 'p4',
    slug: 'serene-pendant-necklace',
    name: 'Serene Pendant Necklace',
    category: 'Necklaces',
    price: 1650,
    currency: 'BDT',
    shortDescription: 'Minimalist pendant necklace featuring a central clear crystal.',
    description: 'Perfect for everyday luxury. The Serene Pendant Necklace offers a clean, minimal pendant silhouette with a bright center accent and a durable chain.',
    material: 'Silver-tone finish with clear crystal accent',
    color: 'Gold/Clear',
    finish: 'Polished',
    occasion: ['Everyday', 'Work Wear'],
    productCode: 'AJ-N004',
    images: [
      '/images/source/photo-1610694955371-d4a3e0ce4b52.jpg',
      '/images/source/photo-1630019852942-f89202989a59.jpg'
    ],
    featured: false,
    newArrival: false,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'necklaces'
  },

  // Earrings
  {
    id: 'p5',
    slug: 'pearl-drop-earrings',
    name: 'Pearl Drop Earrings',
    category: 'Earrings',
    price: 1250,
    currency: 'BDT',
    shortDescription: 'Classic pearl drop earrings that never go out of style.',
    description: 'Elegance simplified. These Pearl Drop Earrings feature lustrous pearl-inspired drops suspended from a sleek gold-tone hook, providing a gentle sway with your every movement.',
    material: 'Gold-tone finish with pearl drops',
    color: 'Gold/White',
    finish: 'Polished',
    occasion: ['Office', 'Formal Dinner'],
    productCode: 'AJ-E001',
    images: [
      '/images/source/pexels-pearl-drop-earrings-23495777.jpg',
      '/images/source/photo-1535556116002-6281ff3e9f36.jpg'
    ],
    featured: true,
    newArrival: false,
    bestSeller: true,
    availability: 'Ask About Availability',
    collection: 'earrings'
  },
  {
    id: 'p6',
    slug: 'aurora-crystal-earrings',
    name: 'Aurora Crystal Earrings',
    category: 'Earrings',
    price: 1450,
    currency: 'BDT',
    shortDescription: 'Dazzling crystal cluster earrings for a night out.',
    description: 'Catch every eye in the room with the Aurora Crystal Earrings. The intricate cluster arrangement of faceted crystals creates an unmatched sparkle, making them the ultimate evening accessory.',
    material: 'Silver-tone finish with crystal clusters',
    color: 'Silver/Clear',
    finish: 'Brilliant',
    occasion: ['Party', 'Wedding Guest'],
    productCode: 'AJ-E002',
    images: [
      '/images/source/pexels-diamond-earrings-2849743.jpg',
      '/images/source/photo-1617038260897-41a1f14a8ca0.jpg'
    ],
    featured: false,
    newArrival: true,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'earrings'
  },
  {
    id: 'p7',
    slug: 'floral-gold-tone-studs',
    name: 'Floral Gold-Tone Studs',
    category: 'Earrings',
    price: 950,
    currency: 'BDT',
    shortDescription: 'Delicate floral studs for everyday elegance.',
    description: 'The perfect finishing touch for a subtle look. These floral studs are intricately carved with a soft matte finish, bringing a hint of nature-inspired beauty to your daily ensemble.',
    material: 'Gold-tone floral finish',
    color: 'Gold',
    finish: 'Matte Gold',
    occasion: ['Everyday', 'Casual'],
    productCode: 'AJ-E003',
    images: [
      '/images/source/pexels-stud-earrings-5370641.jpg',
      '/images/source/photo-1617038260897-41a1f14a8ca0.jpg'
    ],
    featured: false,
    newArrival: false,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'earrings'
  },
  {
    id: 'p8',
    slug: 'moonlight-hoop-earrings',
    name: 'Moonlight Hoop Earrings',
    category: 'Earrings',
    price: 1350,
    currency: 'BDT',
    shortDescription: 'Modern twisted hoop earrings in glowing gold.',
    description: 'A contemporary twist on a classic favorite. The Moonlight Hoops feature a slightly textured, twisted design that reflects light beautifully, offering a bold yet refined aesthetic.',
    material: 'Textured gold-tone finish',
    color: 'Gold',
    finish: 'Textured Polished',
    occasion: ['Brunch', 'Evening Out'],
    productCode: 'AJ-E004',
    images: [
      '/images/source/pexels-hoop-earrings-18075558.jpg',
      '/images/source/photo-1617038260897-41a1f14a8ca0.jpg'
    ],
    featured: true,
    newArrival: false,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'earrings'
  },

  // Rings
  {
    id: 'p9',
    slug: 'eternal-bloom-ring',
    name: 'Eternal Bloom Ring',
    category: 'Rings',
    price: 1150,
    currency: 'BDT',
    shortDescription: 'A statement ring featuring a blooming flower motif.',
    description: 'Bold and beautiful, the Eternal Bloom Ring is a true conversation starter. The intricate petal design wraps elegantly around the finger, crafted to perfection for those who love unique jewelry.',
    material: 'Gold-tone floral finish',
    color: 'Gold',
    finish: 'Brushed Gold',
    occasion: ['Party', 'Festive'],
    productCode: 'AJ-R001',
    images: [
      '/images/source/photo-1611591437281-460bfbe1220a.jpg',
      '/images/source/photo-1543294001-f7cd5d7fb516.jpg'
    ],
    featured: true,
    newArrival: true,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'rings'
  },
  {
    id: 'p10',
    slug: 'celeste-crystal-ring',
    name: 'Celeste Crystal Ring',
    category: 'Rings',
    price: 1350,
    currency: 'BDT',
    shortDescription: 'An elegant solitaire ring surrounded by a subtle pave band.',
    description: 'Embodying pure sophistication, the Celeste Crystal Ring features a brilliant-cut center stone set atop a slender band adorned with micro-crystals. A timeless piece of luxury.',
    material: 'Silver-tone finish with crystal accent',
    color: 'Silver/Clear',
    finish: 'Polished',
    occasion: ['Engagement', 'Anniversary', 'Formal Event'],
    productCode: 'AJ-R002',
    images: [
      '/images/source/photo-1543294001-f7cd5d7fb516.jpg',
      '/images/source/photo-1611591437281-460bfbe1220a.jpg'
    ],
    featured: false,
    newArrival: false,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'rings'
  },
  {
    id: 'p11',
    slug: 'minimal-halo-ring',
    name: 'Minimal Halo Ring',
    category: 'Rings',
    price: 980,
    currency: 'BDT',
    shortDescription: 'A dainty halo ring perfect for stacking or solo wear.',
    description: 'Simplicity meets brilliance in the Minimal Halo Ring. Designed for the modern minimalist, this slender gold ring with a tiny crystal halo adds just the right amount of sparkle.',
    material: 'Gold-tone finish with halo accent',
    color: 'Gold',
    finish: 'Polished',
    occasion: ['Everyday', 'Work'],
    productCode: 'AJ-R003',
    images: [
      '/images/source/photo-1543294001-f7cd5d7fb516.jpg',
      '/images/source/photo-1611591437281-460bfbe1220a.jpg'
    ],
    featured: false,
    newArrival: false,
    bestSeller: true,
    availability: 'Ask About Availability',
    collection: 'rings'
  },

  // Bangles
  {
    id: 'p12',
    slug: 'royal-heritage-bangle-set',
    name: 'Royal Heritage Bangle Set',
    category: 'Bangles',
    price: 3850,
    currency: 'BDT',
    shortDescription: 'A luxurious set of heavily detailed traditional bangles.',
    description: 'Step into a world of tradition with the Royal Heritage Bangle Set. Detailed with filigree work and embedded with small stone accents, these bangles are the quintessential accessory for any festive occasion.',
    material: 'Antique gold-tone finish with filigree details',
    color: 'Antique Gold',
    finish: 'Antique',
    occasion: ['Wedding', 'Festive'],
    productCode: 'AJ-B001',
    images: [
      '/images/source/pexels-gold-bangles-12579906.jpg',
      '/images/source/photo-1573408301185-9146fe634ad0.jpg'
    ],
    featured: true,
    newArrival: false,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'bangles'
  },
  {
    id: 'p13',
    slug: 'golden-vine-bangles',
    name: 'Golden Vine Bangles',
    category: 'Bangles',
    price: 2650,
    currency: 'BDT',
    shortDescription: 'Sleek bangles featuring a delicate vine pattern.',
    description: 'The Golden Vine Bangles bring a touch of nature to your wrist. The intertwined vine motif creates a beautiful texture that reflects light dynamically, suitable for mixing with other bracelets.',
    material: 'Gold-tone finish with vine detailing',
    color: 'Gold',
    finish: 'Polished/Matte Contrast',
    occasion: ['Party', 'Cultural Event'],
    productCode: 'AJ-B002',
    images: [
      '/images/source/photo-1573408301185-9146fe634ad0.jpg',
      '/images/source/photo-1605100804763-247f67b3557e.jpg'
    ],
    featured: false,
    newArrival: true,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'bangles'
  },
  {
    id: 'p14',
    slug: 'classic-textured-bangles',
    name: 'Classic Textured Bangles',
    category: 'Bangles',
    price: 2200,
    currency: 'BDT',
    shortDescription: 'Everyday bangles with a hammered gold finish.',
    description: 'Versatile and durable, these Classic Textured Bangles feature a hammered surface that gives them a rustic yet refined look. Perfect for daily wear or stacking for a bolder statement.',
    material: 'Gold-tone hammered finish',
    color: 'Gold',
    finish: 'Hammered',
    occasion: ['Everyday', 'Casual Outing'],
    productCode: 'AJ-B003',
    images: [
      '/images/source/pexels-textured-bangles-37485309.jpg',
      '/images/source/photo-1573408301185-9146fe634ad0.jpg'
    ],
    featured: false,
    newArrival: false,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'bangles'
  },

  // Bracelets
  {
    id: 'p15',
    slug: 'luna-charm-bracelet',
    name: 'Luna Charm Bracelet',
    category: 'Bracelets',
    price: 1550,
    currency: 'BDT',
    shortDescription: 'A delicate chain bracelet adorned with crescent and star charms.',
    description: 'Reach for the stars with the Luna Charm Bracelet. Its fine chain is dotted with celestial-themed charms that dangle playfully, making it a sweet and meaningful gift or personal treat.',
    material: 'Silver-tone finish with celestial charms',
    color: 'Silver',
    finish: 'Polished',
    occasion: ['Casual', 'Gift'],
    productCode: 'AJ-BR001',
    images: [
      '/images/source/photo-1573408301185-9146fe634ad0.jpg',
      '/images/source/photo-1622398925373-3f91b1e275f5.jpg'
    ],
    featured: true,
    newArrival: false,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'bracelets'
  },
  {
    id: 'p16',
    slug: 'pearl-grace-bracelet',
    name: 'Pearl Grace Bracelet',
    category: 'Bracelets',
    price: 1750,
    currency: 'BDT',
    shortDescription: 'An elegant bracelet featuring a row of pristine pearls.',
    description: 'Timeless grace defined. The Pearl Grace Bracelet lines up carefully selected pearl-inspired accents along a delicate gold-toned chain, bringing classic sophistication to any outfit.',
    material: 'Gold-tone finish with pearl accents',
    color: 'Gold/White',
    finish: 'Polished',
    occasion: ['Formal', 'Dinner Date'],
    productCode: 'AJ-BR002',
    images: [
      '/images/source/photo-1622398925373-3f91b1e275f5.jpg',
      '/images/source/photo-1573408301185-9146fe634ad0.jpg'
    ],
    featured: false,
    newArrival: true,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'bracelets'
  },

  // Pendants
  {
    id: 'p17',
    slug: 'teardrop-sapphire-pendant',
    name: 'Teardrop Sapphire Pendant',
    category: 'Pendants',
    price: 1850,
    currency: 'BDT',
    shortDescription: 'A captivating teardrop pendant with a deep blue center stone.',
    description: 'Channel royal elegance with the Teardrop Sapphire Pendant. The deep blue center accent is surrounded by a halo of clear crystals, hanging gracefully from a silver-tone chain.',
    material: 'Silver-tone finish with blue stone accent',
    color: 'Silver/Blue',
    finish: 'Polished',
    occasion: ['Evening Event', 'Anniversary'],
    productCode: 'AJ-P001',
    images: [
      '/images/source/photo-1610694955371-d4a3e0ce4b52.jpg',
      '/images/source/photo-1630019852942-f89202989a59.jpg'
    ],
    featured: true,
    newArrival: false,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'pendants'
  },
  {
    id: 'p18',
    slug: 'heart-of-gold-pendant',
    name: 'Heart of Gold Pendant',
    category: 'Pendants',
    price: 1450,
    currency: 'BDT',
    shortDescription: 'A minimalist hollow heart pendant on a fine gold chain.',
    description: 'Wear your heart out beautifully. This minimalist open-heart pendant features a smooth, polished gold-tone finish that adds a subtle, romantic accent to your everyday wardrobe.',
    material: 'Gold-tone finish',
    color: 'Gold',
    finish: 'Polished',
    occasion: ['Everyday', 'Gift'],
    productCode: 'AJ-P002',
    images: [
      '/images/source/photo-1630019852942-f89202989a59.jpg',
      '/images/source/photo-1610694955371-d4a3e0ce4b52.jpg'
    ],
    featured: false,
    newArrival: false,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'pendants'
  },

  // Bridal Sets
  {
    id: 'p19',
    slug: 'noor-bridal-jewelry-set',
    name: 'Noor Bridal Jewelry Set',
    category: 'Bridal Sets',
    price: 12500,
    currency: 'BDT',
    shortDescription: 'A majestic heavy bridal set including necklace, earrings, and a tikka.',
    description: 'The Noor Bridal Set is designed for the modern queen. Featuring intricate kundan-inspired stone work and cascading pearls, this grand set ensures you look breathtaking on your special day.',
    material: 'Traditional gold-tone finish with pearl detailing',
    color: 'Gold/Kundan',
    finish: 'Antique Gold',
    occasion: ['Wedding', 'Reception'],
    productCode: 'AJ-BS001',
    images: [
      '/images/source/pexels-bridal-set-28347075.jpg',
      '/images/source/photo-1519741497674-611481863552.jpg'
    ],
    featured: true,
    newArrival: false,
    bestSeller: true,
    availability: 'Made to Order',
    collection: 'bridal'
  },
  {
    id: 'p20',
    slug: 'maharani-statement-set',
    name: 'Maharani Statement Set',
    category: 'Bridal Sets',
    price: 15800,
    currency: 'BDT',
    shortDescription: 'An opulent choker-style bridal set with rich ruby-red accents.',
    description: 'Make an unforgettable entrance. The Maharani Statement Set combines a wide, heavily embellished choker with matching oversized jhumkas, highlighted with vibrant ruby-red stones for a classic royal look.',
    material: 'Antique gold-tone finish with red stone accents',
    color: 'Antique Gold/Red',
    finish: 'Antique',
    occasion: ['Wedding'],
    productCode: 'AJ-BS002',
    images: [
      '/images/source/pexels-bridal-set-28347079.jpg',
      '/images/source/photo-1596944924616-7b38e7cfac36.jpg'
    ],
    featured: true,
    newArrival: false,
    bestSeller: false,
    availability: 'Made to Order',
    collection: 'bridal'
  },
  {
    id: 'p21',
    slug: 'ivory-pearl-bridal-set',
    name: 'Ivory Pearl Bridal Set',
    category: 'Bridal Sets',
    price: 9800,
    currency: 'BDT',
    shortDescription: 'A sophisticated and delicate pearl-heavy bridal set.',
    description: 'For the bride who favors elegance over heaviness. The Ivory Pearl Bridal Set features layers of lustrous pearls combined with delicate crystal detailing, offering a graceful and refined bridal look.',
    material: 'Silver-tone finish with pearl detailing',
    color: 'Silver/White',
    finish: 'Polished',
    occasion: ['Engagement', 'Walima'],
    productCode: 'AJ-BS003',
    images: [
      '/images/source/pexels-pearl-bridal-set-6716445.jpg',
      '/images/source/photo-1519741497674-611481863552.jpg'
    ],
    featured: false,
    newArrival: true,
    bestSeller: false,
    availability: 'Made to Order',
    collection: 'bridal'
  },

  // Jewelry Sets
  {
    id: 'p22',
    slug: 'rosewood-celebration-set',
    name: 'Rosewood Celebration Set',
    category: 'Jewelry Sets',
    price: 5450,
    currency: 'BDT',
    shortDescription: 'A versatile mid-weight set featuring a necklace and matching earrings.',
    description: 'Perfect for festive gatherings, the Rosewood Celebration Set features a rose-gold tone finish adorned with clear and champagne-colored stones, delivering a warm and inviting sparkle.',
    material: 'Rose-gold tone finish with crystal accents',
    color: 'Rose Gold',
    finish: 'Polished',
    occasion: ['Party', 'Festive'],
    productCode: 'AJ-JS001',
    images: [
      '/images/source/pexels-rose-gold-set-5116272.jpg',
      '/images/source/photo-1506630448388-4e683c67ddb0.jpg'
    ],
    featured: true,
    newArrival: false,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'jewelry-sets'
  },
  {
    id: 'p23',
    slug: 'golden-petal-jewelry-set',
    name: 'Golden Petal Jewelry Set',
    category: 'Jewelry Sets',
    price: 4800,
    currency: 'BDT',
    shortDescription: 'A contemporary floral-themed set with a sleek aesthetic.',
    description: 'Modern yet timeless. This set includes a collar necklace and stud earrings modeled after abstract floral petals. The smooth gold finish makes it highly versatile for various dress codes.',
    material: 'Gold-tone finish with floral accents',
    color: 'Gold',
    finish: 'Smooth Matte',
    occasion: ['Dinner Party', 'Cultural Event'],
    productCode: 'AJ-JS002',
    images: [
      '/images/source/pexels-gold-floral-set-29385412.jpg',
      '/images/source/photo-1611085583191-a3b181a88401.jpg'
    ],
    featured: false,
    newArrival: true,
    bestSeller: false,
    availability: 'Ask About Availability',
    collection: 'jewelry-sets'
  },
  {
    id: 'p24',
    slug: 'sapphire-elegance-set',
    name: 'Sapphire Elegance Set',
    category: 'Jewelry Sets',
    price: 6200,
    currency: 'BDT',
    shortDescription: 'A glamorous silver-tone set accented with deep blue stones.',
    description: 'Exude sophistication with the Sapphire Elegance Set. The matching necklace and drop earrings feature brilliant blue center accents enveloped by sparkling clear crystals, perfect for formal events.',
    material: 'Silver-tone finish with blue stone accents',
    color: 'Silver/Blue',
    finish: 'Brilliant',
    occasion: ['Formal Event', 'Gala'],
    productCode: 'AJ-JS003',
    images: [
      '/images/source/pexels-sapphire-set-32988651.jpg',
      '/images/source/photo-1610694955371-d4a3e0ce4b52.jpg'
    ],
    featured: false,
    newArrival: false,
    bestSeller: true,
    availability: 'Ask About Availability',
    collection: 'jewelry-sets'
  }
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(product => product.slug === slug);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter(product => product.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(product => product.featured);
}

export function getNewArrivals(): Product[] {
  return products.filter(product => product.newArrival);
}

export function getBestSellers(): Product[] {
  return products.filter(product => product.bestSeller);
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.productCode.toLowerCase().includes(lowercaseQuery) ||
      product.shortDescription.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      Boolean(product.collection?.toLowerCase().includes(lowercaseQuery)) ||
      Boolean(product.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery)))
  );
}

export function getRelatedProducts(product: Product, limit: number = 4): Product[] {
  return products
    .filter(p => p.id !== product.id && (p.category === product.category || p.collection === product.collection))
    .slice(0, limit);
}

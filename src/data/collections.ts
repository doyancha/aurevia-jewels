import { Collection } from '@/types';

export const collections: Collection[] = [
  {
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Elegant necklaces designed to elevate your everyday and occasion wear.',
    image: '/images/source/photo-1611085583191-a3b181a88401.jpg',
    category: 'Necklaces',
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    description: 'From classic studs to statement drops, discover earrings that frame your face beautifully.',
    image: '/images/source/photo-1617038260897-41a1f14a8ca0.jpg',
    category: 'Earrings',
  },
  {
    name: 'Rings',
    slug: 'rings',
    description: 'Discover rings that make a statement or add a subtle touch of grace.',
    image: '/images/source/photo-1543294001-f7cd5d7fb516.jpg',
    category: 'Rings',
  },
  {
    name: 'Bangles',
    slug: 'bangles',
    description: 'Timeless bangles featuring intricate traditional craftsmanship and modern flair.',
    image: '/images/source/photo-1605100804763-247f67b3557e.jpg',
    category: 'Bangles',
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Charming bracelets perfect for stacking or wearing elegantly on their own.',
    image: '/images/source/photo-1622398925373-3f91b1e275f5.jpg',
    category: 'Bracelets',
  },
  {
    name: 'Pendants',
    slug: 'pendants',
    description: 'Delicate and meaningful pendants for a minimal, sophisticated look.',
    image: '/images/source/photo-1630019852942-f89202989a59.jpg',
    category: 'Pendants',
  },
  {
    name: 'Bridal Sets',
    slug: 'bridal',
    description: 'Opulent bridal jewelry sets to make you shine on your most special day.',
    image: '/images/source/pexels-bridal-set-28347078.jpg',
    category: 'Bridal Sets',
  },
  {
    name: 'Jewelry Sets',
    slug: 'jewelry-sets',
    description: 'Coordinated jewelry sets to complete your look effortlessly.',
    image: '/images/source/photo-1506630448388-4e683c67ddb0.jpg',
    category: 'Jewelry Sets',
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((collection) => collection.slug === slug);
}

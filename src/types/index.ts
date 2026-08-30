export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  currency: string;
  shortDescription: string;
  description: string;
  longDescription?: string;
  material: string;
  color: string;
  finish: string;
  dimensions?: string;
  occasion: string[];
  tags?: string[];
  productCode: string;
  code?: string;
  images: string[];
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  availability: 'Ask About Availability' | 'Made to Order';
  collection?: string;
  badges?: string[];
}

export type ProductCategory = 'Necklaces' | 'Earrings' | 'Rings' | 'Bangles' | 'Bracelets' | 'Pendants' | 'Bridal Sets' | 'Jewelry Sets';

export interface Collection {
  name: string;
  slug: string;
  description: string;
  image: string;
  category: ProductCategory;
  title?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  productPurchased?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}
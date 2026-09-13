import type { Product } from '@/types';

export function getFeaturedProducts(products: Product[]) { return products.filter((product) => product.featured); }
export function getNewArrivals(products: Product[]) { return products.filter((product) => product.newArrival); }
export function getBestSellers(products: Product[]) { return products.filter((product) => product.bestSeller); }
export function getProductsByCollection(products: Product[], collectionSlug: string) {
  return products.filter((product) => product.collections?.some((collection) => collection.slug === collectionSlug) || product.collection === collectionSlug);
}
export function searchProducts(products: Product[], query: string) {
  const lowercaseQuery = query.toLowerCase();
  return products.filter((product) => product.name.toLowerCase().includes(lowercaseQuery) || product.productCode.toLowerCase().includes(lowercaseQuery) || product.shortDescription.toLowerCase().includes(lowercaseQuery) || product.description.toLowerCase().includes(lowercaseQuery) || product.category.toLowerCase().includes(lowercaseQuery) || Boolean(product.collections?.some((collection) => collection.name.toLowerCase().includes(lowercaseQuery) || collection.slug.toLowerCase().includes(lowercaseQuery))) || Boolean(product.collection?.toLowerCase().includes(lowercaseQuery)) || Boolean(product.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery))));
}
export function getRelatedProducts(products: Product[], product: Product, limit = 4) {
  return products.filter((candidate) => candidate.id !== product.id && (candidate.category === product.category || candidate.collections?.some((collection) => product.collections?.some((current) => current.slug === collection.slug)) || candidate.collection === product.collection)).slice(0, limit);
}

import type { Collection, Product, ProductCategory } from '@/types';

export interface ApiCategory { name: string; slug: string; description: string; }
export interface ApiCollection { name: string; slug: string; description: string; image_url: string | null; }
export interface ApiProductCategory { name: string; slug: string; }
export interface ApiProductCollection { name: string; slug: string; }
export interface ApiProductImage { url: string; alt_text: string; sort_order: number; is_primary: boolean; width: number | null; height: number | null; }
export interface ApiProduct {
  slug: string; name: string; product_code: string; category: ApiProductCategory; collections: ApiProductCollection[]; price: string; compare_at_price: string | null; currency_code: string; short_description: string; description: string; long_description: string; material: string; color: string; finish: string; dimensions: string; occasions: string[]; tags: string[]; badges: string[]; availability_status: string; availability_label: string; is_featured: boolean; is_new_arrival: boolean; is_best_seller: boolean; seo_title: string; seo_description: string; images: ApiProductImage[];
}

const CATEGORY_NAMES: ProductCategory[] = ['Necklaces', 'Earrings', 'Rings', 'Bangles', 'Bracelets', 'Pendants', 'Bridal Sets', 'Jewelry Sets'];

function getApiBaseUrl(): string {
  const raw = process.env.AUREVIA_CATALOG_API_BASE_URL?.trim();
  if (!raw) throw new Error('AUREVIA_CATALOG_API_BASE_URL is required for the storefront catalog.');
  let parsed: URL;
  try { parsed = new URL(raw); } catch { throw new Error('AUREVIA_CATALOG_API_BASE_URL must be a valid http(s) URL.'); }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('AUREVIA_CATALOG_API_BASE_URL must use http or https.');
  return parsed.toString().replace(/\/$/, '');
}
function endpoint(path: string) { return new URL(path.replace(/^\//, ''), `${getApiBaseUrl()}/`).toString(); }
async function request<T>(path: string, detail = false): Promise<T | null> {
  const response = await fetch(endpoint(path));
  if (detail && response.status === 404) return null;
  if (!response.ok) throw new Error(`Catalog API request failed (${response.status}) for ${path}.`);
  try { return await response.json() as T; } catch { throw new Error(`Catalog API returned invalid JSON for ${path}.`); }
}
function stringValue(value: unknown, field: string): string { if (typeof value !== 'string') throw new Error(`Catalog API contract error: ${field} must be a string.`); return value; }
function stringArray(value: unknown, field: string): string[] { if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) throw new Error(`Catalog API contract error: ${field} must be an array of strings.`); return value; }
function validateCategory(value: unknown): ApiCategory { const item = value as Partial<ApiCategory>; return { name: stringValue(item.name, 'category.name'), slug: stringValue(item.slug, 'category.slug'), description: stringValue(item.description, 'category.description') }; }
function validateCollection(value: unknown): ApiCollection { const item = value as Partial<ApiCollection>; if (item.image_url !== null && typeof item.image_url !== 'string') throw new Error('Catalog API contract error: collection.image_url must be a string or null.'); return { name: stringValue(item.name, 'collection.name'), slug: stringValue(item.slug, 'collection.slug'), description: stringValue(item.description, 'collection.description'), image_url: item.image_url ?? null }; }
function validateProduct(value: unknown): ApiProduct {
  const item = value as Partial<ApiProduct>; const category = item.category as Partial<ApiProductCategory>;
  if (!category || typeof category.name !== 'string' || typeof category.slug !== 'string') throw new Error('Catalog API contract error: product.category is invalid.');
  if (!Array.isArray(item.collections) || item.collections.some((c) => typeof c?.name !== 'string' || typeof c?.slug !== 'string')) throw new Error('Catalog API contract error: product.collections is invalid.');
  if (typeof item.price !== 'string' || !/^\d+(\.\d+)?$/.test(item.price)) throw new Error('Catalog API contract error: product.price must be a decimal string.');
  if (item.compare_at_price !== null && item.compare_at_price !== undefined && (typeof item.compare_at_price !== 'string' || !/^\d+(\.\d+)?$/.test(item.compare_at_price))) throw new Error('Catalog API contract error: product.compare_at_price is invalid.');
  if (!Array.isArray(item.images) || item.images.some((image) => typeof image?.url !== 'string' || typeof image?.alt_text !== 'string' || typeof image?.sort_order !== 'number' || typeof image?.is_primary !== 'boolean')) throw new Error('Catalog API contract error: product.images is invalid.');
  for (const field of ['slug', 'name', 'product_code', 'currency_code', 'short_description', 'description', 'long_description', 'material', 'color', 'finish', 'dimensions', 'availability_status', 'availability_label', 'seo_title', 'seo_description'] as const) stringValue(item[field], `product.${field}`);
  for (const field of ['occasions', 'tags', 'badges'] as const) stringArray(item[field], `product.${field}`);
  return item as ApiProduct;
}
function decimalToNumber(value: string, field: string) { const number = Number(value); if (!Number.isFinite(number)) throw new Error(`Catalog API contract error: ${field} is not finite.`); return number; }
export function adaptCollection(item: ApiCollection): Collection { return { name: item.name, slug: item.slug, description: item.description, image: item.image_url ?? '' }; }
export function adaptProduct(item: ApiProduct): Product {
  if (!CATEGORY_NAMES.includes(item.category.name as ProductCategory)) throw new Error(`Catalog API contract error: unknown product category ${item.category.name}.`);
  const collections = item.collections.map((collection) => ({ name: collection.name, slug: collection.slug }));
  return { id: item.slug, slug: item.slug, name: item.name, category: item.category.name as ProductCategory, price: decimalToNumber(item.price, 'product.price'), originalPrice: item.compare_at_price === null ? undefined : decimalToNumber(item.compare_at_price, 'product.compare_at_price'), currency: item.currency_code, shortDescription: item.short_description, description: item.description, longDescription: item.long_description || undefined, material: item.material, color: item.color, finish: item.finish, dimensions: item.dimensions || undefined, occasion: item.occasions, tags: item.tags, badges: item.badges, productCode: item.product_code, images: [...item.images].sort((a, b) => a.sort_order - b.sort_order).map((image) => image.url), featured: item.is_featured, newArrival: item.is_new_arrival, bestSeller: item.is_best_seller, availability: item.availability_label as Product['availability'], availabilityStatus: item.availability_status, collections, collection: collections[0]?.slug, seoTitle: item.seo_title || undefined, seoDescription: item.seo_description || undefined };
}
export async function getCategories() { return (await request<ApiCategory[]>('categories/'))!.map(validateCategory); }
export async function getCategoryBySlug(slug: string) { const value = await request<ApiCategory>(`categories/${encodeURIComponent(slug)}/`, true); return value ? validateCategory(value) : null; }
export async function getCollections() { return (await request<ApiCollection[]>('collections/'))!.map(validateCollection).map(adaptCollection); }
export async function getCollectionBySlug(slug: string) { const value = await request<ApiCollection>(`collections/${encodeURIComponent(slug)}/`, true); return value ? adaptCollection(validateCollection(value)) : null; }
export async function getProducts() { return (await request<ApiProduct[]>('products/'))!.map(validateProduct).map(adaptProduct); }
export async function getProductBySlug(slug: string) { const value = await request<ApiProduct>(`products/${encodeURIComponent(slug)}/`, true); return value ? adaptProduct(validateProduct(value)) : null; }

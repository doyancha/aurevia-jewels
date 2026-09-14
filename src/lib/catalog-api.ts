import type { Collection, Product, ProductCategory } from '@/types';

export interface ApiCategory { name: string; slug: string; description: string; }
export interface ApiCollection { name: string; slug: string; description: string; image_url: string | null; }
export interface ApiProductCategory { name: string; slug: string; }
export interface ApiProductCollection { name: string; slug: string; }
export interface ApiProductImage { url: string; alt_text: string; sort_order: number; is_primary: boolean; width: number | null; height: number | null; }
export interface ApiProduct {
  slug: string; name: string; product_code: string; category: ApiProductCategory; collections: ApiProductCollection[]; price: string; compare_at_price: string | null; currency_code: string; short_description: string; description: string; long_description: string; material: string; color: string; finish: string; dimensions: string; occasions: string[]; tags: string[]; badges: string[]; availability_status: string; availability_label: string; is_featured: boolean; is_new_arrival: boolean; is_best_seller: boolean; seo_title: string; seo_description: string; images: ApiProductImage[];
}
export type ProductSort = 'default' | 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
export interface ProductQuery {
  search?: string; category?: string; collection?: string; availability?: string;
  featured?: boolean; new_arrival?: boolean; best_seller?: boolean;
  min_price?: number | string; max_price?: number | string; sort?: ProductSort;
}

export const CATALOG_TIMEOUT_MS = 5000;
export const CATALOG_REVALIDATE_SECONDS = 60;
const RETRY_DELAY_MS = 150;
const CATEGORY_NAMES: ProductCategory[] = ['Necklaces', 'Earrings', 'Rings', 'Bangles', 'Bracelets', 'Pendants', 'Bridal Sets', 'Jewelry Sets', 'Sets', 'Anklets'];
type CatalogErrorKind = 'configuration' | 'timeout' | 'network' | 'http' | 'invalid_json' | 'contract';
type EndpointLabel = 'categories-list' | 'category-detail' | 'collections-list' | 'collection-detail' | 'products-list' | 'product-detail';

export class CatalogApiError extends Error {
  readonly kind: CatalogErrorKind;
  readonly status?: number;
  readonly endpoint: EndpointLabel;
  readonly retryable: boolean;

  constructor(options: { kind: CatalogErrorKind; endpoint: EndpointLabel; message: string; status?: number; retryable?: boolean; cause?: unknown }) {
    super(options.message, { cause: options.cause });
    this.name = 'CatalogApiError';
    this.kind = options.kind;
    this.status = options.status;
    this.endpoint = options.endpoint;
    this.retryable = options.retryable ?? false;
  }
}

export function isCatalogApiError(error: unknown): error is CatalogApiError { return error instanceof CatalogApiError; }
export function logCatalogWarning(error: unknown, context: string) {
  if (isCatalogApiError(error)) console.warn(`[catalog] ${context}: endpoint=${error.endpoint} kind=${error.kind}${error.status ? ` status=${error.status}` : ''}`);
  else console.warn(`[catalog] ${context}: unexpected failure`);
}

function getApiBaseUrl(endpointLabel: EndpointLabel): string {
  const raw = process.env.AUREVIA_CATALOG_API_BASE_URL?.trim();
  if (!raw) throw new CatalogApiError({ kind: 'configuration', endpoint: endpointLabel, message: 'Catalog API configuration is unavailable.' });
  let parsed: URL;
  try { parsed = new URL(raw); } catch (cause) { throw new CatalogApiError({ kind: 'configuration', endpoint: endpointLabel, message: 'Catalog API configuration is invalid.', cause }); }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new CatalogApiError({ kind: 'configuration', endpoint: endpointLabel, message: 'Catalog API configuration must use http or https.' });
  return parsed.toString().replace(/\/$/, '');
}
function endpoint(path: string, endpointLabel: EndpointLabel): string { return new URL(path.replace(/^\//, ''), `${getApiBaseUrl(endpointLabel)}/`).toString(); }
function isRetryableStatus(status: number): boolean { return status === 502 || status === 503 || status === 504; }
function isHighCardinality(query?: ProductQuery): boolean { return Boolean(query?.search?.trim() || query?.min_price !== undefined || query?.max_price !== undefined); }

async function request<T>(path: string, endpointLabel: EndpointLabel, options: { detail?: boolean; highCardinality?: boolean } = {}): Promise<T | null> {
  const url = endpoint(path, endpointLabel);
  const fetchOptions: RequestInit = options.highCardinality ? { cache: 'no-store' } : { next: { revalidate: CATALOG_REVALIDATE_SECONDS } };
  let lastError: CatalogApiError | undefined;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CATALOG_TIMEOUT_MS);
    try {
      const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
      if (options.detail && response.status === 404) return null;
      if (!response.ok) lastError = new CatalogApiError({ kind: 'http', endpoint: endpointLabel, status: response.status, retryable: isRetryableStatus(response.status), message: `Catalog ${endpointLabel} request failed with HTTP ${response.status}.` });
      else {
        try { return await response.json() as T; }
        catch (cause) { throw new CatalogApiError({ kind: 'invalid_json', endpoint: endpointLabel, message: `Catalog ${endpointLabel} returned invalid JSON.`, cause }); }
      }
    } catch (cause) {
      if (cause instanceof CatalogApiError) lastError = cause;
      else if (controller.signal.aborted) lastError = new CatalogApiError({ kind: 'timeout', endpoint: endpointLabel, message: `Catalog ${endpointLabel} request timed out.`, retryable: true, cause });
      else lastError = new CatalogApiError({ kind: 'network', endpoint: endpointLabel, message: `Catalog ${endpointLabel} request failed due to a network error.`, retryable: true, cause });
    } finally { clearTimeout(timeout); }
    if (!lastError.retryable || attempt === 2) throw lastError;
    console.warn(`[catalog] retrying endpoint=${endpointLabel} attempt=${attempt + 1} after kind=${lastError.kind}${lastError.status ? ` status=${lastError.status}` : ''}`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }
  throw lastError;
}

function contractError(endpointLabel: EndpointLabel, cause: unknown): CatalogApiError { return new CatalogApiError({ kind: 'contract', endpoint: endpointLabel, message: `Catalog ${endpointLabel} returned an invalid response contract.`, cause }); }
function parseContract<T>(endpointLabel: EndpointLabel, parse: () => T): T { try { return parse(); } catch (cause) { throw contractError(endpointLabel, cause); } }
function stringValue(value: unknown, field: string): string { if (typeof value !== 'string') throw new Error(`${field} must be a string.`); return value; }
function stringArray(value: unknown, field: string): string[] { if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) throw new Error(`${field} must be an array of strings.`); return value; }
function exactKeys(value: unknown, expected: readonly string[], field: string): Record<string, unknown> { if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join('|') !== [...expected].sort().join('|')) throw new Error(`${field} has an invalid field set.`); return value as Record<string, unknown>; }
function validateCategory(value: unknown): ApiCategory { const item = exactKeys(value, ['name', 'slug', 'description'], 'category'); return { name: stringValue(item.name, 'category.name'), slug: stringValue(item.slug, 'category.slug'), description: stringValue(item.description, 'category.description') }; }
function validateCollection(value: unknown): ApiCollection { const item = exactKeys(value, ['name', 'slug', 'description', 'image_url'], 'collection'); if (item.image_url !== null && typeof item.image_url !== 'string') throw new Error('collection.image_url must be a string or null.'); return { name: stringValue(item.name, 'collection.name'), slug: stringValue(item.slug, 'collection.slug'), description: stringValue(item.description, 'collection.description'), image_url: item.image_url as string | null }; }
function validateProduct(value: unknown): ApiProduct {
  const item = exactKeys(value, ['slug', 'name', 'product_code', 'category', 'collections', 'price', 'compare_at_price', 'currency_code', 'short_description', 'description', 'long_description', 'material', 'color', 'finish', 'dimensions', 'occasions', 'tags', 'badges', 'availability_status', 'availability_label', 'is_featured', 'is_new_arrival', 'is_best_seller', 'seo_title', 'seo_description', 'images'], 'product');
  const category = exactKeys(item.category, ['name', 'slug'], 'product.category');
  if (typeof category.name !== 'string' || typeof category.slug !== 'string') throw new Error('product.category is invalid.');
  if (!Array.isArray(item.collections) || item.collections.some((c) => { const collection = exactKeys(c, ['name', 'slug'], 'product.collection'); return typeof collection.name !== 'string' || typeof collection.slug !== 'string'; })) throw new Error('product.collections is invalid.');
  if (typeof item.price !== 'string' || !/^\d+(\.\d+)?$/.test(item.price)) throw new Error('product.price is invalid.');
  if (item.compare_at_price !== null && item.compare_at_price !== undefined && (typeof item.compare_at_price !== 'string' || !/^\d+(\.\d+)?$/.test(item.compare_at_price))) throw new Error('product.compare_at_price is invalid.');
  if (!Array.isArray(item.images) || item.images.some((image) => { const current = exactKeys(image, ['url', 'alt_text', 'sort_order', 'is_primary', 'width', 'height'], 'product.image'); return typeof current.url !== 'string' || typeof current.alt_text !== 'string' || !Number.isInteger(current.sort_order) || typeof current.is_primary !== 'boolean' || (current.width !== null && !Number.isInteger(current.width)) || (current.height !== null && !Number.isInteger(current.height)); })) throw new Error('product.images is invalid.');
  for (const field of ['slug', 'name', 'product_code', 'currency_code', 'short_description', 'description', 'long_description', 'material', 'color', 'finish', 'dimensions', 'availability_status', 'availability_label', 'seo_title', 'seo_description'] as const) stringValue(item[field], `product.${field}`);
  for (const field of ['is_featured', 'is_new_arrival', 'is_best_seller'] as const) if (typeof item[field] !== 'boolean') throw new Error(`product.${field} must be a boolean.`);
  for (const field of ['occasions', 'tags', 'badges'] as const) stringArray(item[field], `product.${field}`);
  return item as unknown as ApiProduct;
}
function decimalToNumber(value: string, field: string) { const number = Number(value); if (!Number.isFinite(number)) throw new Error(`${field} is not finite.`); return number; }
export function adaptCollection(item: ApiCollection): Collection { return { name: item.name, slug: item.slug, description: item.description, image: item.image_url ?? '' }; }
export function adaptProduct(item: ApiProduct): Product {
  if (!CATEGORY_NAMES.includes(item.category.name as ProductCategory)) throw new Error(`unknown product category ${item.category.name}.`);
  const collections = item.collections.map((collection) => ({ name: collection.name, slug: collection.slug }));
  return { id: item.slug, slug: item.slug, name: item.name, category: item.category.name as ProductCategory, price: decimalToNumber(item.price, 'product.price'), originalPrice: item.compare_at_price === null ? undefined : decimalToNumber(item.compare_at_price, 'product.compare_at_price'), currency: item.currency_code, shortDescription: item.short_description, description: item.description, longDescription: item.long_description || undefined, material: item.material, color: item.color, finish: item.finish, dimensions: item.dimensions || undefined, occasion: item.occasions, tags: item.tags, badges: item.badges, productCode: item.product_code, images: [...item.images].sort((a, b) => a.sort_order - b.sort_order).map((image) => image.url), featured: item.is_featured, newArrival: item.is_new_arrival, bestSeller: item.is_best_seller, availability: item.availability_label as Product['availability'], availabilityStatus: item.availability_status, collections, collection: collections[0]?.slug, seoTitle: item.seo_title || undefined, seoDescription: item.seo_description || undefined };
}
function productQuery(query?: ProductQuery) {
  if (!query) return '';
  const params = new URLSearchParams();
  const fields: (keyof ProductQuery)[] = ['search', 'category', 'collection', 'availability', 'featured', 'new_arrival', 'best_seller', 'min_price', 'max_price', 'sort'];
  for (const key of fields) { const value = query[key]; if (value !== undefined && value !== '') params.set(key, String(value)); }
  const suffix = params.toString();
  return suffix ? `?${suffix}` : '';
}
export async function getCategories() { return (await request<ApiCategory[]>('categories/', 'categories-list'))!.map((item) => parseContract('categories-list', () => validateCategory(item))); }
export async function getCategoryBySlug(slug: string) { const value = await request<ApiCategory>(`categories/${encodeURIComponent(slug)}/`, 'category-detail', { detail: true }); return value ? parseContract('category-detail', () => validateCategory(value)) : null; }
export async function getCollections() { return (await request<ApiCollection[]>('collections/', 'collections-list'))!.map((item) => parseContract('collections-list', () => adaptCollection(validateCollection(item)))); }
export async function getCollectionBySlug(slug: string) { const value = await request<ApiCollection>(`collections/${encodeURIComponent(slug)}/`, 'collection-detail', { detail: true }); return value ? parseContract('collection-detail', () => adaptCollection(validateCollection(value))) : null; }
export async function getProducts(query?: ProductQuery) { return (await request<ApiProduct[]>(`products/${productQuery(query)}`, 'products-list', { highCardinality: isHighCardinality(query) }))!.map((item) => parseContract('products-list', () => adaptProduct(validateProduct(item)))); }
export async function getProductBySlug(slug: string) { const value = await request<ApiProduct>(`products/${encodeURIComponent(slug)}/`, 'product-detail', { detail: true }); return value ? parseContract('product-detail', () => adaptProduct(validateProduct(value))) : null; }

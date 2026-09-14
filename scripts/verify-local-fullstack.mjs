const apiBase = (process.env.AUREVIA_QA_DJANGO_API_BASE_URL || process.env.AUREVIA_CATALOG_API_BASE_URL || 'http://127.0.0.1:8012/api/v1').replace(/\/$/, '');
const storefrontBase = (process.env.AUREVIA_QA_NEXT_BASE_URL || 'http://127.0.0.1:3012').replace(/\/$/, '');
const impossible = 'phase12-verification-never-created-9f7c2';
const failures = [];
const pass = (condition, message) => { if (!condition) throw new Error(message); };
const request = async (base, path, options = {}) => { const response = await fetch(new URL(path.replace(/^\//, ''), `${base}/`), { redirect: 'manual', ...options }); return { response, body: await response.text() }; };
const json = async (path, options) => { const result = await request(apiBase, path, options); pass(result.response.status === 200, `API ${path} returned ${result.response.status}`); try { return JSON.parse(result.body); } catch { throw new Error(`API ${path} did not return JSON`); } };
const storefront = async (path) => request(storefrontBase, path);
const check = async (label, fn) => { try { await fn(); } catch (error) { failures.push(`${label}: ${error.message}`); } };
const namesIn = (body, items) => items.every((item) => body.includes(item.name));

await check('Django health', async () => { const { response } = await request(apiBase.replace(/\/api\/v1$/, ''), '/health/'); pass(response.status === 200, `returned ${response.status}`); });
const categories = await json('/categories/');
const collections = await json('/collections/');
const products = await json('/products/');
pass(categories.length === 8, `expected 8 categories, got ${categories.length}`);
pass(collections.length === 8, `expected 8 collections, got ${collections.length}`);
pass(products.length === 24, `expected 24 products, got ${products.length}`);

const staticRoutes = ['/', '/shop', '/collections', '/sitemap.xml'];
if (process.env.AUREVIA_QA_EXPECT_ROBOTS === 'true') staticRoutes.push('/robots.txt');
for (const path of staticRoutes) await check(`static ${path}`, async () => { const { response } = await storefront(path); pass(response.status === 200, `returned ${response.status}`); });

for (const product of products) await check(`product ${product.slug}`, async () => {
  const { response, body } = await storefront(`/products/${encodeURIComponent(product.slug)}`);
  pass(response.status === 200, `returned ${response.status}`);
  pass(body.includes(product.name), 'name missing from rendered response');
  pass(body.includes(product.product_code), 'product code missing from rendered response');
  const ld = body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  pass(ld, 'Product JSON-LD missing');
  const structured = JSON.parse(ld.replaceAll('&quot;', '"'));
  pass(structured['@type'] === 'Product' && structured.name === product.name && structured.sku === product.product_code, 'Product JSON-LD mismatch');
  pass(body.includes('<title>') && body.includes(product.name), 'product metadata content missing');
});

for (const collection of collections) await check(`collection ${collection.slug}`, async () => {
  const { response, body } = await storefront(`/collections/${encodeURIComponent(collection.slug)}`);
  pass(response.status === 200, `returned ${response.status}`);
  pass(body.includes(collection.name), 'collection name missing from rendered response');
  const expected = await json(`/products/?collection=${encodeURIComponent(collection.slug)}`);
  pass(namesIn(body, expected), `missing one or more M2M products (${expected.length})`);
});

const sample = products[0];
const category = categories[0].slug;
const collection = collections[0].slug;
const availability = sample.availability_status;
const min = Math.floor(Number(sample.price));
const max = Number(sample.price) + 100;
const shopQueries = ['', 'search=pearl', `category=${encodeURIComponent(category)}`, `collection=${encodeURIComponent(collection)}`, `availability=${encodeURIComponent(availability)}`, 'sort=price_asc', 'sort=price_desc', 'sort=name_asc', `min_price=${min}&max_price=${max}`, `category=${encodeURIComponent(category)}&collection=${encodeURIComponent(collection)}&sort=name_asc`, 'q=pearl'];
for (const query of shopQueries) await check(`shop ${query || 'default'}`, async () => { const { response, body } = await storefront(`/shop${query ? `?${query}` : ''}`); pass(response.status === 200, `returned ${response.status}`); pass(!body.includes('Catalog Error') && !body.includes('Search is temporarily unavailable'), 'healthy shop error state rendered'); });
await check('empty shop result', async () => { const { response, body } = await storefront('/shop?search=phase12-never-matches-9f7c2'); pass(response.status === 200 && body.includes('No jewelry matched your filters.'), 'no-results UX missing'); pass(!body.includes('Search is temporarily unavailable'), 'healthy empty result reported as outage'); });

await check('sitemap parity', async () => { const { response, body } = await storefront('/sitemap.xml'); pass(response.status === 200 && body.includes('<urlset'), 'invalid sitemap response'); const urls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]); pass(new Set(urls).size === urls.length, 'duplicate sitemap URLs'); for (const item of products) pass(urls.some((url) => url.endsWith(`/products/${item.slug}`)), `missing product URL ${item.slug}`); for (const item of collections) pass(urls.some((url) => url.endsWith(`/collections/${item.slug}`)), `missing collection URL ${item.slug}`); });
await check('API-to-storefront category parity', async () => { const result = await json(`/products/?category=${encodeURIComponent(category)}`); const { body } = await storefront(`/shop?category=${encodeURIComponent(category)}`); pass(namesIn(body, result), 'category result missing from storefront'); });
await check('read-only API', async () => { const detail = `/products/${encodeURIComponent(sample.slug)}/`; for (const [method, path] of [['POST', '/products/'], ['PUT', detail], ['PATCH', detail], ['DELETE', detail]]) { const { response } = await request(apiBase, path, { method, headers: { 'content-type': 'application/json' }, body: '{}' }); pass(response.status === 405, `${method} ${path} returned ${response.status}`); } });
await check('404 semantics', async () => { for (const path of [`/products/${impossible}/`, `/collections/${impossible}/`]) { const { response } = await request(apiBase, path); pass(response.status === 404, `Django ${path} returned ${response.status}`); } for (const path of [`/products/${impossible}`, `/collections/${impossible}`]) { const { response } = await storefront(path); pass(response.status === 404, `Next ${path} returned ${response.status}`); } });

const media = products.flatMap((product) => product.images.map((image) => ({ ...image, product: product.slug })));
await check('catalog media', async () => { pass(media.length === 72, `expected 72 images, got ${media.length}`); pass(media.every((image) => image.url.startsWith('/') || image.url.startsWith('https://res.cloudinary.com/')), 'unsupported image URL found'); pass(new Set(media.map((image) => image.url)).size === 72, 'image URL is not unique'); let failed = 0; for (const image of media) { let ok = false; for (let attempt = 0; attempt < 2 && !ok; attempt++) { try { const result = await fetch(new URL(image.url, `${storefrontBase}/`), { method: 'HEAD' }); ok = result.ok && (result.headers.get('content-type') || '').startsWith('image/'); } catch {} } if (!ok) failed++; } pass(failed === 0, `${failed}/72 catalog image URLs failed`); });
await check('Next image optimization', async () => { let tested = 0; for (const product of products.slice(0, 6)) { const page = await storefront(`/products/${encodeURIComponent(product.slug)}`); const encoded = [...page.body.matchAll(/\/_next\/image\?url=([^&]+)(?:&amp;|&)w=\d+(?:&amp;|&)q=\d+/g)][0]?.[1]; if (!encoded) continue; const result = await storefront(`/_next/image?url=${encoded}&w=640&q=75`); tested++; pass(result.response.status === 200 && (result.response.headers.get('content-type') || '').startsWith('image/'), `sample ${tested} returned ${result.response.status}`); } pass(tested >= 3, `only ${tested} optimizer samples found`); });
await check('browser/backend boundary', async () => { const pages = await Promise.all(['/','/shop','/collections'].map(storefront)); const joined = pages.map((page) => page.body).join('\n'); pass(!joined.includes(apiBase), 'Django API origin exposed in rendered storefront'); pass(!joined.includes('AUREVIA_CATALOG_API_BASE_URL'), 'server environment variable exposed'); });

if (failures.length) { console.error('Aurevia local full-stack verification: FAIL'); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log('Aurevia local full-stack verification: PASS');
console.log('Django health: PASS');
console.log(`Static routes: ${staticRoutes.length}/${staticRoutes.length}`);
console.log(`Products: ${products.length}/${products.length}`);
console.log(`Collections: ${collections.length}/${collections.length}`);
console.log('Shop queries: PASS');
console.log('Sitemap: PASS');
console.log(`Catalog media: ${media.length}/${media.length}`);
console.log('Next image samples: 3+/3+');
console.log('404 semantics: PASS');
console.log('Read-only API: PASS');
console.log('Client API leak scan: PASS');

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const repo = resolve(fileURLToPath(new URL('..', import.meta.url)));
const apiBase = (process.env.AUREVIA_CATALOG_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');
const nextBase = (process.env.AUREVIA_NEXT_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const packageRoot = resolve(repo, 'data/catalog/concept-demo');
const publicRoot = resolve(repo, 'public/catalog/concept-demo');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const get = async url => { const response = await fetch(url); assert.equal(response.status, 200, `${url} returned HTTP ${response.status}`); return response; };
const csvRows = (await readFile(resolve(packageRoot, 'image-manifest.csv'), 'utf8')).trim().split(/\r?\n/).slice(1).map(line => line.split(','));
const manifest = new Map(csvRows.map(row => [row[0], { primary: row[2], secondary: (row[3] || '').split('|').filter(Boolean) }]));
const products = await (await get(`${apiBase}/products/`)).json();
assert.equal(products.length, 24, 'catalog product count');
const rows = [];
for (const product of products) {
  const code = product.product_code;
  const files = ['01.png', '02.png', '03.png'];
  const manifestRow = manifest.get(code);
  assert.deepEqual(manifestRow && [manifestRow.primary, ...manifestRow.secondary], files, `${code} manifest`);
  const packageBytes = [];
  for (const file of files) {
    const bytes = await readFile(resolve(packageRoot, 'images', code, file));
    const mirrorBytes = await readFile(resolve(publicRoot, code, file));
    assert.equal(sha(mirrorBytes), sha(bytes), `${code}/${file} mirror hash`);
    packageBytes.push(bytes);
  }
  const detail = await (await get(`${apiBase}/products/${encodeURIComponent(product.slug)}/`)).json();
  assert.equal(detail.images.length, 3, `${code} API image count`);
  assert.deepEqual(detail.images.map(image => image.sort_order), [0, 1, 2], `${code} API ordering`);
  assert.equal(detail.images.filter(image => image.is_primary).length, 1, `${code} primary count`);
  for (const image of detail.images) await get(new URL(image.url, `${nextBase}/`));
  const html = await (await get(`${nextBase}/products/${encodeURIComponent(product.slug)}`)).text();
  const galleryCount = (html.match(/View concept image/g) || []).length;
  assert.equal(galleryCount, 3, `${code} rendered gallery count`);
  for (const file of files) assert.match(html, new RegExp(`/catalog/concept-demo/${code}/${file.replace('.', '\\.')}`), `${code}/${file} rendered URL`);
  rows.push(`${code} 3/3/3/3/3/3/3/3`);
}
const invalidProduct = await fetch(`${nextBase}/products/__invalid-concept-product__`);
assert.equal(invalidProduct.status, 404, 'invalid product route');
const invalidCollection = await fetch(`${nextBase}/collections/__invalid-concept-collection__`);
assert.equal(invalidCollection.status, 404, 'invalid collection route');
const sitemap = await get(`${nextBase}/sitemap.xml`);
assert.match(await sitemap.text(), /<urlset[\s>]/, 'sitemap structure');
console.log(rows.join('\n'));
console.log(`CONCEPT PREVIEW PIPELINE PASS: ${rows.length}/24 products, 72/72 package/mirror/API/rendered image assets`);

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const base = (process.env.AUREVIA_CATALOG_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');
const manifestPath = new URL('../contracts/catalog-api-v1.json', import.meta.url);
const contract = JSON.parse(await readFile(manifestPath, 'utf8'));
assert.equal(contract.contract_version, 'v1');
assert.equal(contract.api_prefix, '/api/v1');
assert.deepEqual(Object.keys(contract.resources).sort(), ['categories', 'collections', 'products']);
assert.ok(contract.forbidden_fields?.length && contract.product_query_parameters);

const get = async (path, options = {}) => {
  const response = await fetch(new URL(path.replace(/^\//, ''), `${base}/`), options);
  let body = null;
  try { body = await response.json(); } catch {}
  return { response, body };
};
const keys = (object) => Object.keys(object).sort();
const types = { string: (v) => typeof v === 'string', boolean: (v) => typeof v === 'boolean', integer: (v) => Number.isInteger(v) };
const matches = (value, type) => type.endsWith('|null') ? value === null || matches(value, type.slice(0, -5)) : type.endsWith('[]') ? Array.isArray(value) && value.every((v) => matches(v, type.slice(0, -2))) : type === 'decimal_string' ? typeof value === 'string' && /^\d+(\.\d+)?$/.test(value) : Boolean(types[type]?.(value));
const validate = (resource, value) => {
  assert.equal(typeof value, 'object');
  assert.deepEqual(keys(value), keys(contract.resources[resource].fields));
  for (const [field, type] of Object.entries(contract.resources[resource].fields)) {
    if (type === 'category_summary') validateNested(type, value[field]);
    else if (type === 'collection_summary[]') { assert.ok(Array.isArray(value[field])); value[field].forEach((v) => validateNested('collection_summary', v)); }
    else if (type === 'image[]') { assert.ok(Array.isArray(value[field])); value[field].forEach((v) => validateNested('image', v)); }
    else assert.ok(matches(value[field], type), `${resource}.${field} has wrong type`);
  }
  scanForbidden(value);
};
const validateNested = (name, value) => { assert.deepEqual(keys(value), keys(contract.nested_fields[name])); for (const [field, type] of Object.entries(contract.nested_fields[name])) assert.ok(matches(value[field], type), `${name}.${field} has wrong type`); scanForbidden(value); };
const scanForbidden = (value) => { if (Array.isArray(value)) return value.forEach(scanForbidden); if (!value || typeof value !== 'object') return; for (const field of contract.forbidden_fields) assert.equal(Object.hasOwn(value, field), false, `forbidden field exposed: ${field}`); Object.values(value).forEach(scanForbidden); };
const list = async (resource) => { const { response, body } = await get(`/${resource}/`); assert.equal(response.status, 200, `${resource} list`); assert.ok(Array.isArray(body)); body.forEach((item) => validate(resource, item)); return body; };
const detail = async (resource, item) => { const { response, body } = await get(`/${resource}/${encodeURIComponent(item.slug)}/`); assert.equal(response.status, 200); validate(resource, body); };
const expectStatus = async (path, status, options) => { const { response } = await get(path, options); assert.equal(response.status, status, `${path} expected ${status}`); };

const root = await get('/');
assert.equal(root.response.status, 200);
const categories = await list('categories');
const collections = await list('collections');
const products = await list('products');
for (const item of categories) await detail('categories', item);
for (const item of collections) await detail('collections', item);
for (const item of products) await detail('products', item);
assert.equal(new Set(products.map((item) => item.slug)).size, products.length);
for (const resource of ['categories', 'collections', 'products']) await expectStatus(`/${resource}/phase11-verification-never-created-9f7c2/`, 404);

const productQuery = async (query) => { const { response, body } = await get(`/products/?${new URLSearchParams(query)}`); assert.equal(response.status, 200, JSON.stringify(query)); assert.ok(Array.isArray(body)); return body; };
const sample = products[0];
if (sample) {
  await productQuery({ search: sample.name.slice(0, 3) });
  await productQuery({ category: sample.category.slug });
  if (sample.collections[0]) await productQuery({ collection: sample.collections[0].slug });
  await productQuery({ availability: sample.availability_status });
  await productQuery({ featured: String(sample.is_featured), new_arrival: String(sample.is_new_arrival), best_seller: String(sample.is_best_seller) });
  await productQuery({ min_price: sample.price, max_price: sample.price });
  for (const sort of ['default', 'featured', 'newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc']) await productQuery({ sort });
  await productQuery({ search: sample.name.slice(0, 3), category: sample.category.slug, featured: String(sample.is_featured), min_price: '0', max_price: sample.price, sort: 'name_asc' });
}
for (const query of [{ unknown: 'x' }, { featured: 'yes' }, { availability: 'invalid' }, { min_price: 'nope' }, { min_price: '2', max_price: '1' }, { sort: 'invalid' }]) await expectStatus(`/products/?${new URLSearchParams(query)}`, 400);
await expectStatus('/products/', 405, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
if (sample) for (const method of ['PUT', 'PATCH', 'DELETE']) await expectStatus(`/products/${encodeURIComponent(sample.slug)}/`, 405, { method, headers: { 'content-type': 'application/json' }, body: '{}' });

console.log('Catalog API contract v1: PASS');
console.log(`Categories: ${categories.length}`);
console.log(`Collections: ${collections.length}`);
console.log(`Products: ${products.length}`);
console.log(`Category details: ${categories.length}/${categories.length}`);
console.log(`Collection details: ${collections.length}/${collections.length}`);
console.log(`Product details: ${products.length}/${products.length}`);
console.log('Read-only checks: PASS');
console.log('Filter checks: PASS');
console.log('Forbidden-field scan: PASS');

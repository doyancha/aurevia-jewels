import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../data/catalog/concept-demo/', import.meta.url);
const parseCsv = (text) => {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell); cell = '';
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [header, ...data] = rows;
  return data.map((values, index) => {
    assert.equal(values.length, header.length, `CSV row ${index + 2} column count`);
    return Object.fromEntries(header.map((key, column) => [key, values[column]]));
  });
};
const readCsv = async (name) => parseCsv(await readFile(new URL(name, root), 'utf8'));
const products = await readCsv('products.csv');
const taxonomy = await readCsv('taxonomy.csv');
const images = await readCsv('image-manifest.csv');
const categories = taxonomy.filter((row) => row.type === 'category');
const collections = taxonomy.filter((row) => row.type === 'collection');
const productFields = ['product_code','name','slug','category','collections','price','compare_at_price','currency_code','availability','featured','new_arrival','best_seller','published','short_description','description','long_description','material','color','finish','dimensions','occasions','tags','badges','seo_title','seo_description'];
assert.equal(products.length, 24);
assert.equal(categories.length, 8);
assert.equal(collections.length, 8);
assert.deepEqual(Object.keys(products[0]), productFields);
const unique = (field, rows) => assert.equal(new Set(rows.map((row) => row[field])).size, rows.length, `duplicate ${field}`);
unique('product_code', products); unique('slug', products); unique('slug', categories); unique('slug', collections);
const categorySlugs = new Set(categories.map((row) => row.slug));
const collectionSlugs = new Set(collections.map((row) => row.slug));
const booleans = new Set(['true', 'false']);
for (const product of products) {
  assert.ok(categorySlugs.has(product.category), `${product.product_code} category`);
  for (const collection of product.collections.split('|')) assert.ok(collectionSlugs.has(collection), `${product.product_code} collection`);
  assert.match(product.price, /^\d+(\.\d{1,2})?$/); assert.match(product.compare_at_price, /^\d+(\.\d{1,2})?$/);
  for (const field of ['featured', 'new_arrival', 'best_seller', 'published']) assert.ok(booleans.has(product[field]), `${product.product_code} ${field}`);
  for (const field of ['name','short_description','description','long_description','material','color','finish','dimensions','occasions','tags','seo_title','seo_description']) assert.ok(product[field].trim(), `${product.product_code} ${field}`);
}
unique('product_code', images); assert.equal(images.length, products.length);
const imageFiles = [];
for (const image of images) {
  assert.ok(products.some((product) => product.product_code === image.product_code)); assert.equal(image.intended_image_count, '3'); assert.equal(image.image_provenance, 'representative_demo');
  const candidates = [[image.primary_image, 0, true], ...(image.secondary_images ? image.secondary_images.split('|').filter(Boolean).map((name, index) => [name, index + 1, false]) : [])];
  for (const [filename, sortOrder, primary] of candidates) {
    assert.equal(filename, filename.trim()); assert.ok(!filename.includes('/') && !filename.includes('\\') && !filename.includes('..'), `unsafe image path ${filename}`);
    const path = new URL(`images/${image.product_code}/${filename}`, root);
    try {
      const bytes = await readFile(path);
      imageFiles.push({ product_code: image.product_code, filename, sortOrder, primary, path: path.href, hash: createHash('sha256').update(bytes).digest('hex') });
    } catch (error) {
      if (primary) throw error;
    }
  }
}
assert.equal(imageFiles.filter((image) => image.primary).length, products.length);
assert.equal(new Set(imageFiles.map((image) => image.path)).size, imageFiles.length, 'duplicate image path');
assert.equal(new Set(imageFiles.map((image) => image.hash)).size, imageFiles.length, 'duplicate image hash');
for (const product of products) {
  const productImages = imageFiles.filter((image) => image.product_code === product.product_code);
  assert.equal(productImages.filter((image) => image.primary).length, 1);
  assert.equal(new Set(productImages.map((image) => image.sortOrder)).size, productImages.length);
}
assert.ok(products.filter((row) => row.featured === 'true').length >= 6);
assert.ok(products.filter((row) => row.best_seller === 'true').length >= 6);
assert.ok(products.filter((row) => row.new_arrival === 'true').length >= 6);
assert.ok(products.every((row) => row.published === 'false'));
console.log('Concept catalog structural validation: PASS');
console.log(`Categories: ${categories.length}`); console.log(`Collections: ${collections.length}`); console.log(`Products: ${products.length}`); console.log(`Primary images: ${imageFiles.filter((image) => image.primary).length}`); console.log(`Secondary images: ${imageFiles.filter((image) => !image.primary).length}`); console.log(`Total concept image files: ${imageFiles.length}`); console.log('Image provenance: representative_demo for all declared image files');

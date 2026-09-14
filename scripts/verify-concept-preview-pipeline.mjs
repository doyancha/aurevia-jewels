import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const repo = resolve(fileURLToPath(new URL('..', import.meta.url)));
const nextBase = (process.env.AUREVIA_NEXT_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const packageRoot = resolve(repo, 'data/catalog/concept-demo');
const publicRoot = resolve(repo, 'public/catalog/concept-demo');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

const parseCsv = text => {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell);
      cell = '';
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [header, ...data] = rows;
  return data.map(values => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ''])));
};

const readCsv = async name => parseCsv(await readFile(resolve(packageRoot, name), 'utf8'));
const get = async url => {
  const response = await fetch(url);
  assert.equal(response.status, 200, `${url} returned HTTP ${response.status}`);
  return response;
};
const duplicates = values => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];

const products = await readCsv('products.csv');
const manifestRows = await readCsv('image-manifest.csv');
assert.equal(products.length, 24, 'concept product count');
assert.equal(manifestRows.length, products.length, 'concept manifest row count');

const productCodes = products.map(product => product.product_code);
const productSlugs = products.map(product => product.slug);
assert.deepEqual(duplicates(productCodes), [], 'duplicate concept product codes');
assert.deepEqual(duplicates(productSlugs), [], 'duplicate concept product slugs');
assert.deepEqual(duplicates(manifestRows.map(row => row.product_code)), [], 'duplicate concept manifest codes');

const productsByCode = new Map(products.map(product => [product.product_code, product]));
const manifestByCode = new Map(manifestRows.map(row => [row.product_code, row]));
assert.deepEqual(
  manifestRows.map(row => row.product_code).filter(code => !productsByCode.has(code)),
  [],
  'orphan concept manifest rows'
);
assert.deepEqual(
  productCodes.filter(code => !manifestByCode.has(code)),
  [],
  'concept products missing manifest rows'
);

const expectedFiles = ['01.png', '02.png', '03.png'];
const servedImages = [];
for (const product of products) {
  const code = product.product_code;
  const manifest = manifestByCode.get(code);
  assert.equal(product.published, 'false', `${code} must remain unpublished`);
  assert.equal(manifest.image_provenance, 'representative_demo', `${code} provenance`);
  assert.equal(manifest.intended_image_count, '3', `${code} intended image count`);

  const files = [manifest.primary_image, ...manifest.secondary_images.split('|').filter(Boolean)];
  assert.deepEqual(files, expectedFiles, `${code} manifest`);
  for (const file of files) {
    assert.ok(!file.includes('/') && !file.includes('\\') && !file.includes('..'), `${code}/${file} unsafe path`);
    const packageBytes = await readFile(resolve(packageRoot, 'images', code, file));
    const publicBytes = await readFile(resolve(publicRoot, code, file));
    assert.equal(sha(publicBytes), sha(packageBytes), `${code}/${file} mirror hash`);
    const servedUrl = new URL(`/catalog/concept-demo/${code}/${file}`, `${nextBase}/`).toString();
    await get(servedUrl);
    servedImages.push(servedUrl);
  }
}

assert.equal(servedImages.length, 72, 'served concept image count');
console.log(`CONCEPT PREVIEW PIPELINE PASS: ${products.length}/24 concept products, ${servedImages.length}/72 package/mirror/served image assets`);

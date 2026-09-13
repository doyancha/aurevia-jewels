import fs from "node:fs";
import vm from "node:vm";

const [productsPath, collectionsPath] = process.argv.slice(2);
if (!productsPath || !collectionsPath) throw new Error("source paths are required");

function readArray(file, exportName, typeName) {
  const source = fs.readFileSync(file, "utf8").replace(/^import[^;]+;\s*/m, "");
  const marker = new RegExp(`export const ${exportName}: ${typeName}\\[\\]\\s*=`).exec(source);
  if (!marker) throw new Error(`could not locate ${exportName}`);
  const start = source.indexOf("[", marker.index + marker[0].length);
  let depth = 0;
  let quote = null;
  let end = -1;
  for (let i = start; i < source.length; i += 1) {
    const char = source[i];
    if (quote) {
      if (char === "\\" && source[i + 1] === "'") i += 1;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") { quote = char; continue; }
    if (char === "[") depth += 1;
    if (char === "]" && --depth === 0) { end = i + 1; break; }
  }
  if (end < 0) throw new Error(`unterminated ${exportName} array`);
  const expression = source.slice(start, end);
  const context = { result: null };
  vm.runInNewContext(`result = ${expression};`, context, { filename: file });
  if (!Array.isArray(context.result)) throw new Error(`${exportName} is not an array`);
  return context.result;
}

process.stdout.write(JSON.stringify({
  source_files: [productsPath, collectionsPath],
  products: readArray(productsPath, "products", "Product"),
  collections: readArray(collectionsPath, "collections", "Collection"),
}));

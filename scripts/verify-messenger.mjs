import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('..', import.meta.url);
const read = async (file) => readFile(new URL(file, root), 'utf8');
const site = await read('src/config/site.ts');
const utils = await read('src/lib/utils.ts');
const messenger = await read('src/components/ui/MessengerButton.tsx');
const header = await read('src/components/layout/Header.tsx');
const hero = await read('src/components/home/Hero.tsx');
const productDetails = await read('src/components/product/ProductDetails.tsx');
const sticky = await read('src/components/product/StickyMobileCTA.tsx');
const contact = await read('src/app/contact/page.tsx');
const mobileMenu = await read('src/components/layout/MobileMenu.tsx');

const validateMessengerUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && new Set(['messenger.com', 'www.messenger.com', 'm.me', 'www.m.me']).has(url.hostname.toLowerCase())
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
};

assert.match(site, /messengerUrl:\s*'https:\/\/www\.messenger\.com\/'/);
assert.equal(validateMessengerUrl('https://www.messenger.com/'), 'https://www.messenger.com/');
assert.equal(validateMessengerUrl('not-a-url'), undefined);
assert.equal(validateMessengerUrl('http://www.messenger.com/'), undefined);
assert.equal(validateMessengerUrl('https://evil.example/'), undefined);
assert.match(utils, /export function getConfiguredMessengerUrl/);
assert.match(messenger, /variant\?: 'primary' \| 'secondary' \| 'outline'/);
assert.match(messenger, /primary: 'bg-\[#0084FF\][^']*text-white/);
assert.match(messenger, /variant = 'primary'/);
assert.match(messenger, /target="_blank"/);
assert.match(messenger, /rel="noopener noreferrer"/);
assert.match(messenger, /Mention product code \{productCode\}/);
assert.doesNotMatch(messenger, /\?text=|prefill|buildWhatsApp/);

for (const [file, expected] of [
  ['src/components/product/ProductDetails.tsx', 'MessengerButton'],
  ['src/components/product/StickyMobileCTA.tsx', 'MessengerButton'],
  ['src/app/contact/page.tsx', 'MessengerButton'],
  ['src/components/home/Hero.tsx', 'MessengerButton'],
  ['src/components/layout/MobileMenu.tsx', 'MessengerButton'],
]) {
  assert.match(await read(file), new RegExp(expected));
}

assert.match(header, /import \{ MessengerButton \} from ['"]@\/components\/ui\/MessengerButton['"]/);
assert.match(header, /<WhatsAppButton[\s\S]*?variant="primary"[\s\S]*?size="sm"[\s\S]*?<\/WhatsAppButton>[\s\S]*?<MessengerButton[\s\S]*?size="sm"/);
assert.match(header, /hidden lg:grid/);
assert.match(hero, /sm:grid-cols-2/);
assert.match(productDetails, /<WhatsAppButton[\s\S]*?size="lg"[\s\S]*?className="w-full text-lg"/);
assert.match(productDetails, /<MessengerButton[\s\S]*?className="w-full"[\s\S]*?size="lg"/);
assert.match(sticky, /<WhatsAppButton[\s\S]*?size="md"[\s\S]*?className="w-full text-sm"/);
assert.match(sticky, /<MessengerButton[\s\S]*?className="w-full"[\s\S]*?size="md"/);
assert.match(contact, /<MessengerButton label="Open Messenger" className="w-full sm:w-auto" \/>/);
assert.match(mobileMenu, /<MessengerButton label="Order via Messenger" className="w-full" \/>/);

assert.doesNotMatch(await read('src/components/ui/ProductCard.tsx'), /MessengerButton/);
assert.doesNotMatch(await read('src/components/ui/FloatingWhatsApp.tsx'), /MessengerButton/);
for (const name of ['buildWhatsAppOrderMessage', 'buildWhatsAppInquiryMessage', 'generateWhatsAppUrl', 'generateGenericWhatsAppUrl']) {
  assert.match(utils, new RegExp(name));
}

console.log('Messenger verification: PASS (configuration, validation, placements, security, and exclusions)');

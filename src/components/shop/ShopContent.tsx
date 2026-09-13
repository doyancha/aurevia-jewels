import { Product, Collection } from '@/types';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import type { ApiCategory, ProductQuery, ProductSort } from '@/lib/catalog-api';

interface ShopContentProps { products: Product[]; categories: ApiCategory[]; collections: Collection[]; filters: ProductQuery; }
const sorts: { value: ProductSort; label: string }[] = [
  { value: 'default', label: 'Recommended' }, { value: 'featured', label: 'Featured' }, { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' }, { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A–Z' }, { value: 'name_desc', label: 'Name: Z–A' },
];

export function ShopContent({ products, categories, collections, filters }: ShopContentProps) {
  const hasFilters = Object.values(filters).some((value) => value !== undefined && value !== '');
  return <div className="flex flex-col gap-8">
    <AnimatedSection><form method="get" action="/shop" className="grid gap-4 rounded-2xl bg-gray-50 p-6 sm:grid-cols-2 lg:grid-cols-4">
      <label className="sm:col-span-2 lg:col-span-2"><span className="sr-only">Search</span><input name="search" defaultValue={filters.search} placeholder="Search products, collections or codes…" className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" /></label>
      <label><span className="sr-only">Category</span><select name="category" defaultValue={filters.category ?? ''} className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm"><option value="">All categories</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
      <label><span className="sr-only">Collection</span><select name="collection" defaultValue={filters.collection ?? ''} className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm"><option value="">All collections</option>{collections.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
      <label><span className="sr-only">Availability</span><select name="availability" defaultValue={filters.availability ?? ''} className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm"><option value="">Any availability</option><option value="ask_about_availability">Ask About Availability</option><option value="made_to_order">Made to Order</option></select></label>
      <label><span className="sr-only">Minimum price</span><input name="min_price" inputMode="decimal" defaultValue={filters.min_price} placeholder="Min price" className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm" /></label>
      <label><span className="sr-only">Maximum price</span><input name="max_price" inputMode="decimal" defaultValue={filters.max_price} placeholder="Max price" className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm" /></label>
      <label><span className="sr-only">Sort</span><select name="sort" defaultValue={filters.sort ?? 'default'} className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm">{sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
      <div className="flex items-center gap-3"><button type="submit" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white">Apply filters</button>{hasFilters && <a href="/shop" className="text-sm font-medium text-primary hover:underline">Clear filters</a>}</div>
    </form></AnimatedSection>
    <AnimatedSection delay={0.2}><div className="mb-4 flex items-center justify-between"><p className="text-sm text-gray-600">Showing {products.length} result{products.length === 1 ? '' : 's'}</p></div>{products.length ? <ProductGrid products={products} /> : <div className="rounded-2xl border border-gray-100 bg-gray-50 py-20 text-center"><h3 className="mb-2 font-serif text-xl text-gray-900">No jewelry matched your filters.</h3><p className="text-gray-500">Try a broader search or clear the filters.</p></div>}</AnimatedSection>
  </div>;
}

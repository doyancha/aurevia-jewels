import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ShopContent } from '@/components/shop/ShopContent';
import { getCategories, getCollections, getProducts, type ProductQuery, type ProductSort } from '@/lib/catalog-api';

export const metadata: Metadata = {
  title: 'Shop Jewelry | Aurevia Jewels',
  description: 'Explore our complete collection of premium jewelry, including necklaces, earrings, rings, and more. Find the perfect piece for any occasion.',
};

interface ShopPageProps { searchParams: Promise<Record<string, string | string[] | undefined>>; }

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const one = (key: string) => typeof params[key] === 'string' ? params[key] : undefined;
  const rawSort = one('sort');
  const validSorts: ProductSort[] = ['default', 'featured', 'newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'];
  const filters: ProductQuery = { search: one('search'), category: one('category'), collection: one('collection'), availability: one('availability'), min_price: one('min_price'), max_price: one('max_price'), sort: rawSort && validSorts.includes(rawSort as ProductSort) ? rawSort as ProductSort : undefined };
  const [products, categories, collections] = await Promise.all([getProducts(filters), getCategories(), getCollections()]);
  return (
    <main className="min-h-screen py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/shop' },
          ]}
          className="mb-8"
        />

        <SectionHeading
          as="h1"
          title="Shop Jewelry"
          subtitle="Discover our full range of exquisitely crafted jewelry, designed to elevate your everyday and celebrate your special moments."
          centered
          className="mb-12"
        />

        <ShopContent products={products} categories={categories} collections={collections} filters={filters} />
      </div>
    </main>
  );
}

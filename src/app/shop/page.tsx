import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ShopContent } from '@/components/shop/ShopContent';
import { products } from '@/data/products';

export const metadata: Metadata = {
  title: 'Shop Jewelry | Aurevia Jewels',
  description: 'Explore our complete collection of premium jewelry, including necklaces, earrings, rings, and more. Find the perfect piece for any occasion.',
};

export default function ShopPage() {
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

        <ShopContent initialProducts={products} />
      </div>
    </main>
  );
}
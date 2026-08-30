import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { collections, getCollectionBySlug } from '@/data/collections';
import { getProductsByCategory } from '@/data/products';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import Image from 'next/image';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return collections.map((collection) => ({
    slug: collection.slug,
  }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return {
      title: 'Collection Not Found | Aurevia Jewels',
    };
  }

  return {
    title: `${collection.name} | Aurevia Jewels`,
    description: collection.description,
    alternates: {
      canonical: `/collections/${collection.slug}`,
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const products = getProductsByCategory(collection.category);

  return (
    <main className="min-h-screen py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Collections', href: '/collections' },
            { label: collection.name, href: `/collections/${collection.slug}` },
          ]}
          className="mb-8"
        />

        {/* Collection Hero */}
        <AnimatedSection className="relative rounded-3xl overflow-hidden mb-16 min-h-[40vh] flex items-center justify-center">
          <Image
            src={collection.image}
            alt={collection.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6">
              {collection.name}
            </h1>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              {collection.description}
            </p>
          </div>
        </AnimatedSection>

        {/* Collection Products */}
        <AnimatedSection delay={0.2} className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-serif text-gray-900">Explore the Collection</h2>
            <p className="text-gray-500">{products.length} Pieces</p>
          </div>
          <ProductGrid products={products} />
        </AnimatedSection>

        {/* Bottom CTA */}
        <AnimatedSection delay={0.3} className="bg-primary/5 rounded-3xl p-10 text-center">
          <h3 className="text-2xl font-serif text-gray-900 mb-4">Can&apos;t find what you&apos;re looking for?</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our collection is constantly evolving. Send us a message on WhatsApp and we&apos;ll help you find the perfect piece.
          </p>
          <WhatsAppButton text="Chat with our Stylists" />
        </AnimatedSection>
      </div>
    </main>
  );
}
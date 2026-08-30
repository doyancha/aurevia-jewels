import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products, getProductBySlug, getRelatedProducts } from '@/data/products';
import { ProductDetails } from '@/components/product/ProductDetails';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { siteConfig } from '@/config/site';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Aurevia Jewels',
    };
  }

  return {
    title: `${product.name} | Aurevia Jewels`,
    description: product.shortDescription,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product, 4);
  const canonicalImages = product.images.map((image) => new URL(image, siteConfig.url).toString());
  const canonicalProductUrl = `${siteConfig.url}/products/${product.slug}`;

  // Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: canonicalImages,
    description: product.description,
    sku: product.productCode,
    offers: {
      '@type': 'Offer',
      url: canonicalProductUrl,
      priceCurrency: 'BDT',
      price: product.price,
      ...(product.availability === 'Made to Order'
        ? { availability: 'https://schema.org/PreOrder' }
        : {}),
    },
  };

  return (
    <main className="min-h-screen py-10 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/shop' },
            { label: product.category, href: product.collection ? `/collections/${product.collection}` : '/collections' },
            { label: product.name, href: `/products/${product.slug}` },
          ]}
          className="mb-8"
        />

        <ProductDetails product={product} />

        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t border-gray-100 pt-16">
            <SectionHeading
              title="You May Also Like"
              subtitle="Discover complementary pieces to complete your look"
              centered
              className="mb-10"
            />
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </main>
  );
}
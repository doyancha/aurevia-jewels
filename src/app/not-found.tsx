import Link from 'next/link';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export default function NotFound() {
  return (
    <main className="min-h-screen py-20 bg-white flex flex-col items-center justify-center text-center">
      <div className="container mx-auto px-4 max-w-2xl">
        <AnimatedSection>
          <div className="text-primary/20 font-serif text-[12rem] leading-none mb-4 tracking-tighter">
            404
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-10">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back to discovering beautiful jewelry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-medium w-full sm:w-auto"
            >
              Back to Home
            </Link>
            <Link
              href="/shop"
              className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors font-medium w-full sm:w-auto"
            >
              Browse Shop
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
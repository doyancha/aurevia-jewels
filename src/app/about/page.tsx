import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import Image from 'next/image';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { Gem, Heart, Star, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Aurevia Jewels',
  description: 'Learn about Aurevia Jewels, our story, our selection philosophy, and our commitment to bringing you beautiful, timeless jewelry.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen py-10 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
          ]}
          className="mb-8"
        />

        {/* Hero Section */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Our Story</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Aurevia Jewels was created for people who believe jewelry should feel personal. From graceful everyday pieces to statement designs for celebrations, every collection is selected with attention to beauty, versatility, and detail.
          </p>
        </AnimatedSection>

        {/* Feature Image & Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <AnimatedSection delay={0.2} className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lg">
            {/* Placeholder image for real jewelry */}
            <div className="absolute inset-0 bg-gray-200">
              <Image
                src="/images/source/photo-1519741497674-611481863552.jpg"
                alt="Elegant jewelry inspiration by Aurevia Jewels"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.3} className="space-y-6">
            <h2 className="text-3xl font-serif text-gray-900">Elevating the Everyday</h2>
            <p className="text-gray-600 leading-relaxed">
              We believe that the right piece of jewelry can transform an outfit, mark a milestone, or simply brighten an ordinary day. That&apos;s why we focus on curating collections that blend timeless design with contemporary elegance.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our approach is simple: select beautiful pieces, present them with care, and provide personal service through direct WhatsApp communication. No complicated checkouts, no impersonal processes - just genuine assistance from real people who care about helping you find exactly what you&apos;re looking for.
            </p>
            <div className="pt-4">
              <WhatsAppButton text="Chat with Us" />
            </div>
          </AnimatedSection>
        </div>

        {/* Values */}
        <AnimatedSection delay={0.4} className="bg-gray-50 rounded-3xl p-10 md:p-16 mb-16">
          <h2 className="text-3xl font-serif text-gray-900 text-center mb-12">Our Philosophy</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Gem className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Curated Quality</h3>
              <p className="text-sm text-gray-600">Every piece is hand-selected for its design, craftsmanship, and enduring beauty.</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Personal Touch</h3>
              <p className="text-sm text-gray-600">We communicate directly with you via WhatsApp to ensure a personalized shopping experience.</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Timeless Style</h3>
              <p className="text-sm text-gray-600">Our collections balance classic elegance with modern trends, creating pieces you&apos;ll wear for years.</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Trust & Transparency</h3>
              <p className="text-sm text-gray-600">We believe in honest pricing, clear communication, and building long-lasting relationships.</p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
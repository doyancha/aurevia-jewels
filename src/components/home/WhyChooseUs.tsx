import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { Gem, Shield, MessageCircle, Zap, Gift, Heart } from 'lucide-react';

export function WhyChooseUs() {
  const reasons = [
    {
      icon: <Gem className="w-8 h-8 text-champagne" />,
      title: 'Carefully Selected Designs',
      description: 'Every piece in our collection is chosen for its beauty, finish, and timeless appeal.'
    },
    {
      icon: <Shield className="w-8 h-8 text-champagne" />,
      title: 'Quality-Focused Pieces',
      description: 'We focus on the look, feel, and overall presentation of every product we offer.'
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-champagne" />,
      title: 'Direct WhatsApp Assistance',
      description: 'Get personal help choosing the perfect piece through a simple WhatsApp message.'
    },
    {
      icon: <Zap className="w-8 h-8 text-champagne" />,
      title: 'Quick WhatsApp Replies',
      description: 'Send an enquiry and continue the conversation directly with the team in WhatsApp.'
    },
    {
      icon: <Gift className="w-8 h-8 text-champagne" />,
      title: 'Gift-Friendly Guidance',
      description: 'We can help you choose pieces that feel thoughtful for gifting and special occasions.'
    },
    {
      icon: <Heart className="w-8 h-8 text-champagne" />,
      title: 'Personal Customer Support',
      description: 'We aim for a warm, attentive, and personal experience for every enquiry.'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedSection>
          <SectionHeading title="Why Choose Aurevia Jewels" />
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mt-12 md:mt-16">
          {reasons.map((reason, index) => (
            <AnimatedSection
              key={index}
              delay={0.1 * index}
              className="flex flex-col items-center text-center p-6 rounded-sm bg-warm-beige/10 hover:bg-warm-beige/20 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-6">
                {reason.icon}
              </div>
              <h3 className="text-xl font-serif text-charcoal mb-3">{reason.title}</h3>
              <p className="text-charcoal/70 font-sans leading-relaxed">{reason.description}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
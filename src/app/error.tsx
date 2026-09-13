'use client';

import Link from 'next/link';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-ivory px-6 py-20">
      <div role="alert" className="w-full max-w-xl rounded-3xl border border-charcoal/10 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-champagne-dark">Aurevia Jewels</p>
        <h1 className="mt-4 font-serif text-3xl text-charcoal sm:text-4xl">We couldn&apos;t load the catalog right now.</h1>
        <p className="mt-4 text-sm leading-relaxed text-charcoal/65">Please try again in a moment. Your browsing session is safe.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => reset()} className="rounded-full bg-charcoal px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-charcoal/85 focus:outline-none focus:ring-2 focus:ring-champagne focus:ring-offset-2">Try again</button>
          <Link href="/shop" className="rounded-full border border-charcoal/15 px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:border-champagne focus:outline-none focus:ring-2 focus:ring-champagne focus:ring-offset-2">Go to shop</Link>
        </div>
      </div>
    </main>
  );
}

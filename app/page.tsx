import { Suspense } from 'react';
import { Hero } from '@/components/hero';
import { SearchForm } from '@/components/search-form';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-8">
      <Hero />
      <Suspense>
        <SearchForm />
      </Suspense>
      <Footer />
    </main>
  );
}

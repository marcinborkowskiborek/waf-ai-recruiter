import { Hero } from '@/components/hero';
import { SearchForm } from '@/components/search-form';

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-8">
      <Hero />
      <SearchForm />
      <footer className="text-center text-xs text-muted-foreground mt-16 pb-8">
        &copy; {new Date().getFullYear()} WeAreFuture &middot; Tworzymy przyszłość pracy.{' '}
        <span className="text-primary">Teraz.</span>
      </footer>
    </main>
  );
}

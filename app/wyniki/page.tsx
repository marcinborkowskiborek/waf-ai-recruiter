import { Suspense } from 'react';
import { WynikiContent } from '@/components/wyniki-content';

export default function WynikiPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Ładowanie...</p>
      </main>
    }>
      <WynikiContent />
    </Suspense>
  );
}

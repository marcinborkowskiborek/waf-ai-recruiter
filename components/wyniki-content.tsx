'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import Image from 'next/image';
import { SearchResults } from '@/components/search-results';
import { getSystemPrompt } from '@/lib/prompts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function WynikiContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || '';
  const industry = searchParams.get('industry') || '';
  const level = searchParams.get('level') || 'senior';
  const referenceLinkedin = searchParams.get('ref') || undefined;

  const hasSent = useRef(false);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  useEffect(() => {
    if (!hasSent.current && role) {
      hasSent.current = true;
      const prompt = getSystemPrompt(role, industry, level, referenceLinkedin);
      sendMessage({ text: prompt });
    }
  }, [role, industry, level, referenceLinkedin, sendMessage]);

  const isComplete = status === 'ready' && messages.length > 1;

  return (
    <main className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <Link href="/">
          <Image
            src="/waf-logo.png"
            alt="WeAreFuture"
            width={160}
            height={40}
            className="brightness-0 invert"
          />
        </Link>
        {isComplete && (
          <Link href="/">
            <Button variant="outline" size="sm">
              Nowe wyszukiwanie
            </Button>
          </Link>
        )}
      </header>

      <div className="mb-6">
        <h1 className="text-2xl font-light">
          Szukam: <span className="text-primary font-medium">{role.length > 60 ? role.slice(0, 60) + '...' : role}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {industry && `${industry} \u00B7 `}{level} \u00B7 Polska
          {referenceLinkedin && ' \u00B7 z profilem referencyjnym'}
        </p>
      </div>

      {error && (
        <div className="text-center py-8 space-y-4">
          <p className="text-destructive">{error.message || 'Wystąpił błąd podczas wyszukiwania.'}</p>
          <Link href="/">
            <Button variant="outline">
              Spróbuj ponownie
            </Button>
          </Link>
        </div>
      )}

      {!error && <SearchResults messages={messages.filter(m => m.role === 'assistant')} status={status} />}

      {isComplete && (
        <>
          <div className="text-center mt-12 py-10 px-6 rounded-lg border border-primary/20 bg-primary/5">
            <h2 className="text-xl font-light mb-2">
              Chcesz pełną listę kandydatów?
            </h2>
            <p className="text-muted-foreground mb-6 text-sm max-w-md mx-auto">
              Nasi eksperci pomogą Ci z pełnym sourcing&apos;iem, weryfikacją kandydatów i wdrożeniem AI w HR.
            </p>
            <a
              href="https://calendly.com/marcin-wearefuture/wirtualna-kawa"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="text-base px-8">
                Umów bezpłatną rozmowę
              </Button>
            </a>
          </div>
          <footer className="text-center mt-8 pb-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              Demo stworzone przez{' '}
              <a
                href="https://wearefuture.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                WeAreFuture
              </a>
              {' '}&mdash; Tworzymy przyszłość pracy. <span className="text-primary">Teraz.</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Wyniki bazują na publicznie dostępnych danych z wyszukiwarek internetowych.
            </p>
          </footer>
        </>
      )}
    </main>
  );
}

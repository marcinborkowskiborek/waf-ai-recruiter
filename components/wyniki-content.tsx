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

  const hasSent = useRef(false);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  useEffect(() => {
    if (!hasSent.current && role) {
      hasSent.current = true;
      const prompt = getSystemPrompt(role, industry, level);
      sendMessage({ text: prompt });
    }
  }, [role, industry, level, sendMessage]);

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
            className="invert brightness-200"
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
          Szukam: <span className="text-primary font-medium">{role}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {industry && `${industry} \u00B7 `}{level} \u00B7 Polska
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

      {!error && <SearchResults messages={messages} status={status} />}

      {isComplete && (
        <footer className="text-center mt-12 pb-8 space-y-4">
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
            {' '}\u2014 Tworzymy przyszłość pracy. <span className="text-primary">Teraz.</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Wyniki bazują na publicznie dostępnych danych z wyszukiwarek internetowych.
          </p>
        </footer>
      )}
    </main>
  );
}

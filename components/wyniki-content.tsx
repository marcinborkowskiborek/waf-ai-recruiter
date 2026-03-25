'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import Image from 'next/image';
import { SearchResults } from '@/components/search-results';
import { getSystemPrompt } from '@/lib/prompts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Candidate } from '@/lib/types';

function parseCandidates(text: string): (Candidate & { tier: string })[] {
  const blocks = text.split(/\*{0,2}={2,}KANDYDAT={2,}\*{0,2}/).slice(1);
  return blocks
    .map((block) => {
      const end = block.search(/\*{0,2}={2,}END={2,}\*{0,2}/);
      const content = end > -1 ? block.slice(0, end) : block;
      const get = (label: string): string => {
        const match = content.match(new RegExp(`\\*{0,2}-?\\s*${label}\\s*\\*{0,2}:\\s*(.+)`, 'i'));
        return match?.[1]?.replace(/\*{1,2}/g, '').trim() || '';
      };
      const name = get('Imię i nazwisko');
      if (!name) return null;
      return {
        name,
        currentRole: get('Stanowisko'),
        currentCompany: get('Firma'),
        previousCompanies: get('Poprzednie firmy').split(',').map((s) => s.trim()).filter(Boolean),
        linkedinUrl: get('LinkedIn'),
        whyMatch: get('Dopasowanie'),
        tier: (get('Tier').toUpperCase().match(/TOP|STRONG|GOOD/)?.[0]) || 'GOOD',
      };
    })
    .filter(Boolean) as (Candidate & { tier: string })[];
}

export function WynikiContent() {
  const searchParams = useSearchParams();
  // Full JD stored in localStorage to avoid URL length limits
  const stored = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('waf_current_search') || 'null')
    : null;
  const role = stored?.role || searchParams.get('role') || '';
  const industry = stored?.industry || searchParams.get('industry') || '';
  const level = stored?.level || searchParams.get('level') || 'senior';
  const referenceLinkedin = stored?.referenceLinkedin || searchParams.get('ref') || undefined;

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
  const hasSaved = useRef(false);

  useEffect(() => {
    if (!isComplete || hasSaved.current) return;

    const assistantMsg = messages.find((m) => m.role === 'assistant');
    const fullText = (assistantMsg?.parts || [])
      .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
      .map((p) => p.text)
      .join('');

    const candidates = parseCandidates(fullText);

    // Don't save if no candidates found
    if (candidates.length === 0) return;
    hasSaved.current = true;

    // Read form data from localStorage
    const searches = JSON.parse(localStorage.getItem('waf_searches') || '[]');
    const lastSearch = searches[searches.length - 1] || {};

    const payload = {
      name: lastSearch.name || '',
      email: lastSearch.email || '',
      role: role,
      industry: industry,
      level: level,
      referenceLinkedin: referenceLinkedin || '',
      candidates: candidates.map((c) => ({
        name: c.name,
        currentRole: c.currentRole,
        currentCompany: c.currentCompany,
        previousCompanies: c.previousCompanies,
        linkedinUrl: c.linkedinUrl,
        whyMatch: c.whyMatch,
        tier: c.tier,
      })),
    };

    fetch('/api/save-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.error('Failed to save results:', err));
  }, [isComplete, messages, role, industry, level, referenceLinkedin]);

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
          Szukam kandydatów
        </h1>
        <p className="text-sm text-muted-foreground">
          {industry && <>{industry} &middot; </>}{level} &middot; Polska
          {referenceLinkedin && ' · z profilem referencyjnym'}
        </p>
      </div>

      {error && (
        <div className="text-center py-8 space-y-4">
          <p className="text-destructive">
            {error.message?.includes('Overloaded') || error.message?.includes('529')
              ? 'Serwer AI jest chwilowo przeciążony. Spróbuj ponownie za chwilę.'
              : error.message?.includes('rate')
                ? 'Zbyt wiele zapytań. Poczekaj chwilę i spróbuj ponownie.'
                : 'Wystąpił błąd podczas wyszukiwania. Spróbuj ponownie.'}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Spróbuj ponownie
          </Button>
        </div>
      )}

      {!error && <SearchResults messages={messages.filter(m => m.role === 'assistant')} status={status} />}

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
            {' '}&mdash; Tworzymy przyszłość pracy. <span className="text-primary">Teraz.</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Wyniki bazują na publicznie dostępnych danych z wyszukiwarek internetowych.
          </p>
        </footer>
      )}
    </main>
  );
}

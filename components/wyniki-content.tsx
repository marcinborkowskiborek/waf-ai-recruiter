'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import Image from 'next/image';
import { SearchResults, parseCandidates } from '@/components/search-results';
import { getSystemPrompt } from '@/lib/prompts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Footer } from '@/components/footer';
import Link from 'next/link';

export function WynikiContent() {
  const searchParams = useSearchParams();
  const stored = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('waf_current_search') || 'null')
    : null;
  const role = stored?.role || searchParams.get('role') || '';
  const industry = stored?.industry || searchParams.get('industry') || '';
  const level = stored?.level || searchParams.get('level') || 'senior';
  const referenceLinkedin = stored?.referenceLinkedin || searchParams.get('ref') || undefined;

  const hasSent = useRef(false);
  const startTime = useRef(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [candidateCount, setCandidateCount] = useState(0);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSent, setLeadSent] = useState(false);
  const [leadSending, setLeadSending] = useState(false);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  useEffect(() => {
    if (!hasSent.current && role) {
      hasSent.current = true;
      startTime.current = Date.now();
      const prompt = getSystemPrompt(role, industry, level, referenceLinkedin);
      sendMessage({ text: prompt });
    }
  }, [role, industry, level, referenceLinkedin, sendMessage]);

  const isComplete = status === 'ready' && messages.length > 1;

  // Track elapsed time
  useEffect(() => {
    if (isComplete) {
      setElapsedSeconds(Math.round((Date.now() - startTime.current) / 1000));
    }
  }, [isComplete]);

  // Save results to Google Sheets
  const hasSaved = useRef(false);
  useEffect(() => {
    if (!isComplete || hasSaved.current) return;

    const assistantMsg = messages.find((m) => m.role === 'assistant');
    const fullText = (assistantMsg?.parts || [])
      .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
      .map((p) => p.text)
      .join('');

    const candidates = parseCandidates(fullText);
    if (candidates.length === 0) return;
    hasSaved.current = true;

    const payload = {
      role,
      industry,
      level,
      referenceLinkedin: referenceLinkedin || '',
      utmSource: stored?.utmSource || '',
      utmMedium: stored?.utmMedium || '',
      utmCampaign: stored?.utmCampaign || '',
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
  }, [isComplete, messages, role, industry, level, referenceLinkedin, stored]);

  const handleCandidateCount = useCallback((count: number) => {
    setCandidateCount(count);
  }, []);

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadEmail || leadSending) return;
    setLeadSending(true);

    try {
      await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: leadEmail,
          searchRole: role,
          searchIndustry: industry,
          utmSource: stored?.utmSource || '',
          utmMedium: stored?.utmMedium || '',
          utmCampaign: stored?.utmCampaign || '',
        }),
      });
      setLeadSent(true);
    } catch {
      setLeadSending(false);
    }
  }

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
        {isComplete && candidateCount > 0 ? (
          <>
            <h1 className="text-2xl font-light">
              <span className="text-primary font-bold">{candidateCount}</span> kandydatów znalezionych w{' '}
              <span className="text-primary font-bold">{elapsedSeconds}</span> sekund
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Trafność wyników w testach wewnętrznych: ~80% | Budowane przez zespół WeAreFuture
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-light">Szukam kandydatów</h1>
            <p className="text-sm text-muted-foreground">
              {industry && <>{industry} &middot; </>}{level} &middot; Polska
              {referenceLinkedin && ' · z profilem referencyjnym'}
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="text-center py-8 space-y-4">
          <p className="text-destructive">
            {error.message?.includes('Overloaded') || error.message?.includes('529')
              ? 'Serwer AI jest chwilowo przeciążony. Spróbuj ponownie za chwilę.'
              : error.message?.includes('rate')
                ? 'Zbyt wiele zapytań. Poczekaj chwilę i spróbuj ponownie.'
                : error.message?.includes('zakończone')
                  ? 'Testy zakończone. Dziękujemy za udział!'
                  : 'Wystąpił błąd podczas wyszukiwania. Spróbuj ponownie.'}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Spróbuj ponownie
          </Button>
        </div>
      )}

      {!error && (
        <SearchResults
          messages={messages.filter(m => m.role === 'assistant')}
          status={status}
          onCandidateCount={handleCandidateCount}
        />
      )}

      {/* Micro-guarantee */}
      {isComplete && candidateCount > 0 && (
        <div className="text-center mt-8 py-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Żaden kandydat nie pasuje? Napisz nam dlaczego &mdash; udoskonalimy algorytm i przeszukamy ponownie.
          </p>
        </div>
      )}

      {/* Lead capture */}
      {isComplete && (
        <div className="mt-8 py-8 border-t border-border text-center space-y-4">
          <h2 className="text-lg font-light">
            Interesuje Cię wykorzystanie tego lub podobnych rozwiązań AI w swoim biznesie?
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Zostaw maila &mdash; po zakończeniu testów odezwiemy się zebrać feedback i porozmawiać o możliwościach.
          </p>

          {leadSent ? (
            <p className="text-primary font-medium">Dziękujemy! Odezwiemy się po zakończeniu testów.</p>
          ) : (
            <form onSubmit={handleLeadSubmit} className="flex gap-2 max-w-sm mx-auto">
              <Input
                type="email"
                required
                placeholder="twoj@email.pl"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
              />
              <Button type="submit" disabled={leadSending}>
                {leadSending ? '...' : 'Zostaw kontakt →'}
              </Button>
            </form>
          )}
        </div>
      )}

      {isComplete && (
        <>
          <p className="text-center text-xs text-muted-foreground mt-8">
            Wyniki bazują na publicznie dostępnych danych z wyszukiwarek internetowych.
          </p>
          <Footer />
        </>
      )}
    </main>
  );
}

'use client';

import { useMemo } from 'react';
import { CandidateCard } from './candidate-card';
import { BlurredCandidates } from './blurred-candidates';
import { SearchProgress } from './search-progress';
import type { Candidate } from '@/lib/types';
import type { UIMessage } from 'ai';

const VISIBLE_COUNT = 5;

function parseCandidates(text: string): (Candidate & { tier: string })[] {
  // Split on ===KANDYDAT=== with tolerance for markdown bold, extra whitespace, etc.
  const blocks = text.split(/\*{0,2}={2,}KANDYDAT={2,}\*{0,2}/).slice(1);
  return blocks
    .map((block) => {
      const end = block.search(/\*{0,2}={2,}END={2,}\*{0,2}/);
      const content = end > -1 ? block.slice(0, end) : block;

      const get = (label: string): string => {
        // Tolerate markdown bold around labels: **Imię i nazwisko:** or - Imię i nazwisko:
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

interface SearchResultsProps {
  messages: UIMessage[];
  status: string;
}

export function SearchResults({ messages, status }: SearchResultsProps) {
  const isSearching = status === 'streaming' || status === 'submitted';

  const assistantMsg = messages.find((m) => m.role === 'assistant');
  const textParts = assistantMsg?.parts?.filter((p) => p.type === 'text') || [];
  const fullText = textParts.map((p) => {
    if (p.type === 'text') return p.text;
    return '';
  }).join('');

  const toolCalls = useMemo(() => {
    if (!assistantMsg?.parts) return [];
    return assistantMsg.parts
      .filter((p): p is Extract<typeof p, { type: `tool-${string}` }> =>
        typeof p.type === 'string' && p.type.startsWith('tool-')
      )
      .map((p) => ({
        query: (p as unknown as { input?: { query?: string } }).input?.query || '...',
        state: (p as unknown as { state: string }).state,
      }));
  }, [assistantMsg?.parts]);

  const candidates = useMemo(() => parseCandidates(fullText), [fullText]);

  const visibleCandidates = candidates.slice(0, VISIBLE_COUNT);
  const hiddenCount = Math.max(0, candidates.length - VISIBLE_COUNT);

  return (
    <div className="space-y-6">
      {isSearching && (
        <SearchProgress
          text={fullText.split('===KANDYDAT===')[0]?.split('\n').pop() || ''}
          toolCalls={toolCalls}
        />
      )}

      {visibleCandidates.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-light">
            Znalezieni kandydaci ({candidates.length})
          </h2>
          {visibleCandidates.map((c, i) => (
            <CandidateCard key={i} candidate={c} index={i} />
          ))}
        </div>
      )}

      {hiddenCount > 0 && (
        <BlurredCandidates count={hiddenCount} searching={isSearching} />
      )}

      {!isSearching && candidates.length === 0 && fullText.length > 0 && (
        <p className="text-center text-muted-foreground">
          Nie udało się znaleźć kandydatów. Spróbuj innego opisu roli.
        </p>
      )}
    </div>
  );
}

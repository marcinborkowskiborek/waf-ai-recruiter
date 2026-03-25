'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { SearchFormData } from '@/lib/types';

const LEVELS = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'executive', label: 'Executive' },
];

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [counter, setCounter] = useState<{ count: number; limit: number; active: boolean } | null>(null);

  // Read UTM params from URL
  const utmSource = searchParams.get('utm_source') || '';
  const utmMedium = searchParams.get('utm_medium') || '';
  const utmCampaign = searchParams.get('utm_campaign') || '';

  useEffect(() => {
    fetch('/api/counter')
      .then((res) => res.json())
      .then(setCounter)
      .catch(() => {});
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const data: SearchFormData = {
      role: fd.get('role') as string,
      industry: fd.get('industry') as string,
      level: fd.get('level') as SearchFormData['level'],
      referenceLinkedin: (fd.get('referenceLinkedin') as string) || undefined,
      utmSource: utmSource || undefined,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined,
    };

    // Save full form data to localStorage (JD can be too long for URL)
    localStorage.setItem('waf_current_search', JSON.stringify(data));

    const params = new URLSearchParams({
      role: data.role.slice(0, 80),
      industry: data.industry,
      level: data.level,
    });
    if (data.referenceLinkedin) {
      params.set('ref', data.referenceLinkedin);
    }
    router.push(`/wyniki?${params.toString()}`);
  }

  // Tests ended
  if (counter && !counter.active) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="py-12 text-center space-y-4">
          <h2 className="text-xl font-light">Testy zakończone</h2>
          <p className="text-muted-foreground">
            Dziękujemy za udział! Jeśli chcesz korzystać z rozwiązania na stałe, napisz do nas:
          </p>
          <a
            href="mailto:hello@wearefuture.pl"
            className="text-primary hover:underline text-lg"
          >
            hello@wearefuture.pl
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Test banner */}
      <div className="text-center text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3 space-y-1">
        <p>🔬 Testujemy to rozwiązanie do <strong>9 kwietnia 2026</strong> lub do wyczerpania puli <strong>1000 wyszukań</strong></p>
        {counter && (
          <p className="text-xs">
            Wykorzystano <strong>{counter.count}</strong> z {counter.limit} wyszukań
          </p>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="role">Opis stanowiska <span className="text-muted-foreground font-normal">(maks. 1000 znaków)</span></Label>
              <textarea
                id="role"
                name="role"
                required
                maxLength={1000}
                rows={3}
                placeholder="Np. AI Strategy Consultant, min. 5 lat doświadczenia w transformacji cyfrowej, doświadczenie w konsultingu lub firmach technologicznych..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="referenceLinkedin">
                Znasz kogoś, kto byłby idealnym kandydatem? Wklej link do profilu &mdash; znajdziemy podobnych.{' '}
                <span className="text-muted-foreground font-normal">(opcjonalnie)</span>
              </Label>
              <Input
                id="referenceLinkedin"
                name="referenceLinkedin"
                type="url"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="industry">Branża</Label>
                <Input id="industry" name="industry" placeholder="np. IT, FMCG, pharma" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="level">Poziom doświadczenia</Label>
                <Select name="level" defaultValue="senior">
                  <SelectTrigger id="level" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={pending}>
              {pending ? 'Uruchamiam AI...' : 'Szukaj kandydatów →'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Wyniki bazują na publicznie dostępnych danych z wyszukiwarek. Maks. 3 wyszukiwania dziennie.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

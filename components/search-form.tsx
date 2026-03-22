'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { SearchFormData } from '@/lib/types';

const LEVELS = [
  { value: 'junior', label: 'Junior' },
  { value: 'regular', label: 'Regular / Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Team Lead' },
  { value: 'head', label: 'Head of...' },
  { value: 'director', label: 'Director / VP' },
  { value: 'c-level', label: 'C-level' },
];

export function SearchForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const data: SearchFormData = {
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      company: fd.get('company') as string,
      role: fd.get('role') as string,
      industry: fd.get('industry') as string,
      level: fd.get('level') as SearchFormData['level'],
    };

    // Save to localStorage for lead tracking + rate limiting
    const searches = JSON.parse(localStorage.getItem('waf_searches') || '[]');
    searches.push({ ...data, timestamp: new Date().toISOString() });
    localStorage.setItem('waf_searches', JSON.stringify(searches));

    // Client-side rate limit check
    const today = new Date().toISOString().slice(0, 10);
    const todaySearches = searches.filter(
      (s: { timestamp: string }) => s.timestamp.startsWith(today)
    );
    if (todaySearches.length > 3) {
      alert('Limit 3 wyszukiwań dziennie wyczerpany. Wróć jutro lub umów się na rozmowę z WeAreFuture.');
      setPending(false);
      return;
    }

    const params = new URLSearchParams({
      role: data.role,
      industry: data.industry,
      level: data.level,
    });
    router.push(`/wyniki?${params.toString()}`);
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-light">Wypróbuj AI Recruitera</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Imię</Label>
              <Input id="name" name="name" required placeholder="Anna" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Firma</Label>
              <Input id="company" name="company" required placeholder="Acme Sp. z o.o." />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email służbowy</Label>
            <Input id="email" name="email" type="email" required placeholder="anna@acme.pl" />
          </div>

          <Separator className="my-4" />

          <div className="space-y-1.5">
            <Label htmlFor="role">Kogo szukasz?</Label>
            <Input
              id="role"
              name="role"
              required
              placeholder="np. Sales Manager B2B, Data Engineer, HR Business Partner"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="industry">Branża</Label>
              <Input id="industry" name="industry" placeholder="np. IT, FMCG, pharma" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="level">Poziom</Label>
              <Select name="level" defaultValue="senior">
                <SelectTrigger id="level">
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
            {pending ? 'Uruchamiam AI...' : 'Szukaj kandydatów'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Wyniki bazują na publicznie dostępnych danych z wyszukiwarek.
            Demo — maks. 3 wyszukiwania dziennie.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

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
      role: fd.get('role') as string,
      industry: fd.get('industry') as string,
      level: fd.get('level') as SearchFormData['level'],
      referenceLinkedin: (fd.get('referenceLinkedin') as string) || undefined,
    };

    // Save to localStorage for lead tracking
    const searches = JSON.parse(localStorage.getItem('waf_searches') || '[]');
    searches.push({ ...data, timestamp: new Date().toISOString() });
    localStorage.setItem('waf_searches', JSON.stringify(searches));

    const params = new URLSearchParams({
      role: data.role,
      industry: data.industry,
      level: data.level,
    });
    if (data.referenceLinkedin) {
      params.set('ref', data.referenceLinkedin);
    }
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
              <Label htmlFor="email">Email służbowy</Label>
              <Input id="email" name="email" type="email" required placeholder="anna@acme.pl" />
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-1.5">
            <Label htmlFor="role">Job description</Label>
            <textarea
              id="role"
              name="role"
              required
              rows={2}
              placeholder="np. Sales Manager B2B z doświadczeniem w SaaS, umiejętności negocjacyjne, znajomość CRM"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="referenceLinkedin">
              LinkedIn osoby referencyjnej <span className="text-muted-foreground font-normal">(opcjonalnie)</span>
            </Label>
            <Input
              id="referenceLinkedin"
              name="referenceLinkedin"
              type="url"
              placeholder="https://linkedin.com/in/przykładowa-osoba"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="industry">Branża</Label>
              <Input id="industry" name="industry" placeholder="np. IT, FMCG, pharma" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="level">Seniority</Label>
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
            {pending ? 'Uruchamiam AI...' : 'Szukaj kandydatów'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Wyniki bazują na publicznie dostępnych danych z wyszukiwarek.
            <br />
            Demo — maks. 3 wyszukiwania dziennie.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

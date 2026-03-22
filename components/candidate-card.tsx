import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Candidate } from '@/lib/types';

const TIER_COLORS: Record<string, string> = {
  TOP: 'bg-primary text-primary-foreground',
  STRONG: 'bg-accent text-accent-foreground',
  GOOD: 'bg-secondary text-secondary-foreground',
};

interface CandidateCardProps {
  candidate: Candidate & { tier: string };
  index: number;
}

export function CandidateCard({ candidate, index }: CandidateCardProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="flex items-start gap-4 py-4">
        <span className="text-2xl font-bold text-muted-foreground/30 tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <a
              href={candidate.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary transition-colors"
            >
              {candidate.name}
            </a>
            <Badge className={TIER_COLORS[candidate.tier] || ''} variant="secondary">
              {candidate.tier}
            </Badge>
          </div>
          <p className="text-sm text-foreground/90">
            {candidate.currentRole}
          </p>
          <p className="text-sm">
            @ <strong>{candidate.currentCompany}</strong>
          </p>
          {candidate.previousCompanies.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Poprzednio: {candidate.previousCompanies.join(', ')}
            </p>
          )}
          <p className="text-xs text-primary/80">{candidate.whyMatch}</p>
        </div>
      </CardContent>
    </Card>
  );
}

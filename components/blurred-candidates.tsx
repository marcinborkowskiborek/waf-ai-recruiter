import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BlurredCandidatesProps {
  count: number;
}

export function BlurredCandidates({ count }: BlurredCandidatesProps) {
  if (count <= 0) return null;

  return (
    <div className="relative">
      <div className="space-y-3 blur-sm pointer-events-none select-none" aria-hidden>
        {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
          <Card key={i} className="border-border/30">
            <CardContent className="py-4">
              <div className="h-4 bg-muted rounded w-48 mb-2" />
              <div className="h-3 bg-muted/60 rounded w-64 mb-1" />
              <div className="h-3 bg-muted/40 rounded w-36" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
        <p className="text-lg font-light mb-2">
          +{count} kandydatów
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Chcesz zobaczyć pełne wyniki?
        </p>
        <Button asChild size="lg">
          <a href="https://wearefuture.ai" target="_blank" rel="noopener noreferrer">
            Umów rozmowę z WeAreFuture
          </a>
        </Button>
      </div>
    </div>
  );
}

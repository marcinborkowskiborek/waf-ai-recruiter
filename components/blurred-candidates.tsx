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

      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-primary/20 bg-primary/5 backdrop-blur-sm">
        <h2 className="text-xl font-light mb-2">
          Chcesz pełną listę kandydatów?
        </h2>
        <p className="text-muted-foreground mb-6 text-sm max-w-md mx-auto text-center">
          +{count} kolejnych kandydatów. Nasi eksperci pomogą Ci z pełnym sourcing&apos;iem, weryfikacją kandydatów i wdrożeniem AI w HR.
        </p>
        <a href="https://calendly.com/marcin-wearefuture/wirtualna-kawa" target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="text-base px-8">
            Umów bezpłatną rozmowę
          </Button>
        </a>
      </div>
    </div>
  );
}

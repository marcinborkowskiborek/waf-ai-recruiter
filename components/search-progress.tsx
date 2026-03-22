'use client';

const MAX_VISIBLE = 4;

interface SearchProgressProps {
  text: string;
  toolCalls: { query: string; state: string }[];
}

export function SearchProgress({ text, toolCalls }: SearchProgressProps) {
  const visible = toolCalls.slice(-MAX_VISIBLE);
  const hiddenCount = Math.max(0, toolCalls.length - MAX_VISIBLE);

  return (
    <div className="space-y-2 overflow-hidden">
      {hiddenCount > 0 && (
        <p className="text-xs text-muted-foreground/60">
          + {hiddenCount} wcześniejszych wyszukiwań
        </p>
      )}
      {visible.map((tc, i) => (
        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={tc.state !== 'output-available' ? 'animate-pulse' : ''}>
            {tc.state === 'output-available' ? '\u2713' : '\uD83D\uDD0D'}
          </span>
          <span className="font-mono text-xs truncate">{tc.query}</span>
        </div>
      ))}
      {text && (
        <p className="text-sm text-foreground/80 animate-pulse">{text}</p>
      )}
    </div>
  );
}

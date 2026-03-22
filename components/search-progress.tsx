'use client';

interface SearchProgressProps {
  text: string;
  toolCalls: { query: string; state: string }[];
}

export function SearchProgress({ text, toolCalls }: SearchProgressProps) {
  return (
    <div className="space-y-3">
      {toolCalls.map((tc, i) => (
        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={tc.state !== 'output-available' ? 'animate-pulse' : ''}>
            {tc.state === 'output-available' ? '\u2713' : '\uD83D\uDD0D'}
          </span>
          <span className="font-mono text-xs">{tc.query}</span>
        </div>
      ))}
      {text && (
        <p className="text-sm text-foreground/80 animate-pulse">{text}</p>
      )}
    </div>
  );
}

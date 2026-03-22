import { streamText, stepCountIs } from 'ai';
import { gateway } from '@ai-sdk/gateway';
import { webSearch } from '@/lib/tools';
import { checkRateLimit, incrementRateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { allowed } = await checkRateLimit();
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Limit wyszukiwań wyczerpany. Wróć jutro lub umów się na rozmowę z WeAreFuture.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { messages } = await req.json();

  const firstUserMsg = messages.find((m: { role: string }) => m.role === 'user');
  const systemPrompt = firstUserMsg?.parts
    ?.filter((p: { type: string }) => p.type === 'text')
    .map((p: { text: string }) => p.text)
    .join('') || '';

  const cookieValue = await incrementRateLimit();

  const result = streamText({
    model: gateway('anthropic/claude-sonnet-4.6'),
    system: systemPrompt,
    tools: { web_search: webSearch },
    stopWhen: stepCountIs(8),
    prompt: 'Rozpocznij wyszukiwanie kandydatów zgodnie z instrukcjami.',
  });

  const response = result.toUIMessageStreamResponse();
  response.headers.set(
    'Set-Cookie',
    `waf_rc=${encodeURIComponent(cookieValue)}; HttpOnly; Secure; SameSite=Lax; Max-Age=86400; Path=/`
  );
  return response;
}

import { streamText, stepCountIs } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { webSearch } from '@/lib/tools';
import { isTestingActive, incrementSearchCount } from '@/lib/redis';

const anthropic = createAnthropic();

export const maxDuration = 120;

export async function POST(req: Request) {
  // Check if testing period is still active
  const active = await isTestingActive();
  if (!active) {
    return Response.json(
      { error: 'Testy zakończone. Dziękujemy za udział!' },
      { status: 403 }
    );
  }

  // Increment global search counter
  await incrementSearchCount();

  const { messages } = await req.json();

  const firstUserMsg = messages.find((m: { role: string }) => m.role === 'user');

  // Extract system prompt from user message - handle both parts and content formats
  let systemPrompt = '';
  if (firstUserMsg?.parts) {
    systemPrompt = firstUserMsg.parts
      .filter((p: { type: string }) => p.type === 'text')
      .map((p: { text: string }) => p.text)
      .join('');
  } else if (firstUserMsg?.content) {
    systemPrompt = typeof firstUserMsg.content === 'string'
      ? firstUserMsg.content
      : '';
  }

  if (!systemPrompt) {
    console.error('No system prompt extracted from messages:', JSON.stringify(messages).slice(0, 500));
    return Response.json(
      { error: 'Brak danych wyszukiwania. Wróć na stronę główną i spróbuj ponownie.' },
      { status: 400 }
    );
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4.6'),
    system: systemPrompt,
    tools: { web_search: webSearch },
    stopWhen: stepCountIs(8),
    prompt: 'Rozpocznij wyszukiwanie kandydatów zgodnie z instrukcjami.',
    maxRetries: 5,
  });

  return result.toUIMessageStreamResponse();
}

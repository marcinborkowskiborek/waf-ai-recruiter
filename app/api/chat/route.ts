import { streamText, stepCountIs } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { webSearch } from '@/lib/tools';

const anthropic = createAnthropic();

export const maxDuration = 60;

export async function POST(req: Request) {
  // Rate limiting disabled for testing
  // TODO: re-enable before public launch

  const { messages } = await req.json();

  const firstUserMsg = messages.find((m: { role: string }) => m.role === 'user');
  const systemPrompt = firstUserMsg?.parts
    ?.filter((p: { type: string }) => p.type === 'text')
    .map((p: { text: string }) => p.text)
    .join('') || '';

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: systemPrompt,
    tools: { web_search: webSearch },
    stopWhen: stepCountIs(8),
    prompt: 'Rozpocznij wyszukiwanie kandydatów zgodnie z instrukcjami.',
  });

  return result.toUIMessageStreamResponse();
}

import { tool } from 'ai';
import { z } from 'zod';

export const webSearch = tool({
  description: 'Search Google for publicly available information. Use to find LinkedIn profiles, company team pages, and professional directories.',
  inputSchema: z.object({
    query: z.string().describe('The search query to execute'),
  }),
  execute: async ({ query }) => {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        gl: 'pl',
        hl: 'pl',
        num: 10,
      }),
    });

    if (!res.ok) {
      return { error: `Search failed: ${res.status}` };
    }

    const data = await res.json();

    const results = (data.organic || []).slice(0, 8).map(
      (r: { title: string; link: string; snippet: string }) => ({
        title: r.title,
        url: r.link,
        snippet: r.snippet,
      })
    );

    return { results, query };
  },
});

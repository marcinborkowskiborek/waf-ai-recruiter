import { getSearchCount, isTestingActive, SEARCH_LIMIT } from '@/lib/redis';

export async function GET() {
  const [count, active] = await Promise.all([
    getSearchCount(),
    isTestingActive(),
  ]);

  return Response.json({ count, limit: SEARCH_LIMIT, active });
}

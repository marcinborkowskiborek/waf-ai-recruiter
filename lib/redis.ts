import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const SEARCH_COUNT_KEY = 'waf:search_count';
const SEARCH_LIMIT = 1000;
const TEST_END_DATE = new Date('2026-04-09T23:59:59+02:00'); // CEST

export async function getSearchCount(): Promise<number> {
  const count = await redis.get<number>(SEARCH_COUNT_KEY);
  return count ?? 0;
}

export async function incrementSearchCount(): Promise<number> {
  return redis.incr(SEARCH_COUNT_KEY);
}

export async function isTestingActive(): Promise<boolean> {
  const [count, now] = await Promise.all([
    getSearchCount(),
    Promise.resolve(new Date()),
  ]);
  return count < SEARCH_LIMIT && now <= TEST_END_DATE;
}

export { SEARCH_LIMIT };

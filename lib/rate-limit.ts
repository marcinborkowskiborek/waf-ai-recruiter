import { cookies } from 'next/headers';

const MAX_PER_DAY = parseInt(process.env.MAX_SEARCHES_PER_DAY || '3', 10);

interface RateLimitData {
  count: number;
  date: string;
}

export async function checkRateLimit(): Promise<{ allowed: boolean; remaining: number }> {
  const cookieStore = await cookies();
  const raw = cookieStore.get('waf_rc')?.value;
  const today = new Date().toISOString().slice(0, 10);

  let data: RateLimitData = { count: 0, date: today };

  if (raw) {
    try {
      data = JSON.parse(raw);
      if (data.date !== today) {
        data = { count: 0, date: today };
      }
    } catch {
      data = { count: 0, date: today };
    }
  }

  return {
    allowed: data.count < MAX_PER_DAY,
    remaining: Math.max(0, MAX_PER_DAY - data.count),
  };
}

export async function incrementRateLimit(): Promise<string> {
  const cookieStore = await cookies();
  const raw = cookieStore.get('waf_rc')?.value;
  const today = new Date().toISOString().slice(0, 10);

  let data: RateLimitData = { count: 0, date: today };

  if (raw) {
    try {
      data = JSON.parse(raw);
      if (data.date !== today) {
        data = { count: 0, date: today };
      }
    } catch {
      data = { count: 0, date: today };
    }
  }

  data.count += 1;
  return JSON.stringify(data);
}

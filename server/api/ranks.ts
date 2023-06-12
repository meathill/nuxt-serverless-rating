import {H3Event} from "h3";
import Redis from "ioredis";

export default defineEventHandler(async function (event: H3Event): Promise<Record<string, string>> {
  const redis = new Redis(process.env.REDIS_URL as string);
  let isInit = true;
  let cursor = '0';
  const keys: string[] = [];
  while (cursor !== '0' || isInit) {
    isInit = false;
    const [_cursor, _keys] = await redis.scan(cursor, 'MATCH', '$$$-*', 'COUNT', 250);
    cursor = _cursor;
    keys.push(..._keys);
  }
  const data = await redis.mget(keys);
  redis.quit();
  return keys.reduce((acc, key: string, index: number) => {
    acc[key] = data[index] || '';
    return acc;
  }, {} as Record<string, string>)
});

import Redis from "ioredis";
import {createNewRating, getHour, getRedisKey} from "../../utils";
import {RateData} from "../../types";

export default defineEventHandler(async function (event) {
  const redis = new Redis(process.env.REDIS_URL as string);
  const body = await readBody(event);
  const redisKey = getRedisKey(body.uid);
  let data;
  try {
    const stored = await redis.get(redisKey);
    data = stored ? JSON.parse(stored) : createNewRating();
  } catch (e) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to fetch stored data. ' +
        ((e as Error).message || Object.prototype.toString.call(e)),
    });
  }

  const key = `r${body.rate}` as keyof RateData;
  data[key] += 1;
  if (body.oldRate) {
    const key = `r${body.oldRate}` as keyof RateData;
    data[key] -= 1;
  }
  // backup data by hour
  const hour = getHour(Date.now());
  const stored = JSON.stringify(data);
  await Promise.all([
    redis.set(redisKey, stored),
    redis.set(`${body.uid}_${hour}`, stored, 'EX', 86400 * 30),
  ]);
  redis.quit();
  return data;
});

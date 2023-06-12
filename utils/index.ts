import {RateData} from "~/types";

export function getRedisKey(uid: string): string {
  return '$$$-' + uid;
}

export function createNewRating(): RateData {
  return {
    r1: 0,
    r2: 0,
    r3: 0,
    r4: 0,
    r5: 0,
  };
}

export function getHour(time: number): number {
  return time / 36e5 % 1000 >> 0;
}

export function getAvg(item: RateData): [avg: number, voted: number, rate: number] {
  let voted = 0;
  let rate = 0;
  for (let i = 1; i <= 5; i++) {
    const key = 'r' + i as keyof RateData;
    const number = item[key] || 0;
    voted += number;
    rate += i * number;
  }
  return [Math.round(rate / voted * 100) / 100, voted, rate]
}

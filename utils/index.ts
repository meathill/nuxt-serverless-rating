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

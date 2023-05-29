export function getRedisKey(uid: string): string {
  return '$$$-' + uid;
}

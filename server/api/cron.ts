import {H3Event} from "h3";

export default defineEventHandler(function handler(req: H3Event) {
  console.log('xxx hello world');
  return 'hello world';
})

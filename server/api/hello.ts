import {H3Event} from "h3";

export default async function defineEventHandler(event: H3Event): Promise<unknown> {
  return 'hello, ' + event.node.req.url;
}

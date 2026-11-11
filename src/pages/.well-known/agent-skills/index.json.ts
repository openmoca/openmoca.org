// /.well-known/agent-skills/index.json: the Agent Skills discovery index (https://agentskills.io).
import type { APIRoute } from 'astro';
import { index } from './skills';

export const GET: APIRoute = () =>
  new Response(`${JSON.stringify(index(), null, 2)}\n`, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });

// /.well-known/agent-skills/openmoca/SKILL.md: moca-spec's agent-skills/openmoca/SKILL.md, byte for byte, so its
// digest matches the one in the discovery index.
import type { APIRoute } from 'astro';
import { skillFile } from '../skills';

export const GET: APIRoute = () =>
  new Response(skillFile('openmoca'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });

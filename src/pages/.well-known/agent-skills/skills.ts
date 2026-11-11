// The agent skills openmoca.org publishes, from moca-spec's agent-skills/ (copied by scripts/sync-docs.mjs), with the
// SHA-256 digest of each SKILL.md's exact bytes, as the Agent Skills discovery index lists them.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://openmoca.org';

// The skills, by name. Each one's description is read from its SKILL.md frontmatter, so the index never drifts from it.
export const SKILLS = ['openmoca'].map((name) => ({ name, description: description(skillFile(name).toString('utf8')) }));

function description(skill: string): string {
  const value = /^---\n[\s\S]*?^description:\s*(.+)$[\s\S]*?^---$/m.exec(skill)?.[1]?.trim();
  if (!value) throw new Error('SKILL.md has no description in its frontmatter');
  return value.replace(/^(["'])(.*)\1$/, '$2');
}

export function skillFile(name: string): Buffer {
  // Read from the site's root at build time: these routes are bundled, so a path relative to this file breaks.
  return readFileSync(join(process.cwd(), 'src', 'generated', 'agent-skills', name, 'SKILL.md'));
}

export function index() {
  return {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: SKILLS.map((s) => ({
      name: s.name,
      type: 'skill-md',
      description: s.description,
      url: `${SITE}/.well-known/agent-skills/${s.name}/SKILL.md`,
      digest: `sha256:${createHash('sha256').update(skillFile(s.name)).digest('hex')}`,
    })),
  };
}

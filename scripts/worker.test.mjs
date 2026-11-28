// node --test scripts/: the Worker's routing for the moca: vocabulary (worker/index.js), with a stand-in for the
// static assets. The vocabulary is a hash namespace: https://w3id.org/moca/ns redirects here, and /ns answers with a
// 303 to the Turtle or to the page, by the Accept header.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { register } from 'node:module';
import { test } from 'node:test';

// The Worker imports JSON as its bundler allows, without an import attribute; Node needs one, so add it here.
register(`data:text/javascript,${encodeURIComponent(`
export async function load(url, context, next) {
  if (url.endsWith('.json')) return next(url, { ...context, importAttributes: { type: 'json' } });
  return next(url, context);
}`)}`);
// The build writes worker/generated/csp.json (scripts/csp-hashes.mjs); CI runs the tests after it.
const built = existsSync(new URL('../worker/generated/csp.json', import.meta.url));
const { default: worker } = built ? await import('../worker/index.js') : { default: null };

const ASSETS = {
  fetch: async (request) => {
    const { pathname } = new URL(request.url);
    if (pathname === '/ns.ttl') return new Response('@prefix moca: <https://w3id.org/moca/ns#> .\n', { headers: { 'Content-Type': 'application/octet-stream' } });
    if (pathname === '/ns/' || pathname === '/ns/index.html') return new Response('<!doctype html><title>moca:</title>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    return new Response('not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  },
};
const get = (path, accept) => worker.fetch(new Request(`https://openmoca.org${path}`, { headers: accept ? { Accept: accept } : {} }), { ASSETS });

test('/ns sends a client that asks for Turtle to /ns.ttl with a 303, readable from any origin', { skip: built ? false : 'run npm run build first: it writes worker/generated/csp.json' }, async () => {
  for (const accept of ['text/turtle', 'text/turtle, text/html;q=0.9', 'text/html;q=0.5, text/turtle;q=0.5']) {
    const r = await get('/ns', accept);
    assert.equal(r.status, 303, accept);
    assert.equal(r.headers.get('Location'), 'https://openmoca.org/ns.ttl', accept);
    assert.equal(r.headers.get('Access-Control-Allow-Origin'), '*', accept);
    assert.match(r.headers.get('Vary') ?? '', /\bAccept\b/, accept);
  }
});

test('/ns sends a browser to the page with a 303, readable from any origin', { skip: built ? false : 'run npm run build first: it writes worker/generated/csp.json' }, async () => {
  for (const accept of ['text/html,application/xhtml+xml,*/*;q=0.8', undefined, 'application/json']) {
    const r = await get('/ns', accept);
    assert.equal(r.status, 303, String(accept));
    assert.equal(r.headers.get('Location'), 'https://openmoca.org/ns/', String(accept));
    assert.equal(r.headers.get('Access-Control-Allow-Origin'), '*', String(accept));
  }
});

test('/ns.ttl is Turtle, readable from any origin, never sniffed', { skip: built ? false : 'run npm run build first: it writes worker/generated/csp.json' }, async () => {
  const r = await get('/ns.ttl');
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('Content-Type'), 'text/turtle; charset=utf-8');
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), '*');
  assert.equal(r.headers.get('X-Content-Type-Options'), 'nosniff');
});

test('the page at /ns/ is HTML and varies on Accept', { skip: built ? false : 'run npm run build first: it writes worker/generated/csp.json' }, async () => {
  const r = await get('/ns/', 'text/html');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('Content-Type') ?? '', /^text\/html/);
  assert.match(r.headers.get('Vary') ?? '', /\bAccept\b/);
});

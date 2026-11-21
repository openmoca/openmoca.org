// node --test scripts/: the sync's rules for pages from other repositories (as-content.mjs).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asContent, safeUrl } from './as-content.mjs';

const page = { repo: 'moca-example', path: 'README.md' };
const run = (markdown) => {
  const problems = [];
  return { text: asContent(markdown, page, problems), problems };
};

test('text that MDX would read as code is escaped', () => {
  const { text, problems } = run('import x from "y"\nexport const a = 1\n\nA {value} here.');
  assert.equal(text, '&#105;mport x from "y"\n&#101;xport const a = 1\n\nA \\{value\\} here.');
  assert.deepEqual(problems, []);
});

test('code is left as it is', () => {
  const md = '```js\nimport { a } from "b";\n<script>{x}</script>\n```\n\nUse `{a} <b>` here.';
  assert.equal(run(md).text, md);
});

test('a tag not on the list is shown as text', () => {
  assert.equal(run('<script>alert(1)</script>').text, '&lt;script>alert(1)&lt;/script>');
  assert.equal(run('<Tabs>').text, '&lt;Tabs>');
  assert.equal(run('a < b, and x-<vendor>-<key>').text, 'a &lt; b, and x-&lt;vendor>-&lt;key>');
});

test('a tag on the list keeps only its allowed attributes', () => {
  assert.equal(run('<img src="a.png" alt="A" onerror="x()" style="y">').text, '<img src="a.png" alt="A" />');
  assert.equal(run('<details open><summary>More</summary>').text, '<details open><summary>More</summary>');
  assert.equal(run('<a href="https://example.com" title="{t}">x</a>').text, '<a href="https://example.com" title="&#123;t&#125;">x</a>');
});

test('a link that is not to the web, email or the site is a problem', () => {
  for (const md of ['<a href="javascript:x()">x</a>', '[x]( javascript:x())', '[x]: java&#115;cript:x()', '![x](data:text/html,x)', '<img src="vbscript:x">']) {
    assert.notDeepEqual(run(md).problems, [], md);
  }
  for (const md of ['[x](https://example.com)', '[x](/spec/)', '[x](#part)', '[x](mailto:a@example.com)', '[x](../a.md)']) {
    assert.deepEqual(run(md).problems, [], md);
  }
});

test('links are checked as a browser reads them', () => {
  assert.equal(safeUrl('javascript&#58;x()'), false);
  assert.equal(safeUrl('javascript&colon;x()'), false);
  assert.equal(safeUrl(' JavaScript:x()'), false);
  assert.equal(safeUrl('java\\script:x()'), false);
  assert.equal(safeUrl('https://example.com/a:b'), true);
  assert.equal(safeUrl('a/b:c'), true);
});

test('autolinks become plain links, and comments stay for the tabs', () => {
  assert.equal(run('See <https://example.com>.').text, 'See [https://example.com](https://example.com).');
  assert.equal(run('<!-- tabs -->\n**TypeScript:**').text, '<!-- tabs -->\n**TypeScript:**');
});

test('escapes already in the source are kept', () => {
  assert.equal(run('\\<b\\> and \\{').text, '\\<b\\> and \\{');
});

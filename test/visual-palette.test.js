import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const cssUrl = new URL('../src/styles.css', import.meta.url);
const htmlUrl = new URL('../index.html', import.meta.url);

test('hero uses the supplied portrait as its background', async () => {
  const [css, html] = await Promise.all([
    readFile(cssUrl, 'utf8'),
    readFile(htmlUrl, 'utf8'),
  ]);

  assert.match(
    css,
    /assets\/hero-portrait\.png/,
    'the new portrait must be referenced by the hero background',
  );
  assert.doesNotMatch(
    html,
    /class="hero-crop"/,
    'the previous cropped portrait must not cover the new background',
  );
});

test('site palette is built from the supplied three colors', async () => {
  const css = await readFile(cssUrl, 'utf8');

  assert.match(css, /--buttermilk:\s*#fff1b5/i);
  assert.match(css, /--pastel-blue:\s*#c1dbe8/i);
  assert.match(css, /--old-burgundy:\s*#43302e/i);
  assert.match(css, /--ink:\s*var\(--old-burgundy\)/i);
  assert.match(css, /\.audience-block\s*\{[^}]*background:\s*var\(--old-burgundy\)/is);
});

test('existing white surfaces stay white', async () => {
  const css = await readFile(cssUrl, 'utf8');

  assert.match(css, /--paper:\s*#fff(?:fff)?/i);
  assert.match(css, /\.problem-block\s*\{[^}]*background:\s*var\(--paper\)/is);
  assert.match(css, /\.formula-block\s*\{[^}]*background:\s*var\(--paper\)/is);
  assert.match(css, /\.change-block\s*\{[^}]*background:\s*var\(--paper\)/is);
  assert.match(css, /\.final-block\s*\{[^}]*background:\s*var\(--paper\)/is);
  assert.match(css, /\.button--white\s*\{[^}]*background:\s*var\(--paper\)/is);
});

test('primary hero action uses the pastel blue accent', async () => {
  const html = await readFile(htmlUrl, 'utf8');

  assert.match(
    html,
    /class="button button--blue"[^>]*>Собрать свою формулу эксперта/,
  );
});

test('hero collage keeps the pen and notebook near the heading and stars behind the portrait', async () => {
  const [css, html] = await Promise.all([
    readFile(cssUrl, 'utf8'),
    readFile(htmlUrl, 'utf8'),
  ]);

  assert.match(html, /hero-object--stars/);
  assert.match(html, /hero-portrait-cover/);
  assert.doesNotMatch(html, /hero-object--arrow/);
  assert.match(html, /hero-object--pen/);
  assert.match(html, /hero-object--notebook/);
  assert.match(css, /\.hero-object--stars\s*\{[^}]*left:\s*46\.5%/is);
});

test('problem composition points to the laptop and clips the note', async () => {
  const [css, html] = await Promise.all([
    readFile(cssUrl, 'utf8'),
    readFile(htmlUrl, 'utf8'),
  ]);

  assert.doesNotMatch(html, /problem-object--clip/);
  assert.match(html, /note-paper-clip/);
  assert.match(html, /problem-object--arrow[^>]+src="\.\/assets\/collage\/arrow\.jpg"/is);
  assert.match(css, /\.problem-object--arrow\s*\{[^}]*mix-blend-mode:\s*multiply/is);
  assert.match(css, /\.problem-object--arrow\s*\{[^}]*width:\s*clamp\(220px,\s*21vw,\s*320px\)/is);
  assert.match(css, /\.problem-object--arrow\s*\{[^}]*transform:\s*rotate\(-2deg\)/is);
  assert.match(css, /\.note-paper::before\s*\{/);
  assert.match(css, /\.note-paper-clip\s*\{[^}]*top:\s*-82px/is);
  assert.match(css, /\.note-paper-clip\s*\{[^}]*transform:\s*translateX\(-50%\);/is);
  assert.match(css, /\.problem-tag\s*\{[^}]*width:\s*min\(62%,\s*760px\)/is);
});

test('change labels use the requested colors and shared vertical guides', async () => {
  const css = await readFile(cssUrl, 'utf8');

  assert.match(
    css,
    /\.change-row > div:first-child span\s*\{[^}]*left:\s*clamp\(72px,\s*7vw,\s*104px\)[^}]*color:\s*var\(--pastel-blue\)/is,
  );
  assert.match(
    css,
    /\.change-after span\s*\{[^}]*left:\s*clamp\(92px,\s*9vw,\s*132px\)[^}]*color:\s*var\(--buttermilk\)/is,
  );
});

test('formula and final cards do not render decorative clips', async () => {
  const [css, html] = await Promise.all([
    readFile(cssUrl, 'utf8'),
    readFile(htmlUrl, 'utf8'),
  ]);

  assert.doesNotMatch(html, /class="mini-clip"/);
  assert.doesNotMatch(css, /\.mini-clip\s*\{/);
});

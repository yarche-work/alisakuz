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

test('mobile hero layers the portrait behind the copy instead of below it', async () => {
  const css = await readFile(cssUrl, 'utf8');

  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.hero-block\s*\{[^}]*min-height:\s*930px[^}]*background-image:\s*none/is);
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.hero-block::after\s*\{[^}]*inset:\s*110px 0 0[^}]*background-image:\s*url\('\.\.\/assets\/hero-portrait\.png'\)[^}]*background-size:\s*auto 100%/is);
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.hero-block::after\s*\{[^}]*filter:\s*saturate\(\.78\) brightness\(1\.08\)/is);
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.hero-block::after\s*\{[^}]*mask-image:\s*linear-gradient\(to bottom/is);
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.hero-content\s*\{[^}]*padding:\s*90px 18px 80px/is);
});

test('problem composition points to the laptop and clips the note', async () => {
  const [css, html] = await Promise.all([
    readFile(cssUrl, 'utf8'),
    readFile(htmlUrl, 'utf8'),
  ]);

  assert.doesNotMatch(html, /problem-object--clip/);
  assert.match(html, /<img class="note-paper-clip" src="\.\/assets\/collage\/clip\.png"/i);
  assert.match(html, /problem-object--arrow[^>]+src="\.\/assets\/collage\/arrow\.jpg"/is);
  assert.match(css, /\.problem-object--arrow\s*\{[^}]*mix-blend-mode:\s*multiply/is);
  assert.match(css, /\.problem-object--arrow\s*\{[^}]*width:\s*clamp\(220px,\s*21vw,\s*320px\)/is);
  assert.match(css, /\.problem-object--arrow\s*\{[^}]*transform:\s*rotate\(-2deg\)/is);
  assert.match(css, /\.note-paper::before\s*\{/);
  assert.match(css, /\.note-paper-clip\s*\{[^}]*top:\s*-82px/is);
  assert.match(css, /\.note-paper-clip\s*\{[^}]*transform:\s*translateX\(-50%\);/is);
  assert.match(css, /\.problem-tag\s*\{[^}]*width:\s*min\(62%,\s*760px\)/is);
});

test('mobile problem note is compact, unbolded, and clipped to the paper edge', async () => {
  const css = await readFile(cssUrl, 'utf8');

  assert.match(css, /\.note-paper strong\s*\{[^}]*font-weight:\s*400/is);
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.paper-stack\s*\{[^}]*min-height:\s*650px/is);
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.problem-tag\s*\{[^}]*z-index:\s*2/is);
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.paper-stack\s*\{[^}]*z-index:\s*5/is);
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.note-paper\s*\{[^}]*width:\s*calc\(100% - 32px\)[^}]*min-height:\s*0/is);
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.note-paper-clip\s*\{[^}]*top:\s*-50px/is);
});

test('mobile question pills form a compact two-to-three-column grid', async () => {
  const css = await readFile(cssUrl, 'utf8');

  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.question-pills\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/is);
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.pill\s*\{[^}]*min-height:\s*50px[^}]*padding:\s*6px 8px/is);
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.pill--wide\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/is);
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.pill--wide\s*\{[^}]*min-height:\s*46px/is);
  assert.match(css, /@media \(min-width:\s*520px\) and \(max-width:\s*720px\)[\s\S]*?\.question-pills\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/is);
});

test('final card separates the handwritten hook from the framed conclusion', async () => {
  const html = await readFile(htmlUrl, 'utf8');

  assert.match(html, /<h2><span>Ваша «Формула эксперта»<\/span><em>Хватит ломать голову, что сегодня снять<\/em><\/h2>/i);
  assert.match(html, /<div class="final-text">\s*<strong>Пора увидеть, структурировать и правильно показать то ценное, что уже есть\.<\/strong>\s*<\/div>/i);
  assert.doesNotMatch(html, /<div class="final-text">\s*<p>/i);
});

test('mobile final CTA sits in the open space below the copy instead of over the mockups', async () => {
  const css = await readFile(cssUrl, 'utf8');

  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.final-card > \.button\s*\{[^}]*position:\s*relative[^}]*right:\s*auto[^}]*bottom:\s*auto[^}]*margin:\s*32px 24px 0[^}]*width:\s*calc\(100% - 48px\)/is);
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

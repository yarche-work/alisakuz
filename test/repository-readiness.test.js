import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const rootUrl = new URL('../', import.meta.url);

async function readProjectFile(path) {
  return readFile(new URL(path, rootUrl), 'utf8');
}

test('Vite emits relative URLs that work on GitHub project pages', async () => {
  const config = await import(new URL('../vite.config.js', import.meta.url));

  assert.equal(config.default.base, './');
});

test('repository includes an automated GitHub Pages deployment', async () => {
  const workflow = await readProjectFile('.github/workflows/deploy-pages.yml');

  assert.match(workflow, /branches:\s*\[main\]/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});

test('generated and local-only files are excluded from Git', async () => {
  const gitignore = await readProjectFile('.gitignore');

  for (const pattern of ['node_modules/', 'dist/', '.DS_Store', '*.log']) {
    assert.match(gitignore, new RegExp(`^${pattern.replace('.', '\\.').replace('*', '\\*')}$`, 'm'));
  }
});

test('all site assets live in the documented assets directory', async () => {
  const [html, css] = await Promise.all([
    readProjectFile('index.html'),
    readProjectFile('src/styles.css'),
  ]);

  assert.doesNotMatch(html, /\.\/pinterest\//);
  assert.doesNotMatch(html, /\.\/IMG_/);
  assert.doesNotMatch(css, /ChatGPT Image/);

  const expectedAssets = [
    'assets/hero-portrait.png',
    'assets/collage/arrow.jpg',
    'assets/collage/clip.jpg',
    'assets/collage/laptop.jpg',
    'assets/collage/notebook.jpg',
    'assets/collage/pen.jpg',
    'assets/collage/stars.jpg',
    'assets/fonts/MintSansBold.otf',
    'assets/fonts/MintSansRegular.otf',
  ];

  await Promise.all(expectedAssets.map((path) => access(new URL(path, rootUrl))));
});

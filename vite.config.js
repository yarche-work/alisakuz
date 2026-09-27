import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset URLs keep the build portable across user pages,
  // project pages, custom domains, and local previews of dist/index.html.
  base: './',
});

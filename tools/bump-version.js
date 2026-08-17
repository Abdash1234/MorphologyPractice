/*
 * tools/bump-version.js — stamp a release into the service worker.
 * Run with:  node tools/bump-version.js
 *
 * Rewrites VERSION and the PRECACHE list in sw.js from what is actually on
 * disk, so a new file can never be left out of the offline cache and a deploy
 * always invalidates the old one.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const swPath = path.join(root, 'sw.js');

/* everything the app needs to run with no network */
function shellFiles() {
  const list = ['./', './index.html', './manifest.webmanifest', './assets/styles.css'];

  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => './' + m[1]);
  list.push(...scripts);

  const iconDir = path.join(root, 'assets', 'icons');
  fs.readdirSync(iconDir)
    .filter((f) => f.endsWith('.png'))
    .sort()
    .forEach((f) => list.push('./assets/icons/' + f));

  /* the Arabic faces: without them offline falls back to a serif that stacks
     the ḥarakāt on the letters, which is the whole reason they are bundled */
  const fontDir = path.join(root, 'assets', 'fonts');
  if (fs.existsSync(fontDir)) {
    fs.readdirSync(fontDir)
      .filter((f) => f.endsWith('.woff2'))
      .sort()
      .forEach((f) => list.push('./assets/fonts/' + f));
  }

  return list;
}

function stamp() {
  let sha = '';
  try {
    sha = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim();
  } catch (e) {
    sha = 'local';
  }
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return date + '-' + sha;
}

const files = shellFiles();
const missing = files.filter((f) => f !== './' && !fs.existsSync(path.join(root, f.slice(2))));
if (missing.length) {
  console.error('these files are referenced but missing:\n  ' + missing.join('\n  '));
  process.exit(1);
}

const version = stamp();
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`);
sw = sw.replace(
  /const PRECACHE = \[[\s\S]*?\];/,
  'const PRECACHE = [\n' + files.map((f) => `  '${f}'`).join(',\n') + '\n];'
);
fs.writeFileSync(swPath, sw);

console.log(`sw.js stamped: version ${version}, ${files.length} files precached`);

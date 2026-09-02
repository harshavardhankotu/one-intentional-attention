import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const extSource = path.join(rootDir, 'extension');
const extDist = path.join(rootDir, 'dist-extension');

// Clean target directory
if (fs.existsSync(extDist)) {
  fs.rmSync(extDist, { recursive: true, force: true });
}
fs.mkdirSync(extDist, { recursive: true });

// Required extension files for production distribution
const releaseFiles = [
  'manifest.json',
  'background.js',
  'bridge.js',
  'content.js',
  'popup.html',
  'one-icon.svg',
  'one-icon.png'
];

for (const file of releaseFiles) {
  const src = path.join(extSource, file);
  const dest = path.join(extDist, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} -> dist-extension/${file}`);
  } else {
    console.error(`Missing required extension file: ${file}`);
    process.exit(1);
  }
}

console.log('Successfully packaged clean Chrome MV3 extension in dist-extension/');

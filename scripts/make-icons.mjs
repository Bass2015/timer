import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';

const dir = new URL('../public/icons/', import.meta.url);
mkdirSync(dir, { recursive: true });
const svg = readFileSync(new URL('icon.svg', dir));
const out = (name) => new URL(name, dir).pathname;

await Promise.all([
  sharp(svg).resize(192, 192).png().toFile(out('icon-192.png')),
  sharp(svg).resize(512, 512).png().toFile(out('icon-512.png')),
  sharp(svg).resize(180, 180).png().toFile(out('apple-touch-icon.png')),
]);
console.log('icons generated from icons/icon.svg');

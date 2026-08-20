import { gzipSync } from 'node:zlib';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const budgetBytes = 350 * 1024;
const assetsDir = fileURLToPath(new URL('../dist/assets/', import.meta.url));
const oversized = readdirSync(assetsDir)
  .filter((name) => name.endsWith('.js'))
  .map((name) => ({ name, bytes: gzipSync(readFileSync(join(assetsDir, name))).byteLength }))
  .filter(({ bytes }) => bytes > budgetBytes)
  .sort((a, b) => b.bytes - a.bytes);

if (oversized.length) {
  for (const item of oversized) {
    console.error(`${item.name}: ${(item.bytes / 1024).toFixed(1)} KiB gzip exceeds 350 KiB`);
  }
  process.exit(1);
}

console.log('Bundle budget passed: every emitted JavaScript chunk is <= 350 KiB gzip.');

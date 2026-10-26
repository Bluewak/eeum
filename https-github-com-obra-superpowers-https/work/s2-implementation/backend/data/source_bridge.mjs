// Read the existing modules; no copied programme catalogue or case fixture.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { TextDecoder } from 'node:util';

const root = resolve(process.argv[2]);
const sources = {};
async function load(name) {
  const bytes = await readFile(resolve(root, 'dist', name));
  new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  sources[name] = { sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length };
  return import('data:text/javascript;base64,' + bytes.toString('base64'));
}
const data = await load('data.js');
const domain = await load('domain.js');
process.stdout.write(JSON.stringify({
  cases: domain.createDemoCases(), areas: data.AREA_DATA,
  programs: data.PROGRAMS, facilities: data.FACILITIES, meta: data.DATA_META,
  sources, retrieved_at: new Date().toISOString(),
}));

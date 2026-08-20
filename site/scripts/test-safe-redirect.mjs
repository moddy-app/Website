import assert from 'node:assert/strict';
import {build} from 'esbuild';

const result = await build({
  entryPoints: ['src/utils/safe-redirect.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
});
const source = result.outputFiles[0].text;
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const {safeRedirectUrl} = await import(moduleUrl);
const origin = 'https://www.moddy.app';

assert.equal(
  safeRedirectUrl('/support?from=home#contact', origin),
  'https://www.moddy.app/support?from=home#contact',
);
assert.equal(
  safeRedirectUrl('https://dashboard.moddy.app/guilds/123', origin),
  'https://dashboard.moddy.app/guilds/123',
);

for (const unsafe of [
  'javascript:alert(1)',
  'JaVaScRiPt:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  'https://evilmoddy.app/',
  'https://moddy.app.evil.example/',
  'https://moddy.app@evil.example/',
  '//evil.example/',
  '/\\evil.example/',
  'http://moddy.app/',
]) {
  assert.equal(safeRedirectUrl(unsafe, origin), null, unsafe);
}

console.log('safe redirect security tests passed');

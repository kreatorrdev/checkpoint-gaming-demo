import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const html=await readFile(path.join(root,'index.html'),'utf8');
const app=await readFile(path.join(root,'app.js'),'utf8');
const context={window:{}}; vm.createContext(context); vm.runInContext(await readFile(path.join(root,'data.js'),'utf8'),context);

test('every catalog entry has its required local artwork and official attribution', async () => {
  assert.equal(context.window.CHECKPOINT_GAMES.length,8);
  for (const game of context.window.CHECKPOINT_GAMES) {
    await access(path.join(root,'assets',game.id+'-cover.jpg'));
    await access(path.join(root,game.art || 'assets/'+game.id+'-wide.jpg'));
    assert.ok(context.window.CHECKPOINT_STORE_URLS[game.id]?.startsWith('https://store.steampowered.com/app/'));
  }
});
test('the deployable shell loads only local application scripts in the required order', async () => {
  const scripts=[...html.matchAll(/<script defer src="([^"]+)"/g)].map(match=>match[1]);
  assert.deepEqual(scripts,['data.js','demo-state.js','app.js']); for(const script of scripts) await access(path.join(root,script));
});
test('the demo has no account/backend dependency or unimplemented community promises', () => {
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|WebSocket|\/api\/auth/.test(app),false);
  assert.equal(/reviews.{0,30}(planned|arrive)|profiles.{0,30}(planned|arrive)/i.test(app),false);
  assert.ok(html.includes('id="reset-dialog"')); assert.ok(app.includes("path==='/about'"));
});

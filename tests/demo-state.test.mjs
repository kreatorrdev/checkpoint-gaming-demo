import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const context = { window: {} };
vm.createContext(context);
vm.runInContext(await readFile(new URL('../dist/data.js', import.meta.url),'utf8'),context);
await import('../dist/demo-state.js');
const { createStore, storageKey } = globalThis.CHECKPOINT_DEMO;
const games = context.window.CHECKPOINT_GAMES;
const statuses = context.window.CHECKPOINT_STATUSES;
function memory(initial = {}) {
  const records = new Map(Object.entries(initial));
  return { getItem: key => records.get(key) ?? null, setItem: (key,value) => records.set(key,value), removeItem: key => records.delete(key) };
}
const make = storage => createStore(storage,games,statuses);

test('first visit does not invent a personal collection before starting the demo', () => {
  const store = make(memory()); assert.equal(store.started,false); assert.deepEqual(store.entries,{});
});
test('Try demo provides exactly five labeled examples covering every play status', () => {
  const store = make(memory()); store.start(); assert.equal(store.started,true);
  assert.equal(Object.keys(store.entries).length,5); assert.deepEqual(Object.values(store.entries).sort(),[...statuses].sort());
});
test('re-entering the demo preserves visitor edits instead of reloading examples', () => {
  const store = make(memory()); store.start(); store.set('hades','Completed'); store.remove('celeste'); store.start();
  assert.equal(store.entries.hades,'Completed'); assert.equal(store.entries.celeste,undefined);
});
test('a deliberately emptied collection stays empty after re-entry and refresh', () => {
  const storage = memory(); const store = make(storage); store.start(); store.clear();
  const reopened = make(storage); reopened.start(); assert.deepEqual(reopened.entries,{}); assert.equal(reopened.started,true);
});
test('changes survive a fresh store instance on the same browser origin', () => {
  const storage = memory(); const first = make(storage); first.start(); first.set('hades','Completed');
  assert.equal(make(storage).entries.hades,'Completed');
});
test('two independent browser profiles cannot read or reset each other’s library', () => {
  const storageA = memory(), storageB = memory(); const a = make(storageA), b = make(storageB);
  a.start(); b.start(); a.set('hades','Completed'); a.clear();
  assert.equal(b.entries.hades,'Playing'); assert.equal(make(storageB).entries.hades,'Playing');
});
test('reset restores the five examples and removes custom additions', () => {
  const store = make(memory()); store.start(); store.set('forza-horizon-5','Completed'); store.set('hades','Wishlist'); store.reset();
  assert.equal(store.entries['forza-horizon-5'],undefined); assert.equal(store.entries.hades,'Playing'); assert.equal(Object.keys(store.entries).length,5);
});
test('Undo restores an entire collection including the previous status after removal or reset', () => {
  const store = make(memory()); store.start(); store.set('hades','Completed'); const snapshot = store.snapshot();
  store.remove('hades'); store.restore(snapshot); assert.equal(store.entries.hades,'Completed');
  store.clear(); store.restore(snapshot); assert.deepEqual(store.entries,snapshot.entries);
});
test('saving directly from a game creates only the visitor’s chosen entry', () => {
  const store = make(memory()); store.set('stardew-valley','Wishlist');
  assert.deepEqual(store.entries,{'stardew-valley':'Wishlist'}); store.start(); assert.equal(Object.keys(store.entries).length,1);
});
test('a valid legacy collection is preserved without overwriting its stored source', () => {
  const storage = memory({'checkpoint.library.v1':JSON.stringify({'hades':'On Hold'})}); const store = make(storage);
  store.start(); assert.deepEqual(store.entries,{'hades':'On Hold'}); assert.equal(storage.getItem('checkpoint.library.v1'),'{"hades":"On Hold"}');
});
test('unknown games and invalid statuses are removed from malformed saved state', () => {
  const storage = memory({[storageKey]:JSON.stringify({version:2,started:true,entries:{hades:'Playing',celeste:'Owned',unknown:'Completed'}})});
  const store = make(storage); assert.deepEqual(store.entries,{hades:'Playing'}); assert.equal(store.recovered,true);
});
test('invalid JSON and unsupported versions recover without crashing', () => {
  for (const value of ['broken','null','[]',JSON.stringify({version:99,started:true,entries:{hades:'Playing'}})]) {
    const store = make(memory({[storageKey]:value})); assert.deepEqual(store.entries,{}); store.start(); assert.equal(Object.keys(store.entries).length,5);
  }
});
test('blocked or unavailable storage remains usable within the current session', () => {
  for (const storage of [null,{getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}}]) {
    const store = make(storage); store.start(); store.set('hades','Completed');
    assert.equal(store.entries.hades,'Completed'); assert.equal(store.persistent,false); store.reset(); assert.equal(store.entries.hades,'Playing');
  }
});
test('write failures do not discard the current session’s choices', () => {
  const store = make({getItem:()=>null,setItem(){throw new Error('quota');}});
  store.set('hades','Playing'); assert.equal(store.entries.hades,'Playing'); assert.equal(store.persistent,false);
});
test('external snapshots cannot inject unsupported game IDs or status values', () => {
  const store = make(memory()); assert.equal(store.set('__proto__','Playing'),false); assert.equal(store.set('hades','Owned'),false);
  store.restore({started:true,entries:{hades:'Playing',unknown:'Playing'}}); assert.deepEqual(store.entries,{hades:'Playing'});
});
test('returned snapshots cannot mutate the live collection', () => {
  const store = make(memory()); store.start(); const snapshot = store.snapshot(); snapshot.entries.hades='Completed';
  const exposed = store.entries; exposed.hades='Wishlist'; assert.equal(store.entries.hades,'Playing');
});
test('another tab’s change can be reloaded without writing over it', () => {
  const storage = memory(); const a=make(storage); a.start(); const b=make(storage);
  a.set('hades','Completed'); b.reload(); assert.equal(b.entries.hades,'Completed');
});

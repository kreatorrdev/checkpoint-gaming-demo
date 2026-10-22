/* Browser-local demo state. No account, network, or shared database. */
((root) => {
  'use strict';
  const storageKey = 'checkpoint.demo.v2';
  const legacyKey = 'checkpoint.library.v1';
  const samples = Object.freeze({
    'elden-ring': 'Wishlist',
    'baldurs-gate-3': 'Backlog',
    'hades': 'Playing',
    'hollow-knight': 'On Hold',
    'celeste': 'Completed'
  });

  function createStore(storage, games, statuses) {
    const ids = new Set(games.map(game => game.id));
    const clean = value => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
      return Object.fromEntries(Object.entries(value).filter(([id, status]) => ids.has(id) && statuses.includes(status)));
    };
    let entries = {}, started = false, persistent = !!storage, recovered = false;
    try {
      const raw = storage?.getItem(storageKey);
      if (raw !== null && raw !== undefined) {
        const saved = JSON.parse(raw);
        if (!saved || saved.version !== 2 || typeof saved.started !== 'boolean' || !saved.entries || Array.isArray(saved.entries) || typeof saved.entries !== 'object') {
          recovered = true;
        } else {
          entries = clean(saved.entries);
          started = saved.started || Object.keys(entries).length > 0;
          recovered = Object.keys(entries).length !== Object.keys(saved.entries).length;
        }
      } else {
        const legacy = storage?.getItem(legacyKey);
        if (legacy) {
          entries = clean(JSON.parse(legacy));
          started = Object.keys(entries).length > 0;
        }
      }
    } catch { recovered = true; persistent = false; }

    function snapshot() { return { version: 2, started, entries: { ...entries } }; }
    function persist() {
      try {
        if (!storage) throw new Error('Storage unavailable');
        storage.setItem(storageKey, JSON.stringify(snapshot()));
        persistent = true;
      } catch { persistent = false; }
    }
    return {
      get entries() { return { ...entries }; },
      get started() { return started; },
      get persistent() { return persistent; },
      get recovered() { return recovered; },
      snapshot,
      reload() { const next = createStore(storage, games, statuses); entries = next.entries; started = next.started; persistent = next.persistent; recovered = next.recovered; return snapshot(); },
      start() {
        if (!started) { entries = Object.keys(entries).length ? entries : clean(samples); started = true; persist(); }
        return snapshot();
      },
      set(id, status) {
        if (!ids.has(id) || !statuses.includes(status)) return false;
        entries[id] = status; started = true; persist(); return true;
      },
      remove(id) { if (!Object.hasOwn(entries, id)) return false; delete entries[id]; persist(); return true; },
      reset() { entries = clean(samples); started = true; recovered = false; persist(); return snapshot(); },
      clear() { entries = {}; started = true; recovered = false; persist(); return snapshot(); },
      restore(saved) { entries = clean(saved.entries); started = !!saved.started || Object.keys(entries).length > 0; persist(); return snapshot(); }
    };
  }
  root.CHECKPOINT_DEMO = Object.freeze({ createStore, storageKey });
})(globalThis);

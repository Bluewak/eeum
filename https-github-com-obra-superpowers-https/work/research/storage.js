/**
 * Browser-local storage with stale snapshot detection.
 * Each successful write gets a UUID revision. A caller must load again after a
 * conflict; failed reads/writes never advance its revision. This is not an
 * atomic database transaction: localStorage has no cross-tab compare-and-swap.
 */
export function createStore(storage, key) {
  let observedRaw = null;
  let observedRevision = null;

  function parse(raw) {
    if (raw === null) return null;
    try {
      const value = JSON.parse(raw);
      return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
    } catch {
      return null;
    }
  }
  function revisionOf(value) {
    return typeof value?.revision === 'string' && value.revision.length > 0 ? value.revision : null;
  }
  function snapshotMatches(raw) {
    // Use the revision for new records. For legacy v1 records without revision,
    // compare the exact stored snapshot rather than only savedAt, since clocks
    // and timestamp resolution cannot safely identify a distinct write.
    const currentRevision = revisionOf(parse(raw));
    if (observedRevision !== null || currentRevision !== null) {
      return observedRevision !== null && currentRevision === observedRevision;
    }
    return raw === observedRaw;
  }
  function load() {
    try {
      const raw = storage.getItem(key);
      const value = parse(raw);
      observedRaw = raw;
      observedRevision = revisionOf(value);
      return value;
    } catch {
      return null;
    }
  }
  function save(payload) {
    try {
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return { ok: false, reason: 'unavailable' };
      }
      const currentRaw = storage.getItem(key);
      if (!snapshotMatches(currentRaw)) return { ok: false, reason: 'conflict' };
      const revision = globalThis.crypto.randomUUID();
      const value = { ...payload, revision };
      const raw = JSON.stringify(value);
      storage.setItem(key, raw);
      observedRaw = raw;
      observedRevision = revision;
      return { ok: true, reason: null };
    } catch {
      return { ok: false, reason: 'unavailable' };
    }
  }
  return {
    load,
    save,
    get revision() { return observedRevision; },
  };
}

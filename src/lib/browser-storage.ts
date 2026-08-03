type StorageKind = "local" | "session";

const memoryStores = new Map<StorageKind, Map<string, string>>();

function getMemoryStore(kind: StorageKind) {
  let store = memoryStores.get(kind);
  if (!store) {
    store = new Map<string, string>();
    memoryStores.set(kind, store);
  }
  return store;
}

function createMemoryStorage(kind: StorageKind): Storage {
  const store = getMemoryStore(kind);
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => store.delete(key),
    setItem: (key, value) => store.set(key, value),
  };
}

export function getBrowserStorage(kind: StorageKind): Storage {
  const fallback = createMemoryStorage(kind);
  if (typeof window === "undefined") return fallback;

  try {
    const storage = kind === "local" ? window.localStorage : window.sessionStorage;
    const probe = `__offstories_${kind}_probe__`;
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return fallback;
  }
}

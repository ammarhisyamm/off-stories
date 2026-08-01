import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { showToast } from "@/components/toast";
import {
  emptyWorkspaceData,
  loadWorkspaceData,
  saveWorkspaceData,
  type DataKind,
  type WorkspaceData,
} from "@/lib/data.functions";

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: WorkspaceData = emptyWorkspaceData();
let loaded = false;
let loadError: string | null = null;
let boundLoad: (() => Promise<unknown>) | null = null;
let boundSave: ((input: unknown) => Promise<unknown>) | null = null;

const POLL_INTERVAL_MS = 20_000;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let pollInFlight = false;
let pendingSaves = 0;

function notify() {
  listeners.forEach((l) => l());
}

function publish(kind: DataKind, payload: unknown) {
  cache = { ...cache, [kind]: payload as never };
  notify();
}

async function pollRefresh() {
  if (pollInFlight || pendingSaves > 0 || !boundLoad) return;
  if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
  pollInFlight = true;
  try {
    const res = await boundLoad();
    cache = (res as { data: WorkspaceData }).data;
    loaded = true;
    loadError = null;
    notify();
  } catch {
    // keep last known good state on transient failures
  } finally {
    pollInFlight = false;
  }
}

function startPolling() {
  if (pollTimer !== null) return;
  pollTimer = setInterval(() => {
    void pollRefresh();
  }, POLL_INTERVAL_MS);
}

function stopPolling() {
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export function resetWorkspaceDataCache() {
  cache = emptyWorkspaceData();
  loaded = false;
  loadError = null;
  stopPolling();
  notify();
}

export function useWorkspaceData() {
  const loadFn = useServerFn(loadWorkspaceData);
  const saveFn = useServerFn(saveWorkspaceData);
  const [state, setState] = useState<{ loading: boolean; error: string | null }>(() => ({
    loading: !loaded,
    error: loadError,
  }));

  useEffect(() => {
    boundLoad = loadFn as () => Promise<unknown>;
    boundSave = saveFn as (input: unknown) => Promise<unknown>;

    const listener = () =>
      setState((s) =>
        s.loading === false && s.error === loadError ? s : { loading: false, error: loadError },
      );
    listeners.add(listener);

    if (!loaded) {
      let cancelled = false;
      loadFn()
        .then((res) => {
          if (cancelled) return;
          cache = (res as { data: WorkspaceData }).data;
          loaded = true;
          loadError = null;
          startPolling();
          notify();
        })
        .catch((e) => {
          if (cancelled) return;
          loadError = e instanceof Error ? e.message : String(e);
          notify();
        });
      return () => {
        cancelled = true;
        listeners.delete(listener);
      };
    }

    startPolling();
    return () => {
      listeners.delete(listener);
    };
  }, [loadFn, saveFn]);

  const setKind = useCallback(
    (kind: DataKind, payload: unknown, opts?: { success?: string | null }) => {
      publish(kind, payload);
      if (!boundSave) return;
      pendingSaves += 1;
      boundSave({ data: { kind, payload } })
        .then(() => {
          if (opts?.success !== null) {
            showToast(opts?.success ?? "Saved");
          }
        })
        .catch((e) => {
          loadError = e instanceof Error ? e.message : String(e);
          notify();
          showToast(loadError ?? "Couldn't save", "error");
        })
        .finally(() => {
          pendingSaves = Math.max(0, pendingSaves - 1);
        });
    },
    [],
  );

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    if (!boundLoad) return;
    try {
      const res = await boundLoad();
      cache = (res as { data: WorkspaceData }).data;
      loaded = true;
      loadError = null;
    } catch (e) {
      loadError = e instanceof Error ? e.message : String(e);
    }
    notify();
  }, []);

  return {
    data: cache,
    loading: state.loading,
    error: state.error,
    setKind,
    refresh,
  };
}

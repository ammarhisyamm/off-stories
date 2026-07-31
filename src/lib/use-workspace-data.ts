import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
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

function notify() {
  listeners.forEach((l) => l());
}

function publish(kind: DataKind, payload: unknown) {
  cache = { ...cache, [kind]: payload as never };
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

    return () => {
      listeners.delete(listener);
    };
  }, [loadFn, saveFn]);

  const setKind = useCallback((kind: DataKind, payload: unknown) => {
    publish(kind, payload);
    boundSave?.({ kind, payload }).catch((e) => {
      loadError = e instanceof Error ? e.message : String(e);
      notify();
    });
  }, []);

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

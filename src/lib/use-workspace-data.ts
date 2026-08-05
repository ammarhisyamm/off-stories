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
import { reportClientError } from "@/lib/telemetry";

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: WorkspaceData = emptyWorkspaceData();
let workspaceId: string | null = null;
let loaded = false;
let loadError: string | null = null;
let boundLoad: (() => Promise<unknown>) | null = null;
let boundSave: ((input: unknown) => Promise<unknown>) | null = null;
let boundReport: ((input: unknown) => Promise<unknown>) | null = null;

const POLL_INTERVAL_MS = 20_000;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let pollInFlight = false;
let pendingSaves = 0;

function notify() {
  listeners.forEach((l) => l());
}

function report(source: string, error: unknown, meta: Record<string, unknown> = {}) {
  if (!boundReport) return;
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  void boundReport({
    data: {
      source,
      route: typeof window !== "undefined" ? window.location.pathname : undefined,
      message,
      stack,
      meta,
    },
  }).catch(() => {});
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
    const result = res as { workspaceId?: string | null; data: WorkspaceData };
    workspaceId = result.workspaceId ?? workspaceId;
    cache = result.data;
    loaded = true;
    loadError = null;
    notify();
  } catch {
    // keep last known good state on transient failures
    report("poll_refresh", new Error("Poll refresh failed"));
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
  workspaceId = null;
  loaded = false;
  loadError = null;
  stopPolling();
  notify();
}

export function useWorkspaceData() {
  const loadFn = useServerFn(loadWorkspaceData);
  const saveFn = useServerFn(saveWorkspaceData);
  const reportFn = useServerFn(reportClientError);
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    revision: number;
  }>(() => ({
    loading: !loaded,
    error: loadError,
    revision: 0,
  }));

  useEffect(() => {
    boundLoad = loadFn as () => Promise<unknown>;
    boundSave = saveFn as (input: unknown) => Promise<unknown>;
    boundReport = reportFn as (input: unknown) => Promise<unknown>;

    const listener = () =>
      setState((s) => ({
        loading: false,
        error: loadError,
        revision: s.revision + 1,
      }));
    listeners.add(listener);

    if (!loaded) {
      let cancelled = false;
      loadFn()
        .then((res) => {
          if (cancelled) return;
          const result = res as { workspaceId?: string | null; data: WorkspaceData };
          workspaceId = result.workspaceId ?? workspaceId;
          cache = result.data;
          loaded = true;
          loadError = null;
          startPolling();
          notify();
        })
        .catch((e) => {
          if (cancelled) return;
          loadError = e instanceof Error ? e.message : String(e);
          report("initial_load", e, { phase: "mount" });
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
          report("save", e, { kind });
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
      const result = res as { workspaceId?: string | null; data: WorkspaceData };
      workspaceId = result.workspaceId ?? workspaceId;
      cache = result.data;
      loaded = true;
      loadError = null;
    } catch (e) {
      loadError = e instanceof Error ? e.message : String(e);
      report("refresh", e);
    }
    notify();
  }, []);

  return {
    data: cache,
    workspaceId,
    loading: state.loading,
    error: state.error,
    setKind,
    refresh,
  };
}

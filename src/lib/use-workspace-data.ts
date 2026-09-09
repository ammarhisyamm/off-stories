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
import { trackSeoEvent } from "@/lib/seo-growth";
import { clearSessionCache } from "@/lib/session-cache";

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: WorkspaceData = emptyWorkspaceData();
let workspaceId: string | null = null;
let myRole: string | null = null;
let loaded = false;
let loadError: string | null = null;
let boundLoad: (() => Promise<unknown>) | null = null;
let boundSave: ((input: unknown) => Promise<unknown>) | null = null;
let boundReport: ((input: unknown) => Promise<unknown>) | null = null;

const POLL_INTERVAL_MS = 20_000;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let pollInFlight = false;
let pendingSaves = 0;
let syncError: string | null = null;
const saveQueues = new Map<DataKind, SaveJob[]>();
const savingKinds = new Set<DataKind>();

type SaveJob = {
  payload: unknown;
  previous: unknown;
  success?: string | null;
  attempts: number;
};

function normalizeWorkspaceData(value: unknown): WorkspaceData {
  const fallback = emptyWorkspaceData();
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;

  const source = value as Record<string, unknown>;
  const arrays = [
    "tasks",
    "budget",
    "vendors",
    "guests",
    "milestones",
    "notes",
    "documents",
    "rundown",
    "seserahan",
  ] as const;
  const normalized = { ...fallback, event: fallback.event } as WorkspaceData;

  if (source.event && typeof source.event === "object" && !Array.isArray(source.event)) {
    const rawEvent = source.event as Record<string, unknown>;
    normalized.event = {
      ...fallback.event,
      ...(source.event as Partial<WorkspaceData["event"]>),
      name: typeof rawEvent.name === "string" ? rawEvent.name : fallback.event.name,
      type: typeof rawEvent.type === "string" ? rawEvent.type : fallback.event.type,
      date: typeof rawEvent.date === "string" ? rawEvent.date : fallback.event.date,
      location: typeof rawEvent.location === "string" ? rawEvent.location : fallback.event.location,
      guestEstimate:
        typeof rawEvent.guestEstimate === "number"
          ? rawEvent.guestEstimate
          : fallback.event.guestEstimate,
      budget: typeof rawEvent.budget === "number" ? rawEvent.budget : fallback.event.budget,
    };
  }
  for (const kind of arrays) {
    if (Array.isArray(source[kind])) normalized[kind] = source[kind] as never;
  }
  if (
    source.command &&
    typeof source.command === "object" &&
    !Array.isArray(source.command) &&
    Array.isArray((source.command as { contacts?: unknown }).contacts)
  ) {
    normalized.command = {
      contacts: (source.command as { contacts: WorkspaceData["command"]["contacts"] }).contacts,
    };
  }
  return normalized;
}

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

function isSessionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /unauthorized|not authenticated|session (expired|not found)|login required/i.test(message);
}

function redirectToSignIn() {
  if (typeof window === "undefined" || window.location.pathname === "/auth") return;
  clearSessionCache();
  window.location.assign(`/auth?reason=session-expired`);
}

async function flushSaveQueue(kind: DataKind) {
  if (savingKinds.has(kind) || !boundSave) return;
  const queue = saveQueues.get(kind);
  const job = queue?.[0];
  if (!job) return;

  savingKinds.add(kind);
  try {
    await boundSave({ data: { kind, payload: job.payload } });
    queue?.shift();
    pendingSaves = Math.max(0, pendingSaves - 1);
    syncError = null;
    if (job.success !== null) showToast(job.success ?? "Saved");
  } catch (error) {
    if (isSessionError(error)) redirectToSignIn();
    job.attempts += 1;
    syncError = error instanceof Error ? error.message : String(error);
    report("save", error, { kind, attempt: job.attempts });
    if (job.attempts >= 3) {
      showToast("Couldn't sync yet. We'll keep retrying automatically.", "error");
    }
  } finally {
    savingKinds.delete(kind);
    notify();
  }

  if (saveQueues.get(kind)?.length) {
    const attempts = saveQueues.get(kind)?.[0]?.attempts ?? 0;
    const delay = Math.min(30_000, 1_000 * 2 ** Math.min(attempts, 5));
    window.setTimeout(() => void flushSaveQueue(kind), delay);
  } else {
    saveQueues.delete(kind);
  }
}

function enqueueSave(
  kind: DataKind,
  payload: unknown,
  previous: unknown,
  opts?: { success?: string | null },
) {
  const queue = saveQueues.get(kind) ?? [];
  const last = queue[queue.length - 1];
  if (last && !savingKinds.has(kind)) {
    last.payload = payload;
    last.previous = previous;
    last.success = opts?.success;
    last.attempts = 0;
  } else {
    queue.push({ payload, previous, success: opts?.success, attempts: 0 });
    pendingSaves += 1;
  }
  saveQueues.set(kind, queue);
  notify();
  void flushSaveQueue(kind);
}

async function pollRefresh() {
  if (pollInFlight || pendingSaves > 0 || !boundLoad) return;
  if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
  pollInFlight = true;
  try {
    const res = await boundLoad();
    const result = res as {
      workspaceId?: string | null;
      role?: string | null;
      data: WorkspaceData;
    };
    workspaceId = result.workspaceId ?? workspaceId;
    if (result.role != null) myRole = result.role;
    cache = normalizeWorkspaceData(result.data);
    loaded = true;
    loadError = null;
    notify();
  } catch (error) {
    // keep last known good state on transient failures
    if (isSessionError(error)) redirectToSignIn();
    report("poll_refresh", error);
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
  myRole = null;
  loaded = false;
  loadError = null;
  syncError = null;
  saveQueues.clear();
  savingKinds.clear();
  pendingSaves = 0;
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

    const retryPending = () => {
      for (const kind of saveQueues.keys()) void flushSaveQueue(kind);
    };
    window.addEventListener("online", retryPending);

    if (!loaded) {
      let cancelled = false;
      loadFn()
        .then((res) => {
          if (cancelled) return;
          const result = res as {
            workspaceId?: string | null;
            role?: string | null;
            data: WorkspaceData;
          };
          workspaceId = result.workspaceId ?? workspaceId;
          if (result.role != null) myRole = result.role;
          cache = normalizeWorkspaceData(result.data);
          loaded = true;
          loadError = null;
          startPolling();
          notify();
        })
        .catch((e) => {
          if (cancelled) return;
          loadError = e instanceof Error ? e.message : String(e);
          if (isSessionError(e)) redirectToSignIn();
          report("initial_load", e, { phase: "mount" });
          notify();
        });
      return () => {
        cancelled = true;
        listeners.delete(listener);
        window.removeEventListener("online", retryPending);
      };
    }

    startPolling();
    return () => {
      listeners.delete(listener);
      window.removeEventListener("online", retryPending);
    };
  }, [loadFn, saveFn, reportFn]);

  const setKind = useCallback(
    (kind: DataKind, payload: unknown, opts?: { success?: string | null }) => {
      const previous = cache[kind];
      publish(kind, payload);
      if (
        kind === "tasks" &&
        Array.isArray(previous) &&
        previous.length === 0 &&
        Array.isArray(payload) &&
        payload.length > 0
      ) {
        trackSeoEvent("first_checklist_action");
      }
      if (
        kind === "budget" &&
        Array.isArray(previous) &&
        previous.length === 0 &&
        Array.isArray(payload) &&
        payload.length > 0
      ) {
        trackSeoEvent("budget_created");
      }
      if (
        kind === "guests" &&
        Array.isArray(previous) &&
        previous.length === 0 &&
        Array.isArray(payload) &&
        payload.length > 0
      ) {
        trackSeoEvent("guest_added");
      }
      if (
        kind === "vendors" &&
        Array.isArray(previous) &&
        previous.length === 0 &&
        Array.isArray(payload) &&
        payload.length > 0
      ) {
        trackSeoEvent("vendor_added");
      }
      enqueueSave(kind, payload, previous, opts);
    },
    [],
  );

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    if (!boundLoad) return;
    try {
      const res = await boundLoad();
      const result = res as {
        workspaceId?: string | null;
        role?: string | null;
        data: WorkspaceData;
      };
      workspaceId = result.workspaceId ?? workspaceId;
      if (result.role != null) myRole = result.role;
      cache = normalizeWorkspaceData(result.data);
      loaded = true;
      loadError = null;
    } catch (e) {
      loadError = e instanceof Error ? e.message : String(e);
      if (isSessionError(e)) redirectToSignIn();
      report("refresh", e);
    }
    notify();
  }, []);

  return {
    data: cache,
    workspaceId,
    role: myRole,
    canEdit: myRole !== "viewer",
    loading: state.loading,
    error: state.error,
    syncing: pendingSaves > 0,
    syncError,
    retryPending: () => {
      for (const kind of saveQueues.keys()) void flushSaveQueue(kind);
    },
    setKind,
    refresh,
  };
}

type TrustedTypesPolicy = {
  createHTML: (value: string) => unknown;
};

type TrustedTypesApi = {
  createPolicy: (
    name: string,
    rules: { createHTML: (value: string) => string },
  ) => TrustedTypesPolicy;
  getPolicy?: (name: string) => TrustedTypesPolicy | null;
};

let policy: TrustedTypesPolicy | null | undefined;

function escapeJsonForScript(value: unknown) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

function getTrustedTypesPolicy() {
  if (policy !== undefined) return policy;
  if (typeof window === "undefined") return (policy = null);
  const trustedTypes = (window as Window & { trustedTypes?: TrustedTypesApi }).trustedTypes;
  if (!trustedTypes) return (policy = null);
  try {
    policy =
      trustedTypes.getPolicy?.("offstories") ??
      trustedTypes.createPolicy("offstories", { createHTML: (value) => value });
  } catch {
    policy = null;
  }
  return policy;
}

/** Produces script-safe JSON-LD and a TrustedHTML value where the browser supports it. */
export function serializeJsonLd(value: unknown): string {
  const json = escapeJsonForScript(value);
  const trustedPolicy = getTrustedTypesPolicy();
  return trustedPolicy ? (trustedPolicy.createHTML(json) as string) : json;
}

import { createServerFn } from "@tanstack/react-start";
import { requireCloudflareAuth } from "@/integrations/cloudflare/auth-middleware";
import { getDocumentsBucket } from "@/lib/cloudflare.server";
import { resolveAccessibleWorkspace, resolveMemberRole } from "@/lib/data.functions";
import { assertSameOrigin, checkRateLimit } from "@/lib/security.server";

const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const EXT_TO_MIME: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function getExtension(name: string): string {
  return name.toLowerCase().split(".").pop() ?? "";
}

function isAllowedFile(file: File): boolean {
  const ext = getExtension(file.name);
  const mimeOk = ALLOWED_MIME_TYPES.has(file.type);
  const extOk = ext === "pdf" || ext === "docx";
  // Require BOTH mime and extension to match (prevents MIME-spoof via rename)
  return mimeOk && extOk;
}

function resolveSafeContentType(file: File): string {
  const ext = getExtension(file.name);
  return EXT_TO_MIME[ext] ?? "application/octet-stream";
}

export const uploadDocument = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .validator((data) => data as FormData)
  .handler(async ({ context, data }) => {
    if (!(data instanceof FormData)) throw new Error("Document upload requires a file.");
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("Choose a PDF or DOCX file.");
    if (!isAllowedFile(file)) throw new Error("Only PDF and DOCX files are supported.");
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) throw new Error("Documents must be 5 MB or smaller.");

    assertSameOrigin();
    checkRateLimit({ key: "upload-document", limit: 20, windowMs: 60_000 });
    const workspaceId = await resolveAccessibleWorkspace(context.userId);
    if (!workspaceId) throw new Error("No workspace found");
    if ((await resolveMemberRole(workspaceId, context.userId)) === "viewer") {
      throw new Error("You have read-only access to this workspace.");
    }

    let safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 100);
    if (!safeName.includes(".")) safeName += `.${getExtension(file.name)}`;
    const key = `${workspaceId}/${crypto.randomUUID()}-${safeName}`;
    const safeContentType = resolveSafeContentType(file);
    await getDocumentsBucket().put(key, file.stream(), {
      httpMetadata: {
        contentType: safeContentType,
        contentDisposition: `inline; filename="${safeName}"`,
      },
      customMetadata: { ownerId: context.userId, originalName: file.name.slice(0, 200) },
    });

    return { filePath: key, mimeType: file.type, size: file.size };
  });

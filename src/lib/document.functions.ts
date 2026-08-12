import { createServerFn } from "@tanstack/react-start";
import { requireCloudflareAuth } from "@/integrations/cloudflare/auth-middleware";
import { getDocumentsBucket } from "@/lib/cloudflare.server";
import { resolveMemberRole, resolveWorkspace } from "@/lib/data.functions";

const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function isAllowedFile(file: File) {
  const extension = file.name.toLowerCase().split(".").pop();
  return ALLOWED_MIME_TYPES.has(file.type) || extension === "pdf" || extension === "docx";
}

export const uploadDocument = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .handler(async ({ context, data }) => {
    if (!(data instanceof FormData)) throw new Error("Document upload requires a file.");
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("Choose a PDF or DOCX file.");
    if (!isAllowedFile(file)) throw new Error("Only PDF and DOCX files are supported.");
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) throw new Error("Documents must be 5 MB or smaller.");

    const workspaceId = await resolveWorkspace(context.userId);
    if (!workspaceId) throw new Error("No workspace found");
    if ((await resolveMemberRole(workspaceId, context.userId)) === "viewer") {
      throw new Error("You have read-only access to this workspace.");
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const key = `${workspaceId}/${crypto.randomUUID()}-${safeName}`;
    await getDocumentsBucket().put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || "application/octet-stream",
        contentDisposition: `inline; filename="${safeName}"`,
      },
      customMetadata: { ownerId: context.userId, originalName: file.name },
    });

    return { filePath: key, mimeType: file.type, size: file.size };
  });

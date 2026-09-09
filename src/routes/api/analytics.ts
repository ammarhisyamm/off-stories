import { createFileRoute } from "@tanstack/react-router";
import { recordGrowthEvent } from "@/lib/growth.server";

export const Route = createFileRoute("/api/analytics")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          return await recordGrowthEvent(request);
        } catch (error) {
          const status =
            typeof error === "object" &&
            error &&
            "status" in error &&
            typeof error.status === "number"
              ? error.status
              : 400;
          return Response.json({ error: "Unable to record analytics event." }, { status });
        }
      },
    },
  },
});

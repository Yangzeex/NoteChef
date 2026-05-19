import { task } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { mediaItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const mediaProcessingTask = task({
  id: "media-processing",
  run: async (payload: { mediaItemId: string; muxAssetId: string }) => {
    // Called when Mux finishes processing — update record to ready
    await db
      .update(mediaItems)
      .set({ status: "ready" })
      .where(eq(mediaItems.id, payload.mediaItemId));
  },
});

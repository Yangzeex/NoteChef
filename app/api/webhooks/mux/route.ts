import { headers } from "next/headers";
import Mux from "@mux/mux-node";
import { db } from "@/lib/db";
import { mediaItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(req: Request) {
  const headerPayload = headers();
  const muxSignature = headerPayload.get("mux-signature");
  if (!muxSignature) return new Response("Missing signature", { status: 400 });

  const body = await req.text();

  try {
    Mux.Webhooks.verifySignature(body, Object.fromEntries(headerPayload), process.env.MUX_WEBHOOK_SECRET!);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.type === "video.asset.ready") {
    const assetId: string = event.data.id;
    const playbackId: string = event.data.playback_ids?.[0]?.id;
    const duration: number = Math.round(event.data.duration ?? 0);
    const thumbnailUrl = playbackId
      ? `https://image.mux.com/${playbackId}/thumbnail.jpg`
      : null;

    await db.update(mediaItems)
      .set({
        status: "ready",
        muxPlaybackId: playbackId,
        duration,
        thumbnailUrl,
        url: `https://stream.mux.com/${playbackId}.m3u8`,
      })
      .where(eq(mediaItems.muxAssetId, assetId));
  }

  if (event.type === "video.asset.errored") {
    const assetId: string = event.data.id;
    await db.update(mediaItems)
      .set({ status: "failed" })
      .where(eq(mediaItems.muxAssetId, assetId));
  }

  return new Response("OK", { status: 200 });
}

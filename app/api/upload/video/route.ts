import { auth } from "@clerk/nextjs/server";
import { mux } from "@/lib/mux";
import { db } from "@/lib/db";
import { mediaItems } from "@/lib/db/schema";
import { z } from "zod";
import { redis } from "@/lib/redis";

const bodySchema = z.object({ recipeId: z.string().uuid() });

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 10 uploads per user per hour
  const rateKey = `upload:video:${userId}`;
  const count = await redis.incr(rateKey);
  if (count === 1) await redis.expire(rateKey, 3600);
  if (count > 10) return Response.json({ error: "Rate limit exceeded" }, { status: 429 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const { recipeId } = parsed.data;

  const upload = await mux.video.uploads.create({
    new_asset_settings: { playback_policy: ["public"], mp4_support: "none" },
    cors_origin: "*",
  });

  const [mediaItem] = await db.insert(mediaItems).values({
    recipeId,
    type: "video",
    status: "pending",
    muxAssetId: upload.asset_id ?? null,
    order: 0,
  }).returning();

  return Response.json({ uploadUrl: upload.url, mediaItemId: mediaItem.id });
}

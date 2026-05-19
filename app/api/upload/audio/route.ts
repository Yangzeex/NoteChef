import { auth } from "@clerk/nextjs/server";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";
import { db } from "@/lib/db";
import { mediaItems } from "@/lib/db/schema";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { redis } from "@/lib/redis";

const bodySchema = z.object({
  recipeId: z.string().uuid(),
  fileName: z.string().min(1).max(200),
  contentType: z.enum(["audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg"]),
  order: z.number().int().min(0),
});

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rateKey = `upload:audio:${userId}`;
  const count = await redis.incr(rateKey);
  if (count === 1) await redis.expire(rateKey, 3600);
  if (count > 20) return Response.json({ error: "Rate limit exceeded" }, { status: 429 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const { recipeId, fileName, contentType, order } = parsed.data;
  const key = `audio/${recipeId}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

  const [mediaItem] = await db.insert(mediaItems).values({
    recipeId,
    type: "audio",
    url: `${R2_PUBLIC_URL}/${key}`,
    status: "ready",
    order,
  }).returning();

  return Response.json({ uploadUrl, mediaItemId: mediaItem.id, publicUrl: `${R2_PUBLIC_URL}/${key}` });
}

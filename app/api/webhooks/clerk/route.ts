import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });

  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (evt.type === "user.created") {
    const { id, username, image_url, first_name, last_name } = evt.data;
    const displayName = [first_name, last_name].filter(Boolean).join(" ") || null;
    const generatedUsername = username ?? `user_${id.slice(-8)}`;

    await db.insert(users).values({
      id,
      username: generatedUsername,
      displayName,
      avatarUrl: image_url,
    }).onConflictDoNothing();
  }

  if (evt.type === "user.updated") {
    const { id, username, image_url, first_name, last_name } = evt.data;
    const displayName = [first_name, last_name].filter(Boolean).join(" ") || null;

    await db.update(users)
      .set({ displayName, avatarUrl: image_url, ...(username ? { username } : {}) })
      .where(eq(users.id, id));
  }

  return new Response("OK", { status: 200 });
}

import { eq } from "drizzle-orm";

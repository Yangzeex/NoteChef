"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed");

export async function claimUsername(formData: FormData) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const raw = formData.get("username");
  const parsed = usernameSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const username = parsed.data.toLowerCase();

  // Check uniqueness
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing.length > 0 && existing[0].id !== userId) {
    return { error: "That username is already taken" };
  }

  // Upsert — handles race where webhook hasn't fired yet
  await db
    .insert(users)
    .values({ id: userId, username })
    .onConflictDoUpdate({
      target: users.id,
      set: { username },
    });

  // Mark onboarding complete in Clerk session claims
  await clerkClient().users.updateUserMetadata(userId, {
    publicMetadata: { onboarded: true },
  });

  redirect("/");
}

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { db } from "@/lib/db";
import { recipes, recipeStats, mediaItems, users, follows } from "@/lib/db/schema";
import { eq, desc, lt, and, or, inArray, sql } from "drizzle-orm";

const FEED_PAGE_SIZE = 12;

export const recipeRouter = createTRPCRouter({
  // Cursor-based paginated feed
  feed: publicProcedure
    .input(z.object({ cursor: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Build base condition: published & public
      const baseWhere = and(
        eq(recipes.status, "published"),
        eq(recipes.visibility, "public"),
        input.cursor ? lt(recipes.createdAt, new Date(input.cursor)) : undefined
      );

      // If logged in, also include recipes from followed users
      let feedWhere = baseWhere;
      if (userId) {
        const followedUsers = await db
          .select({ followingId: follows.followingId })
          .from(follows)
          .where(eq(follows.followerId, userId));

        if (followedUsers.length > 0) {
          const followedIds = followedUsers.map((f) => f.followingId);
          feedWhere = and(
            eq(recipes.status, "published"),
            or(
              eq(recipes.visibility, "public"),
              and(eq(recipes.visibility, "followers"), inArray(recipes.userId, followedIds))
            ),
            input.cursor ? lt(recipes.createdAt, new Date(input.cursor)) : undefined
          );
        }
      }

      const rows = await db
        .select({
          id: recipes.id,
          title: recipes.title,
          difficulty: recipes.difficulty,
          cookTime: recipes.cookTime,
          tags: recipes.tags,
          createdAt: recipes.createdAt,
          author: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
          likeCount: recipeStats.likeCount,
          saveCount: recipeStats.saveCount,
          commentCount: recipeStats.commentCount,
          thumbnail: sql<string | null>`(
            SELECT url FROM media_items
            WHERE recipe_id = ${recipes.id}
              AND type IN ('photo','video')
              AND status = 'ready'
            ORDER BY "order" ASC
            LIMIT 1
          )`.as("thumbnail"),
          thumbnailType: sql<string | null>`(
            SELECT type FROM media_items
            WHERE recipe_id = ${recipes.id}
              AND type IN ('photo','video')
              AND status = 'ready'
            ORDER BY "order" ASC
            LIMIT 1
          )`.as("thumbnailType"),
          muxPlaybackId: sql<string | null>`(
            SELECT mux_playback_id FROM media_items
            WHERE recipe_id = ${recipes.id}
              AND type = 'video'
              AND status = 'ready'
            ORDER BY "order" ASC
            LIMIT 1
          )`.as("muxPlaybackId"),
        })
        .from(recipes)
        .innerJoin(users, eq(recipes.userId, users.id))
        .leftJoin(recipeStats, eq(recipes.id, recipeStats.recipeId))
        .where(feedWhere)
        .orderBy(desc(recipes.createdAt))
        .limit(FEED_PAGE_SIZE + 1);

      const hasMore = rows.length > FEED_PAGE_SIZE;
      const items = hasMore ? rows.slice(0, FEED_PAGE_SIZE) : rows;
      const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

      return { items, nextCursor };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [recipe] = await db
        .select()
        .from(recipes)
        .where(eq(recipes.id, input.id))
        .limit(1);
      return recipe ?? null;
    }),

  create: protectedProcedure
    .input(z.object({ title: z.string().min(1) }))
    .mutation(() => null),
});

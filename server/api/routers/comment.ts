import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const commentRouter = createTRPCRouter({
  // TODO: implement in Feature 4
  list: publicProcedure.input(z.object({ recipeId: z.string().uuid() })).query(() => []),
  create: protectedProcedure
    .input(z.object({ recipeId: z.string().uuid(), body: z.string().min(1), parentId: z.string().uuid().optional() }))
    .mutation(() => null),
});

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const recipeRouter = createTRPCRouter({
  // TODO: implement in Feature 3
  list: publicProcedure.query(() => []),
  byId: publicProcedure.input(z.object({ id: z.string().uuid() })).query(() => null),
  create: protectedProcedure.input(z.object({ title: z.string().min(1) })).mutation(() => null),
});

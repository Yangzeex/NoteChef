import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const cookbookRouter = createTRPCRouter({
  // TODO: implement in Feature 6
  list: publicProcedure.input(z.object({ userId: z.string() })).query(() => []),
  create: protectedProcedure.input(z.object({ title: z.string().min(1) })).mutation(() => null),
});

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  // TODO: implement in Feature 7
  byUsername: publicProcedure.input(z.object({ username: z.string() })).query(() => null),
  update: protectedProcedure.input(z.object({ displayName: z.string().optional() })).mutation(() => null),
});

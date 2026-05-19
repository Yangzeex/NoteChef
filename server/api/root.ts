import { createTRPCRouter } from "@/server/api/trpc";
import { recipeRouter } from "./routers/recipe";
import { cookbookRouter } from "./routers/cookbook";
import { userRouter } from "./routers/user";
import { commentRouter } from "./routers/comment";

export const appRouter = createTRPCRouter({
  recipe: recipeRouter,
  cookbook: cookbookRouter,
  user: userRouter,
  comment: commentRouter,
});

export type AppRouter = typeof appRouter;

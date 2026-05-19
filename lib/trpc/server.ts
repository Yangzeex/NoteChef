import { createCallerFactory, createTRPCContext } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import { headers } from "next/headers";
import { cache } from "react";

const createContext = cache(() =>
  createTRPCContext({ headers: headers() })
);

const createCaller = createCallerFactory(appRouter);

export const api = createCaller(createContext);

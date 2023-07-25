import { spitRouter } from "~/server/api/routers/spit";
import { createTRPCRouter } from "~/server/api/trpc";
import { profileRouter } from "./routers/profile";
import { bigramRouter } from "./routers/bigram";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  spit: spitRouter,
  profile: profileRouter,
  bigram: bigramRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

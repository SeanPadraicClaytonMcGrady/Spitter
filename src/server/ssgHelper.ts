import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "./api/root";
import SuperJSON from "superjson";
import { createInnerTRPCContext } from "./api/trpc";

export function ssgHelper() {
  return createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null, revalidateSSG: null }),
    transformer: SuperJSON,
  });
}

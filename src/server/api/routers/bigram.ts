import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

type featureCounts = {
  [key: string]: number;
};

//This is the code I'm working on now.

// export const bigramRouter = createTRPCRouter({
//   updateBigrams: protectedProcedure
//     .input(z.object({ featureCounts: z.record(z.number()) }))
//     .mutation(async ({ input: { featureCounts }, ctx }) => {
//       const currentUserId = await ctx.session?.user.id;
//       const bigrams = Object.keys(featureCounts);
//       const existingBigrams = await ctx.prisma.bigram.findMany({
//         where: {
//           bigram: {
//             in: bigrams,
//           }
//         }
//       })
        
//         return await void;
//     }),

});

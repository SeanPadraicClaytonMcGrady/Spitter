import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

type featureCounts = {
  [key: string]: number;
};

//This is the code I'm working on now.

export const bigramRouter = createTRPCRouter({
  addBigrams: protectedProcedure
    .input(z.object({ featureCounts: z.record(z.number()) }))
    .mutation(async ({ input: { featureCounts }, ctx }) => {
      const currentUserId = ctx.session?.user.id;
      const bigrams = Object.keys(featureCounts);
      const existingBigrams = await ctx.prisma.bigram.findMany({
        where: {
          bigram: {
            in: bigrams,
          },
        },
      });

      for (const bigram of existingBigrams) {
        const positiveCount = featureCounts[bigram.positiveCount] ?? 0;
        const negativeCount = featureCounts[bigram.negativeCount] ?? 0;
        if (featureCounts[bigram.bigram]) {
          await ctx.prisma.bigram.update({
            where: { id: bigram.id },
            data: {
              positiveCount: featureCounts[bigram.positiveCount],
              negativeCount: featureCounts[bigram.negativeCount],
            },
          });
        } else if (!featureCounts[bigram.bigram]) {
          await ctx.prisma.bigram.create({
            data: {
              bigram: bigram.bigram,
              positiveCount: positiveCount,
              negativeCount: negativeCount,
              user: { connect: { id: currentUserId } },
            },
          });
        }
      }

      return { message: "Bigrams updated." };
    }),
});

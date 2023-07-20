import { Dislike, Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  createTRPCContext,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { Spit } from "~/utils/types";
import { Like } from "@prisma/client";
import natural, { Tokenizer } from "natural";
import { WordTokenizer } from "natural";
import { Stopword } from "stopword";
import stopword from "stopword";
import { fetchMessageTrainingData } from "../utils/dataUtils";
import { obtainFeatureCounts, preprocessText } from "../utils/textUtils";

export const spitRouter = createTRPCRouter({
  infiniteProfileFeed: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), creationTime: z.date() }).optional(),
      })
    )
    .query(async ({ input: { limit = 10, userId, cursor }, ctx }) => {
      return await getInfiniteSpits({
        limit,
        ctx,
        cursor,
        whereClause: { userId },
      });
    }),

  infiniteFeed: publicProcedure
    .input(
      z.object({
        onlyFollowing: z.boolean().optional(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), creationTime: z.date() }).optional(),
      })
    )
    .query(
      async ({ input: { limit = 10, onlyFollowing = false, cursor }, ctx }) => {
        const currentUserId = ctx.session?.user.id;
        return await getInfiniteSpits({
          limit,
          ctx,
          cursor,
          whereClause:
            currentUserId == null || !onlyFollowing
              ? undefined
              : {
                  user: {
                    followers: { some: { id: currentUserId } },
                  },
                },
        });
      }
    ),

  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {
      const spit = await ctx.prisma.spit.create({
        data: { content, userId: ctx.session.user.id },
      });

      void ctx.revalidateSSG?.(`/profiles${ctx.session.user.id}`);

      return spit;
    }),

  toggleLike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const data = { spitId: id, userId: ctx.session.user.id };
      const existingLike = await ctx.prisma.like.findUnique({
        where: { userId_spitId: data },
      });

      if (existingLike == null) {
        await ctx.prisma.like.create({ data });
        //Add here the functions for adding like message to the bag of words. Use id
        const newData = await fetchMessageTrainingData(
          data.spitId,
          data.userId
        );
        const preprocessedMessage = preprocessText(newData, "positive");

        const featureCounts = obtainFeatureCounts(preprocessedMessage);
        console.log(newData, "training data");
        console.log(preprocessedMessage, "preprocessed");
        console.log(featureCounts, "feature counts");
        //Here is where it ends.
        return { addedLike: true };
      } else {
        await ctx.prisma.like.delete({ where: { userId_spitId: data } });
        //Add here the functions for deleting like message from the bag of words. Use id
        return { addedLike: false };
      }
    }),

  toggleDislike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const data = { spitId: id, userId: ctx.session.user.id };
      const existingDislike = await ctx.prisma.dislike.findUnique({
        where: { userId_spitId: data },
      });

      if (existingDislike == null) {
        await ctx.prisma.dislike.create({ data });
        return { addedDislike: true };
      } else {
        await ctx.prisma.dislike.delete({ where: { userId_spitId: data } });
        return { addedDislike: false };
      }
    }),
});

async function getInfiniteSpits({
  whereClause,
  ctx,
  limit,
  cursor,
}: {
  whereClause?: Prisma.SpitWhereInput;
  limit: number;
  cursor:
    | {
        id: string;
        creationTime: Date;
      }
    | undefined;
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
}) {
  const currentUserId = ctx.session?.user.id;
  //This data contains all tweets in order by time & sequence.
  //They paginate every 10 tweets by default.
  const data = await ctx.prisma.spit.findMany({
    take: limit + 1,
    cursor: cursor ? { creationTime_id: cursor } : undefined,
    orderBy: [{ creationTime: "desc" }, { id: "desc" }],
    where: whereClause,
    select: {
      id: true,
      content: true,
      creationTime: true,
      _count: { select: { likes: true, dislikes: true } },
      likes:
        currentUserId == null ? false : { where: { userId: currentUserId } },
      dislikes:
        currentUserId == null ? false : { where: { userId: currentUserId } },
      user: {
        select: { name: true, id: true, image: true },
      },
    },
  });

  let nextCursor: typeof cursor | undefined;

  if (data.length > limit) {
    const nextItem = data.pop();
    if (nextItem != null) {
      nextCursor = {
        id: nextItem.id,
        creationTime: nextItem.creationTime,
      };
    }
  }

  return {
    spits: data.map((spit) => {
      return {
        id: spit.id,
        content: spit.content,
        creationTime: spit.creationTime,
        likeCount: spit._count.likes,
        dislikeCount: spit._count.dislikes,
        user: spit.user,
        likedByMe: spit.likes?.length > 0,
        dislikedByMe: spit.dislikes?.length > 0,
      };
    }),
    nextCursor,
  };
}

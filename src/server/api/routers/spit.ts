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
        return { addedLike: true };
      } else {
        await ctx.prisma.like.delete({ where: { userId_spitId: data } });
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

//Below are the functions for the Naive Bayes Algorithm feeds.
type Data = {
  content: string;
  liked: boolean;
  disliked: boolean;
  neutral: boolean;
}[];

export async function fetchTrainingData(accountId: string) {
  const likes: Like[] = await prisma.like.findMany({
    where: {
      userId: accountId,
    },
  });
  const dislikes: Dislike[] = await prisma.dislike.findMany({
    where: {
      userId: accountId,
    },
  });

  const likedSpitIds = likes.map((like) => like.spitId);
  const dislikedSpitIds = dislikes.map((dislike) => dislike.spitId);
  const likedSpits = await prisma.spit.findMany({
    where: {
      id: {
        in: likedSpitIds,
      },
    },
  });

  console.log(likedSpits, "liked spits");

  const notLikedSpits = await prisma.spit.findMany({
    where: {
      NOT: [
        {
          id: {
            in: likedSpitIds,
          },
        },
        {
          id: {
            in: dislikedSpitIds,
          },
        },
      ],
    },
  });

  const likedTrainingData: Data = likedSpits.map((spit) => {
    return {
      content: spit.content,
      liked: true,
      disliked: false,
      neutral: false,
    };
  });

  const notLikedTrainingData: Data = notLikedSpits.map((spit) => {
    return {
      content: spit.content,
      liked: false,
      disliked: false,
      neutral: true,
    };
  });

  console.log(likedTrainingData, "Liked Training Data");

  const trainingData: Data = likedTrainingData.concat(notLikedTrainingData);

  return trainingData;
}

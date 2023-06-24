import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { Spit } from "~/utils/types";

export const spitRouter = createTRPCRouter({
  infiniteFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), creationTime: z.date() }).optional(),
      })
    )
    .query(async ({ input: { limit = 10, cursor }, ctx }) => {
      const currentUserId = ctx.session?.user.id;

      //This data contains all tweets in order by time & sequence.
      //They paginate every 10 tweets by default.
      const data = await ctx.prisma.spit.findMany({
        take: limit + 1,
        cursor: cursor ? { creationTime_id: cursor } : undefined,
        orderBy: [{ creationTime: "desc" }, { id: "desc" }],
        select: {
          id: true,
          content: true,
          creationTime: true,
          _count: { select: { likes: true } },
          likes:
            currentUserId == null
              ? false
              : { where: { userId: currentUserId } },
          user: {
            select: { name: true, id: true, image: true },
          },
        },
      });

      let nextCursor: typeof cursor | undefined;

      if (data.length > limit) {
        const nextItem = data.pop();
        if (nextItem != null) {
          nextCursor = { id: nextItem.id, creationTime: nextItem.creationTime };
        }
      }

      return {
        spits: data.map((spit) => {
          return {
            id: spit.id,
            content: spit.content,
            creationTime: spit.creationTime,
            likeCount: spit._count.likes,
            user: spit.user,
            likedByMe: spit.likes?.length > 0,
          };
        }),
        nextCursor,
      };
    }),

  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {
      const spit = await ctx.prisma.spit.create({
        data: { content, userId: ctx.session.user.id },
      });

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
});

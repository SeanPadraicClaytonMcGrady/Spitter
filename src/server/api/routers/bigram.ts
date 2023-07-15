import { createTRPCRouter, protectedProcedure } from "../trpc";

// export const bigramRouter = createTRPCRouter({

//     updateBigrams: protectedProcedure.input(
//         z.object({
//             //Continue from here to update the table. Be careful: each user gets their own record of a bigram.
//             //This is fine for now, but think of future efficiency.
//         })
//     )

//     //This code is for reference as I am still learning.

//     //  infiniteProfileFeed: publicProcedure
//     // .input(
//     //     z.object({
//     //       userId: z.string(),
//     //       limit: z.number().optional(),
//     //       cursor: z.object({ id: z.string(), creationTime: z.date() }).optional(),
//     //     })
//     //   )
//     //   .query(async ({ input: { limit = 10, userId, cursor }, ctx }) => {
//     //     return await getInfiniteSpits({
//     //       limit,
//     //       ctx,
//     //       cursor,
//     //       whereClause: { userId },
//     //     });
//     //   }),

// })

import { prisma } from "~/server/db";
import { Like, Dislike } from "@prisma/client";

export async function fetchMessageTrainingData(spitId: string, userId: string) {
  const message = await prisma.like.findUnique({
    where: { userId_spitId: { userId, spitId } },
    include: {
      spit: true,
    },
  });

  const spitContent = message?.spit.content;

  if (spitContent === undefined) {
    throw new Error(
      "Unable to fetch message training data: spit content is undefined."
    );
  }

  return spitContent;
}

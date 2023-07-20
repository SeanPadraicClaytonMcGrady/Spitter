import { prisma } from "~/server/db";
import { Like, Dislike } from "@prisma/client";

//Redo this to take a random sample from the user's frequency counts. Take 80% for training & 20% for testing.
//The result will provide the basis for prediction in the like or dislike tab.
//Start with like first.
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

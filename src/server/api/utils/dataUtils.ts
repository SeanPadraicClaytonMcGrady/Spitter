import { prisma } from "~/server/db";
import { Like, Dislike } from "@prisma/client";

type MessageData = {
  content: string;
  liked: boolean;
  disliked: boolean;
  neutral: boolean;
}[];

export async function fetchTrainingMessageData(accountId: string) {
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

  const likedTrainingMessageData: MessageData = likedSpits.map((spit) => {
    return {
      content: spit.content,
      liked: true,
      disliked: false,
      neutral: false,
    };
  });

  const notLikedTrainingMessageData: MessageData = notLikedSpits.map((spit) => {
    return {
      content: spit.content,
      liked: false,
      disliked: false,
      neutral: true,
    };
  });

  console.log(likedTrainingMessageData, "Liked Training MessageData");

  const trainingMessageData: MessageData = likedTrainingMessageData.concat(
    notLikedTrainingMessageData
  );

  return trainingMessageData;
}

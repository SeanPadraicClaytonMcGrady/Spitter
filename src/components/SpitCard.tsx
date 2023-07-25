import { api } from "~/utils/api";
import Link from "next/link";
import { ProfileImage } from "./ProfileImage";
import { HeartButton } from "./HeartButton";
import { DislikeButton } from "./DislikeButton";

export type Spit = {
  id: string;
  content: string;
  creationTime: Date;
  likeCount: number;
  likedByMe: boolean;
  dislikeCount: number;
  dislikedByMe: boolean;
  user: { id: string; image: string | null; name: string | null };
};

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});

export function SpitCard({
  id,
  user,
  content,
  creationTime,
  likeCount,
  likedByMe,
  dislikeCount,
  dislikedByMe,
}: Spit) {
  const trpcUtils = api.useContext();
  const toggleLike = api.spit.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
      const updateData: Parameters<
        typeof trpcUtils.spit.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        if (oldData == null) return;

        const countModifier = addedLike ? 1 : -1;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            return {
              ...page,
              spits: page.spits.map((spit) => {
                if (spit.id === id) {
                  return {
                    ...spit,
                    likeCount: spit.likeCount + countModifier,
                    likedByMe: addedLike,
                  };
                }

                return spit;
              }),
            };
          }),
        };
      };

      trpcUtils.spit.infiniteFeed.setInfiniteData({}, updateData);
      trpcUtils.spit.infiniteFeed.setInfiniteData(
        { onlyFollowing: true },
        updateData
      );
      trpcUtils.spit.infiniteProfileFeed.setInfiniteData(
        { userId: user.id },
        updateData
      );
    },
  });

  //   const addLikeBigrams = api.bigram.addBigrams.useMutation({
  //     onSuccess: () => {
  //       console.log("Bigrams added.");
  //     },
  //   });

  //We will return to addLikeBigrams later once the backend is finished. We will add it to handleToggleLike.
  //Then we will create the counterpart and add it to handleToggleDislike.
  function handleToggleLike() {
    toggleLike.mutate({ id });

    if (dislikedByMe) {
      toggleDislike.mutate({ id });
    }
  }

  const toggleDislike = api.spit.toggleDislike.useMutation({
    onSuccess: ({ addedDislike }) => {
      const updateData: Parameters<
        typeof trpcUtils.spit.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        if (oldData == null) return;

        const countModifier = addedDislike ? 1 : -1;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            return {
              ...page,
              spits: page.spits.map((spit) => {
                if (spit.id === id) {
                  return {
                    ...spit,
                    dislikeCount: spit.dislikeCount + countModifier,
                    dislikedByMe: addedDislike,
                  };
                }

                return spit;
              }),
            };
          }),
        };
      };
      trpcUtils.spit.infiniteFeed.setInfiniteData({}, updateData);
      trpcUtils.spit.infiniteFeed.setInfiniteData(
        { onlyFollowing: true },
        updateData
      );
      trpcUtils.spit.infiniteProfileFeed.setInfiniteData(
        { userId: user.id },
        updateData
      );
    },
  });

  function handleToggleDislike() {
    toggleDislike.mutate({ id });

    if (likedByMe) {
      toggleLike.mutate({ id });
    }
  }

  return (
    <li className="flex gap-4 border-b px-4 py-4">
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className="flex flex-grow flex-col">
        <div className="flex gap-1">
          <Link
            href={`/profiles/${user.id}`}
            className="font-bold outline-none hover:underline focus-visible:underline"
          >
            {user.name}
          </Link>
          <span className="text-gray-500">-</span>
          <span className="text-gray-500">
            {dateTimeFormatter.format(creationTime)}
          </span>
        </div>
        <p className="whitespace-pre-wrap">{content}</p>
        <div className="flex-start flex gap-6">
          <HeartButton
            onClick={handleToggleLike}
            isLoading={toggleLike.isLoading}
            likedByMe={likedByMe}
            likeCount={likeCount}
          />
          <DislikeButton
            onClick={handleToggleDislike}
            isLoading={toggleDislike.isLoading}
            dislikedByMe={dislikedByMe}
            dislikeCount={dislikeCount}
          />
        </div>
      </div>
    </li>
  );
}

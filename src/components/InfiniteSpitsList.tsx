import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import { ProfileImage } from "./ProfileImage";
import { useSession } from "next-auth/react";
import { VscHeartFilled, VscHeart } from "react-icons/vsc";
import { IconHoverEffect } from "./IconHoverEffect";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./LoadingSpinner";
import { ImTongue, ImTongue2 } from "react-icons/im";

type Spit = {
  id: string;
  content: string;
  creationTime: Date;
  likeCount: number;
  likedByMe: boolean;
  dislikeCount: number;
  dislikedByMe: boolean;
  user: { id: string; image: string | null; name: string | null };
};

type InfiniteSpitListProps = {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  fetchNewSpits: () => Promise<unknown>;
  spits?: Spit[];
};

//This is the equivalent of a twitter feed.
export function InfiniteSpitList({
  spits,
  isError,
  isLoading,
  fetchNewSpits,
  hasMore,
}: InfiniteSpitListProps) {
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <h1>Error...</h1>;
  if (spits == null) return null;

  if (spits.length === 0 || spits == null) {
    return (
      <h2 className="text-2x1 my-4 text-center text-gray-500">No Spits</h2>
    );
  }

  return (
    <ul>
      <InfiniteScroll
        dataLength={spits.length}
        next={fetchNewSpits}
        hasMore={hasMore}
        loader={<LoadingSpinner />}
      >
        {spits.map((spit) => {
          return <SpitCard key={spit.id} {...spit} />;
        })}
      </InfiniteScroll>
    </ul>
  );
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});

function SpitCard({
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

type HeartButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  likedByMe: boolean;
  likeCount: number;
};

function HeartButton({
  isLoading,
  onClick,
  likedByMe,
  likeCount,
}: HeartButtonProps) {
  const session = useSession();
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

  if (session.status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <HeartIcon />
        <span>{likeCount}</span>
      </div>
    );
  }
  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className={`group -ml-2 flex items-center gap-1 self-start transition-colors duration-200 ${
        likedByMe
          ? "text-red-500"
          : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"
      }`}
    >
      <IconHoverEffect red>
        <HeartIcon
          className={`transition-colors duration-200 ${
            likedByMe
              ? "fill-red-500"
              : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"
          }`}
        />
      </IconHoverEffect>
      <span>{likeCount}</span>
    </button>
  );
}

type DislikeButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  dislikedByMe: boolean;
  dislikeCount: number;
};

function DislikeButton({
  isLoading,
  onClick,
  dislikedByMe,
  dislikeCount,
}: DislikeButtonProps) {
  const session = useSession();
  const DislikeIcon = dislikedByMe ? ImTongue2 : ImTongue;

  if (session.status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <DislikeIcon />
        <span>{dislikeCount}</span>
      </div>
    );
  }
  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      className={`group -ml-2 flex items-center gap-1 self-start transition-colors duration-200 ${
        dislikedByMe
          ? "text-blue-500"
          : "text-gray-500 hover:text-blue-500 focus-visible:text-blue-500"
      }`}
    >
      <IconHoverEffect red>
        <DislikeIcon
          className={`transition-colors duration-200 ${
            dislikedByMe
              ? "fill-blue-500"
              : "fill-gray-500 group-hover:fill-blue-500 group-focus-visible:fill-blue-500"
          }`}
        />
      </IconHoverEffect>
      <span>{dislikeCount}</span>
    </button>
  );
}

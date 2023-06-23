import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import { ProfileImage } from "./ProfileImage";
import { useSession } from "next-auth/react";
import { VscHeartFilled, VscHeart } from "react-icons/vsc";

type Spit = {
  id: string;
  content: string;
  creationTime: Date;
  likeCount: number;
  likedByMe: boolean;
  user: { id: string; image: string | null; name: string | null };
};

type InfiniteSpitListProps = {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  fetchNewSpits: () => Promise<unknown>;
  spits?: Spit[];
};

export function InfiniteSpitList({
  spits,
  isError,
  isLoading,
  fetchNewSpits,
  hasMore,
}: InfiniteSpitListProps) {
  if (isLoading) return <h1>Loading...</h1>;
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
        loader={"Loading..."}
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
}: Spit) {
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
        <HeartButton likedByMe={likedByMe} likeCount={likeCount} />
      </div>
    </li>
  );
}

type HeartButtonProps = {
  likedByMe: boolean;
  likeCount: number;
};

function HeartButton({ likedByMe, likeCount }: HeartButtonProps) {
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
    <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
      <HeartIcon />
      <span>{likeCount}</span>
    </div>
  );
}

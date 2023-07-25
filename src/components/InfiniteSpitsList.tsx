import InfiniteScroll from "react-infinite-scroll-component";
import { LoadingSpinner } from "./LoadingSpinner";
import { SpitCard } from "./SpitCard";
import { Spit } from "./SpitCard";

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

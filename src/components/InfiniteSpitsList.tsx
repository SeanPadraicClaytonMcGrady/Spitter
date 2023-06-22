import InfiniteScroll from "react-infinite-scroll-component";

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
  hasMore?: boolean;
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
          return <div key={spit.id}>{spit.content}</div>;
        })}
      </InfiniteScroll>
    </ul>
  );
}

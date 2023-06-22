import { type NextPage } from "next";
import React from "react";
import { InfiniteSpitList } from "~/components/InfiniteSpitsList";
import NewTweetForm from "~/components/NewTweetForm";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h1 className="mb-2 px-4 text-lg font-bold">Home</h1>
      </header>
      <NewTweetForm />
      <RecentSpits />
    </>
  );
};

function RecentSpits() {
  const spits = api.spit.infiniteFeed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  return (
    <InfiniteSpitList
      spits={spits.data?.pages.flatMap((page) => page.spits)}
      isError={spits.isError}
      isLoading={spits.isLoading}
      hasMore={spits.hasNextPage}
      fetchNewSpits={spits.fetchNextPage}
    />
  );
}

export default Home;

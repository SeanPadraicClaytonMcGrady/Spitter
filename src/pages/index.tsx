import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import React from "react";
import { InfiniteSpitList } from "~/components/InfiniteSpitsList";
import NewTweetForm from "~/components/NewSpitForm";
import { api } from "~/utils/api";

const TABS = ["Recent", "Following"] as const;
const Home: NextPage = () => {
  // const [selectedTab, setSelectedTab] =
  //   useState<(typeof TABS)[number]>("Recent");
  const session = useSession();
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h1 className="mb-2 px-4 text-lg font-bold">Home</h1>
        {session.status === "authenticated" && (
          <div className="flex">{TABS}</div>
        )}
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
      hasMore={spits.hasNextPage || false}
      fetchNewSpits={spits.fetchNextPage}
    />
  );
}

export default Home;

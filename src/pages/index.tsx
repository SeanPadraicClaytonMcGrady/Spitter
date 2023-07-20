import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { number } from "zod";
import { InfiniteSpitList } from "~/components/InfiniteSpitsList";
import NewTweetForm from "~/components/NewSpitForm";
import { api } from "~/utils/api";

const TABS = ["Recent", "Following", "Like-Based"] as const;

const Home: NextPage = () => {
  const [selectedTab, setSelectedTab] =
    useState<(typeof TABS)[number]>("Recent");

  const session = useSession();
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h1 className="mb-2 px-4 text-lg font-bold">Home</h1>
        {session.status === "authenticated" && (
          <div className="flex">
            {TABS.map((tab) => {
              return (
                <button
                  key={tab}
                  className={`flex-grow p-2 hover:bg-gray-200 focus-visible:bg-gray-200 ${
                    tab === selectedTab
                      ? "border-b-4 border-b-blue-500 font-bold"
                      : ""
                  }`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        )}
      </header>
      <NewTweetForm />
      {/* I need to adjust this conditional logic below to reflect a plurality of tabs. */}
      {selectedTab === "Recent" ? <RecentSpits /> : <FollowingSpits />}
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

function FollowingSpits() {
  const spits = api.spit.infiniteFeed.useInfiniteQuery(
    { onlyFollowing: true },
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

function LikedSpits() {
  return "";
}

export default Home;

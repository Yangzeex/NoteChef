"use client";

import { useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { RecipeCardSkeleton } from "@/components/recipe/RecipeCardSkeleton";
import { useInView } from "react-intersection-observer";
import { ChefHat } from "lucide-react";

export function FeedGrid() {
  const { ref, inView } = useInView({ threshold: 0 });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    trpc.recipe.feed.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        refetchOnWindowFocus: false,
      }
    );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const recipes = data?.pages.flatMap((p) => p.items) ?? [];

  if (isLoading) {
    return <SkeletonGrid />;
  }

  if (recipes.length === 0) {
    return <EmptyFeed />;
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} {...recipe} />
        ))}
        {isFetchingNextPage &&
          Array.from({ length: 3 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={ref} className="h-10" />

      {!hasNextPage && recipes.length > 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          You&apos;ve seen all the recipes ✨
        </p>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}

function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <ChefHat className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold">Your feed is empty</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Follow some cooks or explore recipes to get started.
      </p>
      <a
        href="/explore"
        className="mt-4 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Browse recipes →
      </a>
    </div>
  );
}

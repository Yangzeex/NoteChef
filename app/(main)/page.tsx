import { FeedGrid } from "@/components/feed/FeedGrid";

export default function HomePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Your Feed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Recipes from cooks you follow
        </p>
      </div>
      <FeedGrid />
    </div>
  );
}

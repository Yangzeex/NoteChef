import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, MessageCircle } from "lucide-react";

type RecipeCardProps = {
  id: string;
  title: string;
  difficulty: string | null;
  cookTime: number | null;
  tags: string[] | null;
  thumbnail: string | null;
  thumbnailType: string | null;
  muxPlaybackId: string | null;
  likeCount: number | null;
  commentCount: number | null;
  author: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
};

const FOOD_GRADIENTS = [
  "from-orange-400 to-rose-400",
  "from-amber-400 to-orange-500",
  "from-lime-400 to-green-500",
  "from-teal-400 to-cyan-500",
  "from-violet-400 to-purple-500",
  "from-pink-400 to-rose-500",
];

function placeholderGradient(id: string) {
  const index = id.charCodeAt(0) % FOOD_GRADIENTS.length;
  return FOOD_GRADIENTS[index];
}

export function RecipeCard({
  id,
  title,
  difficulty,
  cookTime,
  tags,
  thumbnail,
  thumbnailType,
  muxPlaybackId,
  likeCount,
  commentCount,
  author,
}: RecipeCardProps) {
  const resolvedThumbnail =
    thumbnailType === "video" && muxPlaybackId
      ? `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg?time=0&width=640`
      : thumbnail;

  const initials = (author.displayName ?? author.username)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link href={`/recipe/${id}`} className="group block">
      <article className="overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {resolvedThumbnail ? (
            <Image
              src={resolvedThumbnail}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${placeholderGradient(id)}`}
            >
              <span className="text-4xl">🍽️</span>
            </div>
          )}
          {difficulty && (
            <span
              className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${DIFFICULTY_COLOR[difficulty] ?? "bg-muted text-muted-foreground"}`}
            >
              {difficulty}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="line-clamp-2 font-semibold leading-snug text-foreground group-hover:text-primary">
            {title}
          </h3>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <Link
              href={`/profile/${author.username}`}
              className="flex items-center gap-2 hover:opacity-80"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={author.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {author.displayName ?? `@${author.username}`}
              </span>
            </Link>

            <div className="flex items-center gap-3 text-muted-foreground">
              {cookTime && (
                <span className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {cookTime}m
                </span>
              )}
              <span className="flex items-center gap-1 text-xs">
                <Heart className="h-3 w-3" />
                {likeCount ?? 0}
              </span>
              <span className="flex items-center gap-1 text-xs">
                <MessageCircle className="h-3 w-3" />
                {commentCount ?? 0}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

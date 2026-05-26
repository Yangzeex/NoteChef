import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Home, Compass, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth();

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🍳</span>
            <span className="text-lg font-bold tracking-tight">Notechef</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-1 sm:flex">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Home className="h-4 w-4" />
                Feed
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Compass className="h-4 w-4" />
                Explore
              </Button>
            </Link>
            {userId && (
              <Link href="/recipe/new">
                <Button size="sm" className="ml-2 gap-2">
                  <PlusSquare className="h-4 w-4" />
                  New Recipe
                </Button>
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Mobile new recipe */}
            {userId && (
              <Link href="/recipe/new" className="sm:hidden">
                <Button size="icon" variant="ghost">
                  <PlusSquare className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm sm:hidden">
        <div className="flex h-14 items-center justify-around">
          <Link href="/" className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Home className="h-5 w-5" />
            <span className="text-[10px]">Feed</span>
          </Link>
          <Link href="/explore" className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Compass className="h-5 w-5" />
            <span className="text-[10px]">Explore</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

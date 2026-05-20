import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UsernameForm } from "./UsernameForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OnboardingPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  // If the user already has a real username (not the auto-generated fallback), skip onboarding
  const [user] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user && !user.username.startsWith("user_")) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome to Notechef</h1>
          <p className="mt-1 text-muted-foreground">
            Pick a username so other cooks can find you.
          </p>
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Your profile URL</CardTitle>
            <CardDescription>
              notechef.app/profile/<span className="font-mono">username</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsernameForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

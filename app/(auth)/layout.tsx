import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 text-center">
        <Link href="/" className="text-3xl font-bold tracking-tight text-foreground">
          Notechef
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          Share recipes. Follow great cooks.
        </p>
      </div>
      {children}
    </main>
  );
}

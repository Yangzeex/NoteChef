"use client";

import { useRef, useState, useTransition } from "react";
import { claimUsername } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UsernameForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await claimUsername(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Choose your username</Label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">@</span>
          <Input
            id="username"
            name="username"
            placeholder="gordon_ramsay"
            autoComplete="off"
            autoFocus
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">
          3–20 characters. Letters, numbers, and underscores only.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving…" : "Continue to Notechef"}
      </Button>
    </form>
  );
}

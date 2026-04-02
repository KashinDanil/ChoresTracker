import Link from "next/link";
import { Database, ListChecks, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function Home() {
  const supabaseStatus = isSupabaseConfigured
    ? "Configured"
    : "Not configured (safe mode enabled)";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-4">
        <p className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
          <Rocket className="size-4" />
          Foundation ready
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          ChoresTracker starter
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          Next.js App Router, TypeScript, Supabase, Lucide, and Shadcn UI are
          set up. You can start implementing features without additional
          bootstrapping work.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-5">
          <div className="mb-3 inline-flex items-center gap-2 text-sm font-medium">
            <Database className="size-4" />
            Supabase status
          </div>
          <p className="text-sm text-muted-foreground">{supabaseStatus}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add keys in <code>.env.local</code> when you are ready.
          </p>
        </div>
        <div className="rounded-xl border p-5">
          <div className="mb-3 inline-flex items-center gap-2 text-sm font-medium">
            <ListChecks className="size-4" />
            UI stack
          </div>
          <p className="text-sm text-muted-foreground">
            Shadcn UI initialized with Radix components and Lucide icons.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="https://ui.shadcn.com/docs/components">Add components</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="https://vercel.com/new">Deploy to Vercel</Link>
        </Button>
      </div>
    </main>
  );
}

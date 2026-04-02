import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  Dices,
  ListChecks,
  Repeat,
  Users,
  UserRoundCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: ListChecks,
    title: "Track chores",
    description: "Create chores with due dates, descriptions, and optional repeat schedules.",
  },
  {
    icon: Dices,
    title: "Play to decide",
    description:
      "When a chore is due, the app picks a random real-life game to decide who takes it on.",
  },
  {
    icon: Users,
    title: "Household teams",
    description:
      "Create a household and invite others with a simple code. Everyone shares the same chore board.",
  },
];

const steps = [
  {
    icon: CalendarClock,
    title: "Create a chore",
    description: "Add a task with a due date. Set it to repeat daily, weekly, or monthly if needed.",
  },
  {
    icon: Dices,
    title: "The app picks a game",
    description:
      "Once the due date arrives, a random game is chosen — Rock-Paper-Scissors, Coin Flip, Thumb War, and more.",
  },
  {
    icon: Users,
    title: "Play it out",
    description:
      "Gather your household members and play the game in real life. Fair and square.",
  },
  {
    icon: UserRoundCheck,
    title: "Assign the chosen one",
    description:
      "Select the person who drew the short straw. They get assigned to the chore.",
  },
  {
    icon: CheckCircle2,
    title: "Get it done",
    description:
      "The assignee completes the chore and marks it as done. If it repeats, a new one appears automatically.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <ListChecks className="size-8 text-primary" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            ChoresTracker
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            Nobody likes doing chores, but somebody has to. ChoresTracker makes
            it fair — create a chore, play a quick game, and let fate decide who
            takes care of it.
          </p>
          <div className="flex gap-3">
            <Button asChild size="lg">
              <Link href="/sign-up">Get started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30 px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-semibold">
              What you get
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border bg-background p-5">
                  <f.icon className="mb-3 size-6 text-primary" />
                  <p className="font-medium">{f.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-10 text-center text-2xl font-semibold">
              How it works
            </h2>
            <div className="relative space-y-8">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-border sm:left-6" />
              {steps.map((step, i) => (
                <div key={step.title} className="relative flex gap-4 sm:gap-5">
                  {/* Step number */}
                  <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border bg-background text-sm font-semibold sm:size-12 sm:text-base">
                    {i + 1}
                  </div>
                  <div className="pt-1.5 sm:pt-2.5">
                    <div className="flex items-center gap-2">
                      <step.icon className="size-4 text-primary" />
                      <p className="font-medium">{step.title}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-muted/30 px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold">Ready to make chores fair?</h2>
          <p className="mt-2 text-muted-foreground">
            Create a household, invite your people, and never argue about chores
            again.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/sign-up">Get started for free</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-6">
        <div className="mx-auto max-w-4xl text-center text-xs text-muted-foreground">
          <p>
            Built with Next.js, Supabase, and{" "}
            <a
              href="https://claude.ai/code"
              className="underline hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              Claude Code
            </a>
            . Not a single line of code was written by a human.
          </p>
        </div>
      </footer>
    </div>
  );
}

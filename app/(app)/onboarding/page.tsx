"use client";

import { useActionState, useState } from "react";
import { createHousehold, joinHousehold } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function createAction(_prev: { error: string } | null, formData: FormData) {
  return createHousehold(formData);
}

function joinAction(_prev: { error: string } | null, formData: FormData) {
  return joinHousehold(formData);
}

export default function OnboardingPage() {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [createState, createFormAction, createPending] = useActionState(
    createAction,
    null,
  );
  const [joinState, joinFormAction, joinPending] = useActionState(
    joinAction,
    null,
  );

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-sm items-center justify-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Get started</CardTitle>
          <CardDescription>
            Create a new household or join an existing one with an invite code.
          </CardDescription>
        </CardHeader>

        <div className="flex border-b">
          <button
            onClick={() => setMode("create")}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              mode === "create"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground"
            }`}
          >
            Create
          </button>
          <button
            onClick={() => setMode("join")}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              mode === "join"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground"
            }`}
          >
            Join
          </button>
        </div>

        {mode === "create" ? (
          <form action={createFormAction}>
            <CardContent className="space-y-4 pt-4">
              {createState?.error && (
                <p className="text-sm text-destructive">{createState.error}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Household name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. The Smiths"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={createPending}>
                {createPending ? "Creating…" : "Create household"}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form action={joinFormAction}>
            <CardContent className="space-y-4 pt-4">
              {joinState?.error && (
                <p className="text-sm text-destructive">{joinState.error}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Invite code</Label>
                <Input
                  id="inviteCode"
                  name="inviteCode"
                  placeholder="e.g. a3f8b2c1"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={joinPending}>
                {joinPending ? "Joining…" : "Join household"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";
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
import { toast } from "sonner";
import { useEffect, useRef } from "react";

function profileAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  return updateProfile(formData);
}

export default function ProfilePage() {
  const [state, action, pending] = useActionState(profileAction, null);
  const toasted = useRef(false);

  useEffect(() => {
    if (state?.success && !toasted.current) {
      toast.success("Profile updated");
      toasted.current = true;
    }
    if (state?.error) {
      toasted.current = false;
    }
    if (state?.success) {
      // Reset for next submission
      const timeout = setTimeout(() => {
        toasted.current = false;
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [state]);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
          <CardDescription>
            Update your display name. This is how other household members see
            you.
          </CardDescription>
        </CardHeader>
        <form action={action}>
          <CardContent className="space-y-4">
            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                name="displayName"
                placeholder="Your name"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

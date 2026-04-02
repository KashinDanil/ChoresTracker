"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    const hasUrl = Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
    const hasKey = Boolean(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    return { error: `Supabase is not configured. URL: ${hasUrl ? "set" : "MISSING"}, Key: ${hasKey ? "set" : "MISSING"}` };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signIn(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  await supabase.auth.signOut();
  redirect("/sign-in");
}

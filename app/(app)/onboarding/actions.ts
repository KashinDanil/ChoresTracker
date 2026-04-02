"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function createHousehold(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Household name is required." };

  const { data: household, error } = await supabase
    .from("households")
    .insert({ name: name.trim(), created_by: user.id })
    .select()
    .single();

  if (error) return { error: error.message };

  // Add creator as first member
  const { error: memberError } = await supabase
    .from("household_members")
    .insert({ household_id: household.id, user_id: user.id });

  if (memberError) return { error: memberError.message };

  redirect("/dashboard");
}

export async function joinHousehold(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const inviteCode = formData.get("inviteCode") as string;
  if (!inviteCode?.trim()) return { error: "Invite code is required." };

  // Use RPC to join — bypasses RLS since user can't SELECT household before being a member
  const { error: joinError } = await supabase.rpc(
    "join_household_by_invite",
    { code: inviteCode.trim() },
  );

  if (joinError) {
    if (joinError.code === "23505") {
      return { error: "You are already a member of this household." };
    }
    return { error: joinError.message };
  }

  redirect("/dashboard");
}

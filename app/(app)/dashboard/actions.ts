"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Chore = Database["public"]["Tables"]["chores"]["Row"];

async function createNextOccurrence(
  supabase: SupabaseClient<Database>,
  chore: Chore,
  currentUserId: string,
) {
  const dueDate = new Date(chore.due_date);
  switch (chore.recurrence) {
    case "daily":
      dueDate.setDate(dueDate.getDate() + 1);
      break;
    case "weekly":
      dueDate.setDate(dueDate.getDate() + 7);
      break;
    case "biweekly":
      dueDate.setDate(dueDate.getDate() + 14);
      break;
    case "monthly":
      dueDate.setMonth(dueDate.getMonth() + 1);
      break;
  }

  // Use current user as created_by so the INSERT RLS policy passes
  await supabase.from("chores").insert({
    household_id: chore.household_id,
    title: chore.title,
    description: chore.description,
    due_date: dueDate.toISOString(),
    created_by: currentUserId,
    recurrence: chore.recurrence,
  });
}

export async function createChore(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) return { error: "No household found." };

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const dueDate = formData.get("dueDate") as string;
  const recurrenceRaw = formData.get("recurrence") as string;
  const recurrence =
    recurrenceRaw && recurrenceRaw !== "none" ? recurrenceRaw : null;

  if (!title?.trim()) return { error: "Title is required." };
  if (!dueDate) return { error: "Due date is required." };

  const { error } = await supabase.from("chores").insert({
    household_id: membership.household_id,
    title: title.trim(),
    description: description?.trim() || null,
    due_date: dueDate,
    created_by: user.id,
    recurrence: recurrence as
      | "daily"
      | "weekly"
      | "biweekly"
      | "monthly"
      | null,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateChore(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const choreId = formData.get("choreId") as string;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const dueDate = formData.get("dueDate") as string;
  const recurrenceRaw = formData.get("recurrence") as string;
  const recurrence =
    recurrenceRaw && recurrenceRaw !== "none" ? recurrenceRaw : null;

  if (!title?.trim()) return { error: "Title is required." };
  if (!dueDate) return { error: "Due date is required." };

  const { error } = await supabase
    .from("chores")
    .update({
      title: title.trim(),
      description: description?.trim() || null,
      due_date: dueDate,
      recurrence: recurrence as
        | "daily"
        | "weekly"
        | "biweekly"
        | "monthly"
        | null,
    })
    .eq("id", choreId)
    .eq("status", "pending");

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteChore(choreId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("chores")
    .delete()
    .eq("id", choreId)
    .eq("created_by", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function fetchGames() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured.", games: [] };

  const { data: games, error } = await supabase
    .from("games")
    .select("name, description");

  if (error || !games?.length) return { error: "No games available.", games: [] };
  return { games };
}

export async function pickGame(choreId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Fetch all games
  const { data: games, error: gamesError } = await supabase
    .from("games")
    .select("name, description");

  if (gamesError || !games?.length) return { error: "No games available." };

  const allGameNames = games.map((g) => g.name);
  const randomGame = games[Math.floor(Math.random() * games.length)];

  const { error } = await supabase
    .from("chores")
    .update({
      status: "awaiting_result" as const,
      game_name: randomGame.name,
    })
    .eq("id", choreId)
    .in("status", ["pending", "awaiting_game"]);

  if (error) return { error: error.message };

  // Don't revalidate here — the modal stays open for assignee selection.
  // revalidatePath will be called by assignChosenOne after the user assigns.
  return { success: true, gameName: randomGame.name, gameDescription: randomGame.description, allGameNames };
}

export async function assignChosenOne(choreId: string, userId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("chores")
    .update({
      assigned_to: userId,
      status: "assigned" as const,
    })
    .eq("id", choreId)
    .eq("status", "awaiting_result");

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function markDone(choreId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Fetch the chore to check assignee and recurrence
  const { data: chore, error: fetchError } = await supabase
    .from("chores")
    .select("*")
    .eq("id", choreId)
    .eq("status", "assigned")
    .eq("assigned_to", user.id)
    .single();

  if (fetchError || !chore) return { error: "Chore not found or you are not the assignee." };

  // Mark as done
  const { error } = await supabase
    .from("chores")
    .update({
      status: "done" as const,
      completed_at: new Date().toISOString(),
    })
    .eq("id", choreId);

  if (error) return { error: error.message };

  // If repeatable, create the next occurrence
  if (chore.recurrence) {
    await createNextOccurrence(supabase, chore, user.id);
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function completeEarly(choreId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Fetch the chore for recurrence info
  const { data: chore, error: fetchError } = await supabase
    .from("chores")
    .select("*")
    .eq("id", choreId)
    .neq("status", "done")
    .single();

  if (fetchError || !chore) return { error: "Chore not found." };

  // Mark as done with current user as the one who completed it
  const { error } = await supabase
    .from("chores")
    .update({
      status: "done" as const,
      assigned_to: user.id,
      completed_at: new Date().toISOString(),
    })
    .eq("id", choreId);

  if (error) return { error: error.message };

  // If repeatable, create the next occurrence
  if (chore.recurrence) {
    await createNextOccurrence(supabase, chore, user.id);
  }

  revalidatePath("/dashboard");
  return { success: true };
}

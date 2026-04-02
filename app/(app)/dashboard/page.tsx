import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ChoreCard } from "@/components/chore-card";
import { CreateChoreDialog } from "@/components/create-chore-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/sign-in");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Get household membership
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");

  // Transition overdue pending chores to awaiting_game
  await supabase
    .from("chores")
    .update({ status: "awaiting_game" as const })
    .eq("household_id", membership.household_id)
    .eq("status", "pending")
    .lte("due_date", new Date().toISOString());

  // Fetch chores for the household
  const { data: chores } = await supabase
    .from("chores")
    .select("*")
    .eq("household_id", membership.household_id)
    .order("due_date", { ascending: true });

  // Fetch household members for the assignee dropdown
  const { data: membersRaw } = await supabase
    .from("household_members")
    .select("user_id, profiles(display_name)")
    .eq("household_id", membership.household_id);

  const members = (membersRaw ?? []).map((m) => ({
    user_id: m.user_id,
    display_name: m.profiles?.display_name || "Unknown",
  }));

  // Split into active/done
  const activeChores = (chores ?? [])
    .filter((c) => c.status !== "done")
    .map((c) => ({ ...c, effectiveStatus: c.status }));

  const doneChores = (chores ?? [])
    .filter((c) => c.status === "done")
    .sort((a, b) => new Date(b.completed_at ?? 0).getTime() - new Date(a.completed_at ?? 0).getTime());

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chores</h1>
        <CreateChoreDialog />
      </div>

      <div className="mt-6 space-y-3">
        {activeChores.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            No active chores. Create one to get started!
          </p>
        )}
        {activeChores.map((chore) => (
          <ChoreCard
            key={chore.id}
            chore={chore}
            effectiveStatus={chore.effectiveStatus}
            members={members}
            currentUserId={user.id}
          />
        ))}
      </div>

      {doneChores.length > 0 && (
        <Collapsible className="mt-8">
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ChevronDown className="size-4" />
            Done ({doneChores.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            {doneChores.map((chore) => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                effectiveStatus="done"
                members={members}
                currentUserId={user.id}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

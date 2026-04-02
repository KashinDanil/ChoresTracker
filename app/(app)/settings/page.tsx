import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Copy, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CopyInviteCode } from "@/components/copy-invite-code";

export default async function SettingsPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/sign-in");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Get user's household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id, households(id, name, invite_code)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership?.households) redirect("/onboarding");

  const household = membership.households;

  // Get all members
  const { data: members } = await supabase
    .from("household_members")
    .select("user_id, joined_at, profiles(display_name, avatar_url)")
    .eq("household_id", household.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Household settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>{household.name}</CardTitle>
          <CardDescription>
            Share the invite code with others so they can join your household.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Invite code</p>
            <CopyInviteCode code={household.invite_code} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Members ({members?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members?.map((member) => (
              <div key={member.user_id} className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {member.profiles?.display_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {member.profiles?.display_name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined{" "}
                    {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

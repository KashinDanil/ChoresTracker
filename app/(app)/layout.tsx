import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/sign-in");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id, households(id, name, invite_code)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  const household = membership?.households ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        user={{
          email: user.email ?? "",
          displayName: profile?.display_name ?? "",
          avatarUrl: profile?.avatar_url ?? null,
        }}
        household={
          household
            ? { name: household.name, inviteCode: household.invite_code }
            : null
        }
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Clock, Dices, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import {
  deleteChore,
  pickGame,
  assignChosenOne,
  markDone,
  completeEarly,
} from "@/app/(app)/dashboard/actions";
import { EditChoreDialog } from "@/components/edit-chore-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Chore = {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: string;
  game_name: string | null;
  created_by: string;
  assigned_to: string | null;
  completed_at: string | null;
  recurrence: string | null;
};

type Member = {
  user_id: string;
  display_name: string;
};

type Props = {
  chore: Chore;
  effectiveStatus: string;
  members: Member[];
  currentUserId: string;
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  awaiting_game: "Pick a game",
  awaiting_result: "Waiting for result",
  assigned: "Assigned",
  done: "Done",
};

const statusColors: Record<string, string> = {
  pending: "border-muted-foreground/30 bg-muted text-muted-foreground",
  awaiting_game: "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200",
  awaiting_result: "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-200",
  assigned: "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200",
  done: "border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function ChoreCard({ chore, effectiveStatus, members, currentUserId }: Props) {
  const [pending, setPending] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  // Avoid hydration mismatch by rendering dates only on the client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isCreator = chore.created_by === currentUserId;
  const isAssignee = chore.assigned_to === currentUserId;
  const assigneeName = members.find((m) => m.user_id === chore.assigned_to)?.display_name;
  const creatorName = members.find((m) => m.user_id === chore.created_by)?.display_name;

  async function handleDelete() {
    setPending(true);
    const result = await deleteChore(chore.id);
    setPending(false);
    if (result.error) toast.error(result.error);
  }

  async function handlePickGame() {
    setPending(true);
    const result = await pickGame(chore.id);
    setPending(false);
    if (result.error) toast.error(result.error);
    else toast.success(`Game picked: ${result.gameName}`);
  }

  async function handleAssignChosenOne() {
    if (!selectedMember) return;
    setPending(true);
    const result = await assignChosenOne(chore.id, selectedMember);
    setPending(false);
    if (result.error) toast.error(result.error);
  }

  async function handleMarkDone() {
    setPending(true);
    const result = await markDone(chore.id);
    setPending(false);
    if (result.error) toast.error(result.error);
    else toast.success("Chore marked as done!");
  }

  async function handleCompleteEarly() {
    setPending(true);
    const result = await completeEarly(chore.id);
    setPending(false);
    if (result.error) toast.error(result.error);
    else toast.success("Chore completed!");
  }

  const isDone = effectiveStatus === "done";

  return (
    <div className="rounded-xl border p-4 space-y-3 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h3 className="font-medium text-foreground">{chore.title}</h3>
          {chore.description && (
            <p className="text-sm text-foreground/70">{chore.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className={`px-4 py-2 text-sm font-semibold ${statusColors[effectiveStatus]}`}>
            {statusLabels[effectiveStatus]}
          </Badge>
          {isCreator && !isDone && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
              disabled={pending}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="flex items-center gap-1 text-foreground/50">
          <Clock className="size-3" />
          {mounted ? formatDate(chore.due_date) : "…"}
        </span>
        {creatorName && (
          <span className="text-foreground/50">by {creatorName}</span>
        )}
        {chore.recurrence && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {chore.recurrence}
          </span>
        )}
      </div>

      {/* Highlighted assignee */}
      {assigneeName && !isDone && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <UserCheck className="mr-1 size-3" />
            Assigned to {assigneeName}
          </Badge>
        </div>
      )}

      {/* Status-dependent actions */}
      {(effectiveStatus === "pending" || effectiveStatus === "awaiting_game") && (
        <div className="flex flex-wrap gap-2">
          {effectiveStatus === "awaiting_game" && (
            <Button size="sm" onClick={handlePickGame} disabled={pending}>
              <Dices className="mr-1 size-4" />
              {pending ? "Picking…" : "Pick a game"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCompleteEarly}
            disabled={pending}
          >
            <UserCheck className="mr-1 size-3" />
            Complete now
          </Button>
          {isCreator && <EditChoreDialog chore={chore} />}
        </div>
      )}

      {effectiveStatus === "awaiting_result" && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Game: <span className="text-primary">{chore.game_name}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Play the game, then select the chosen one:
          </p>
          <div className="flex gap-2">
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select the chosen one" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    {m.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleAssignChosenOne}
              disabled={pending || !selectedMember}
            >
              {pending ? "Assigning…" : "Assign"}
            </Button>
          </div>
        </div>
      )}

      {effectiveStatus === "assigned" && isAssignee && (
        <Button size="sm" onClick={handleMarkDone} disabled={pending}>
          {pending ? "Completing…" : "Mark as done"}
        </Button>
      )}

      {isDone && (
        <div className="text-xs text-muted-foreground">
          Completed by{" "}
          <span className="font-medium text-foreground">{assigneeName}</span>
          {chore.completed_at && mounted &&
            ` on ${formatDate(chore.completed_at)}`}
        </div>
      )}
    </div>
  );
}

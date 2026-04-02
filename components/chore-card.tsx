"use client";

import { useState } from "react";
import { Clock, Dices, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import {
  deleteChore,
  pickGame,
  assignLoser,
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
  pending: "bg-muted text-muted-foreground",
  awaiting_game: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  awaiting_result: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  assigned: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function ChoreCard({ chore, effectiveStatus, members, currentUserId }: Props) {
  const [pending, setPending] = useState(false);
  const [selectedLoser, setSelectedLoser] = useState("");

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

  async function handleAssignLoser() {
    if (!selectedLoser) return;
    setPending(true);
    const result = await assignLoser(chore.id, selectedLoser);
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

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h3 className="font-medium">{chore.title}</h3>
          {chore.description && (
            <p className="text-sm text-muted-foreground">{chore.description}</p>
          )}
        </div>
        <Badge variant="secondary" className={statusColors[effectiveStatus]}>
          {statusLabels[effectiveStatus]}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          Due {new Date(chore.due_date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
        </span>
        {creatorName && <span>Created by {creatorName}</span>}
        {chore.recurrence && (
          <span className="capitalize">{chore.recurrence}</span>
        )}
        {assigneeName && effectiveStatus !== "done" && (
          <span className="flex items-center gap-1">
            <UserCheck className="size-3" />
            Assigned to {assigneeName}
          </span>
        )}
      </div>

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
          {isCreator && (
            <>
              <EditChoreDialog chore={chore} />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={pending}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-1 size-3" />
                Delete
              </Button>
            </>
          )}
        </div>
      )}

      {effectiveStatus === "awaiting_result" && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Game: <span className="text-primary">{chore.game_name}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Play the game, then select who lost:
          </p>
          <div className="flex gap-2">
            <Select value={selectedLoser} onValueChange={setSelectedLoser}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select loser" />
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
              onClick={handleAssignLoser}
              disabled={pending || !selectedLoser}
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

      {effectiveStatus === "done" && (
        <div className="text-xs text-muted-foreground">
          Completed by {assigneeName}{" "}
          {chore.completed_at &&
            `on ${new Date(chore.completed_at).toLocaleDateString()}`}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { updateChore } from "@/app/(app)/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  recurrence: string | null;
};

export function EditChoreDialog({ chore }: { chore: Chore }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
  const defaultDate = new Date(chore.due_date).toISOString().slice(0, 16);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await updateChore(formData);
    setPending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Chore updated");
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="mr-1 size-3" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit chore</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="choreId" value={chore.id} />
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              name="title"
              defaultValue={chore.title}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
              name="description"
              defaultValue={chore.description ?? ""}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-dueDate">Due date</Label>
            <Input
              id="edit-dueDate"
              name="dueDate"
              type="datetime-local"
              defaultValue={defaultDate}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-recurrence">Repeat</Label>
            <Select
              name="recurrence"
              defaultValue={chore.recurrence ?? "none"}
            >
              <SelectTrigger>
                <SelectValue placeholder="No repeat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

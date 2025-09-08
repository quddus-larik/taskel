import axios from "axios";
import * as React from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MultiSelector } from "@/components/multipleselector";

function ExploreTeamPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const [team, setTeam] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tid = params.get("tid"); // team ID

  // find all members with role = owner
  function findAdminData(arrayMembers: any[]) {
    return arrayMembers.filter((obj) => obj.role === "owner");
  }

  const fetchTeam = async (id: string) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:4000/api/teams/${id}/details`,
        { withCredentials: true }
      );
      setTeam(res.data);
      if (res.data.members) {
        setAdmins(findAdminData(res.data.members));
      }
    } catch (err) {
      console.error("Failed to fetch team:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tid) fetchTeam(tid);
  }, [tid]);

  if (!tid) return <div className="p-6 text-muted-foreground">No team ID provided</div>;

  function CreateTaskForm({ teamId, members, onTaskCreated }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedAssigned, setSelectedAssigned] = useState<string[]>([]);
    const [priority, setPriority] = useState("normal");
    const [dueDate, setDueDate] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // Convert string[] → number[]
        const assignedIds =
          selectedAssigned.length > 0
            ? selectedAssigned.map((id) => parseInt(id, 10))
            : null;

        const res = await axios.post(
          "http://localhost:4000/api/tasks",
          {
            title,
            description,
            team_id: teamId,
            assigned_to: assignedIds, 
            priority,
            due_date: dueDate || null,
          },
          { withCredentials: true }
        );

        onTaskCreated(res.data);
        setTitle("");
        setDescription("");
        setSelectedAssigned([]);
        setPriority("normal");
        setDueDate("");
      } catch (err) {
        console.error(err);
        alert("Error creating task");
      }
    };


    const memberOptions = members.map((m) => ({
      value: m.id.toString(),
      label: m.email,
    }));

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="mt-4">
            Create Task
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="grid gap-3">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g arrange files"
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Assign To */}
            <div className="grid gap-3">
              <Label>Assign To</Label>
              <MultiSelector
                options={memberOptions}
                value={selectedAssigned}
                onValueChange={setSelectedAssigned}
                placeholder="Select members (multiple)"
                searchPlaceholder="Search members..."
                emptyMessage="No member found."
              />
            </div>

            {/* Priority */}
            <div className="grid gap-3">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="grid gap-3">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full">
              Create Task
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  //Main UI
  return (
    <div className="p-6">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Separator />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <>
          <h1 className="font-bold text-2xl">{team.name}</h1>
          <p className="text-sm">{team.description}</p>
          <Separator className="my-2" />

          <h2 className="text-lg font-semibold mt-2">Admins</h2>
          <div className="flex flex-wrap gap-3">
            {admins.length > 0 ? (
              admins.map((itm) => (
                <div key={itm.id} className="flex flex-row gap-2 items-center">
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge>{itm.name}</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{itm.email}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Badge variant="outline" className="inline-block md:hidden">
                    {itm.email}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No admins found</p>
            )}
          </div>

          {/* Task Form */}
          <CreateTaskForm
            teamId={team.id}
            members={team.members || []}
            onTaskCreated={(task) => console.log("Task created:", task)}
          />
        </>
      )}
    </div>
  );
}

export default ExploreTeamPage;
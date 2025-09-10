import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
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
import { MultiSelector } from "@/components/multipleselector";


function ExploreTeamPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const [team, setTeam] = useState(null);
  const [teamData, setTeamData] = useState({});
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tasks, setTasks] = useState([]); // ✅ tasks state
  const [loadingTasks, setLoadingTasks] = useState(false);


  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");


  const tid = params.get("tid");
  const uid = params.get("uid"); // Logged-in user ID from URL

  // find all members with role = owner
  function findAdminData(arrayMembers ) {
    return arrayMembers.filter((obj) => obj.role === "owner");
  }

  const refreshData = async () => {
    if (!tid) return;
    setLoading(true);
    await fetchTeam(tid);
    await fetchTasks(tid);
    setLoading(false);
  };


  const fetchTeam = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/teams/${id}/details`,
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

  const fetchTeamdata = async (id) => {
    try{
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/teams/${id}/members/count`,{ withCredentials: true});
      setTeamData(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  } 

  const fetchTasks = async (id) => {
    try {
      setLoadingTasks(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/teams/${id}/tasks`,
        { withCredentials: true }
      );
      // Ensure each task has a 'completed' boolean derived from status for consistency
      const tasksWithCompleted = (res.data || []).map((task) => ({
        ...task,
        completed: task.status === "completed", // Derive boolean from status string
      }));
      setTasks(tasksWithCompleted);
      console.info("Fetched tasks:", tasksWithCompleted); // Improved logging for debugging
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (tid) {
      fetchTeam(tid);
      fetchTasks(tid); // ✅ load tasks
      fetchTeamdata(tid);
    }
  }, [tid]);

  if (!tid) return <div className="p-6 text-muted-foreground">No team ID provided</div>;

  function CreateTaskForm({ teamId, members, onTaskCreated }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedAssigned, setSelectedAssigned] = useState([]);
    const [priority, setPriority] = useState("normal");
    const [dueDate, setDueDate] = useState("");

   

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (title.trim() === "") {
        alert("Title is required");
        return;
      }

      try {
        // Ensure assignees are parsed as integers if backend expects numbers
        const assigneesPayload = selectedAssigned.length > 0
          ? selectedAssigned.map((id) => parseInt(id, 10)).filter(id => !isNaN(id))
          : null;

        const payload = {
          title,
          description,
          team_id: teamId,
          assignees: assigneesPayload, // Use 'assignees' as per your backend expectation
          priority,
          due_date: dueDate || null,
        };

        console.info("Creating task with payload:", payload); // Debug log

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/tasks`,
          payload,
          { withCredentials: true }
        );

        console.info("Task created response:", res.data); // Debug log

     
        const createdTask = {
          ... (res.data.task || res.data),
          completed: (res.data.task || res.data).status === "completed" || false,
        };

        onTaskCreated(createdTask);
        // Reset form
        setTitle("");
        setDescription("");
        setSelectedAssigned([]);
        setPriority("normal");
        setDueDate("");
      } catch (err) {
        console.error("Task creation error:", err.response?.data || err.message);
        alert("Error creating task: " + (err.response?.data?.error || err.message || "Unknown error"));
      }
    };

    const memberOptions = members.map((m) => ({
      value: String(m.id),
      label: m.email || m.name || `Member ${m.id}`, // Fallback label if email is missing
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
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g arrange files"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Assign To */}
            <div className="grid gap-2 ">
              <Label>Assign To (Multiple Selection)</Label>
              <MultiSelector
                options={memberOptions}
                value={selectedAssigned}
                onValueChange={setSelectedAssigned}
                placeholder="Select members (multiple)"
                searchPlaceholder="Search members..."
                emptyMessage="No member found."
              />
              {selectedAssigned.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedAssigned.length} members
                </p>
              )}
            </div>

            {/* Priority */}
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="low">Low</SelectItem> {/* Added low for completeness */}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={!title.trim()}>
              Create Task
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  const toggleTaskStatus = async (task) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tasks/${task.id}/status`,
        { completed: !task.completed },
        { withCredentials: true }
      );

      // Refetch latest data
      await refreshData();
    } catch (err) {
      console.error(err);
      alert("Failed to update task status");
    }
  };


  // Delete task (only admin can delete)
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, { withCredentials: true });
      await refreshData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete task");
    }
  };


  // Helper to check if user is admin
  const isUserAdmin = () => {
    return team?.members?.some(
      (member) => String(member.id) === uid && member.role === "owner"
    );
  };

  // Helper to check if user is assigned to task
  const isUserAssignedToTask = (taskAssignees ) => {
    return taskAssignees?.some((a) => String(a.id) === uid) || false;
  };

  // Helper to derive completed boolean for rendering (in case it's missing)
  const getCompletedStatus = (task) => {
    return !!task.completed || task.status === "completed";
  };

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
          {/* Additional skeleton for tasks */}
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <>
          <h1 className="font-bold text-2xl">{team.name}</h1>
          <p className="text-sm">{team.description}</p>
          <div className="w-full flex items-center justify-end gap-2 my-2">
            <Input
              type="text"
              placeholder="Search by task name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-60"
            />
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-2" />

          <h2 className="text-lg font-semibold mt-2">Admins</h2>
          <div className="flex flex-wrap gap-2">
            {admins.length > 0 ? (
              admins.map((itm) => (
                <div key={itm.id} className="flex flex-row gap-2 items-center">
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge>{itm.name || "Unnamed Admin"}</Badge> {/* Fallback name */}
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
          <h2 className="text-lg font-semibold mt-2">members <Badge variant={"outline"}>{teamData?.totalMembers  || 0 }</Badge></h2>
          <div className="flex flex-wrap gap-2">
            {teamData?.members?.length > 0 ? (
              teamData?.members?.map((itm) => (
                <div key={itm.id} className="flex flex-row gap-2 items-center">
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge>{itm.name || "Unnamed Admin"}</Badge> {/* Fallback name */}
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
              <p className="text-muted-foreground">No members found</p>
            )}
          </div>

          {/* Task Form */}
          {/* Only show Create Task button if user is owner */}
          {isUserAdmin() && (
            <CreateTaskForm
              teamId={team.id}
              members={team.members || []}
              onTaskCreated={(task) => {
                console.info("Adding new task to state:", task);
                setTasks((prev) => [...prev, task]);
              }}
            />
          )}


          <Separator className="my-4" />
          <h2 className="text-lg font-semibold mt-2">Tasks ({tasks.length})</h2>

          {loadingTasks ? (
            <Skeleton className="h-20 w-full" />
          ) : tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks
                .filter((t) =>
                  t.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .filter((t) =>
                  priorityFilter === "all" ? true : t.priority === priorityFilter
                )
                .sort((a, b) => {
                  const aAssigned = isUserAssignedToTask(a.assignees || []);
                  const bAssigned = isUserAssignedToTask(b.assignees || []);
                  return aAssigned === bAssigned ? 0 : aAssigned ? -1 : 1;
                })
                .map((t) => {

                  const isAdmin = isUserAdmin();
                  const isAssigned = isUserAssignedToTask(t.assignees || []);
                  const completed = getCompletedStatus(t); // Use helper for consistency

                  console.info(`Rendering task ${t.id}: Admin=${isAdmin}, Assigned=${isAssigned}, Completed=${completed}`); // Debug log per task

                  return (
                    <div key={t.id} className="border rounded p-3">
                      <h3 className="font-semibold">{t.title}</h3>
                      {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                      {t.due_date && (
                        <p className="text-xs text-muted-foreground">Due: {new Date(t.due_date).toLocaleDateString()}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {t.assignees && t.assignees.length > 0 ? (
                          t.assignees.map((a) => (
                            <Badge key={a.id} variant="secondary">
                              {a.name || a.email || `Assignee ${a.id}`}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No assignees</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2 text-xs items-center flex-wrap">
                        <Badge variant="outline">Priority: {t.priority || "normal"}</Badge>
                        <Badge variant={completed ? "default" : "outline"} className={completed ? "bg-green-100 text-green-800" : ""}>
                          Status: {completed ? "Completed" : "Pending"}
                        </Badge>
                        {(isAdmin || isAssigned) && (
                          <div className="flex gap-2 ml-auto">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleTaskStatus(t)}
                              disabled={loadingTasks} // Prevent during loading
                            >
                              {completed ? "Mark Pending" : "Mark Completed"}
                            </Button>
                            {isAdmin && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteTask(t.id)}
                                disabled={loadingTasks}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        )}
                        {!(isAdmin || isAssigned) && (
                          <span className="ml-auto text-xs text-muted-foreground">No actions available</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-muted-foreground">No tasks yet. Create one above!</p>
          )}
        </>
      )}
    </div>
  );
}

export default ExploreTeamPage;
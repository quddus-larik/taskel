import { useState, useEffect } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowUpRight, Ellipsis, PencilOff, Plus, Trash, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Link } from "react-router"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function TeamPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [teams, setTeams] = useState([])
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false) // dialog control
  const { user } = useAuth();

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const res = await axios.get("/api/teams/", {
        withCredentials: true,  // ensures session cookie is sent
      });
      setTeams(res.data);
      console.log(res.data)
    } catch (err) {
      console.error("Error fetching teams", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const res = await axios.post(
        "/api/teams/",
        { name, description },
        { withCredentials: true }
      );


      setMessage(`Team "${res.data.name}" created successfully!`)
      setTeams((prev) => [...prev, res.data])
      setName("")
      setDescription("")
      setOpen(false) // close modal on success
    } catch (err) {
      console.error(err)
      setMessage(err.response?.data?.error || "Error creating team.")
    } finally {
      setLoading(false)
    }
  }

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase())
  )

  function EditTeamForm({ team, setTeams }) {
    const [editName, setEditName] = useState(team.name)
    const [editDescription, setEditDescription] = useState(team.description)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      try {
        const res = await axios.put(
          `/api/teams/update/${team.id}`,
          { name: editName, description: editDescription },
          { withCredentials: true }
        )
        setTeams((prev) =>
          prev.map((t) => (t.id === team.id ? res.data : t))
        )
      } catch (err) {
        console.error("Update failed", err)
        alert(err.response?.data?.error || "Error updating team")
      } finally {
        setLoading(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <Label>Name</Label>
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
        </div>

        <div className="grid gap-3">
          <Label>Description</Label>
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </form>
    )
  }

  function AddMemberForm({ teamId, ownerId }) {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handleAdd = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {



        const { data: user } = await axios.get(
          `/api/users/email/${email}?team_id=${teamId}&owner_id=${ownerId}`,
          { withCredentials: true }
        );

        if (!user || !user.id) {
          alert("User not found. They must sign up first.");
          setLoading(false);
          return;
        }

        // 2️⃣ Add member using userId
        await axios.post(
          `/api/teams/${teamId}/members`,
          { email: user.email, role: "member" },
          { withCredentials: true }
        );

        alert(`User ${email} added to the team successfully!`);
        setEmail(""); // clear input
      } catch (err) {
        console.error("Add member failed", err);
        alert(err.response?.data?.error || "Error adding member");
      } finally {
        setLoading(false);
      }
    };


    return (
      <form onSubmit={handleAdd} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
          />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </form>
    )
  }




  return (
    <div className="space-y-8">
      {/* Create Team + Search Bar */}
      <div className="w-full flex items-center gap-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4" />Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Create a new team</DialogTitle>
                <DialogDescription>
                  Make a team and manage easily
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="name">Team Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g Thumbs"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Team description"
                  />
                </div>
              </div>
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create it"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Push input to right */}
        <div className="flex-1" />

        {/* Search */}
        <Input
          type="text"
          placeholder="Search teams..."
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className="border rounded-lg p-4 flex flex-col gap-2 shadow-sm"
          >
            <div className="w-full flex flex-row gap-2 justify-between items-center">
              <p className="font-semibold">{team.name}</p>
              <div className="flex gap-2">
                {user?.id === team.owner_id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button size="icon" variant={"outline"}><Ellipsis /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent className="w-1/2">
                      <DropdownMenuLabel>Manage</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full"><Users/> Add members</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <AddMemberForm teamId={team.id} ownerId={team.owner_id} />
                          </DialogContent>
                        </Dialog>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full"><PencilOff />Edit team info</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <EditTeamForm team={team} setTeams={setTeams} />
                          </DialogContent>
                        </Dialog>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full"><Trash className="text-red-400" />Delete this team</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Team</DialogTitle>
                            </DialogHeader>
                            <div>
                              Are you sure about deletion of this team?
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                className="text-red-500"
                                onClick={async () => {
                                  try {
                                    await axios.delete(`/api/teams/delete/${team.id}`, {
                                      data: { email: user?.email },
                                      withCredentials: true,
                                    });
                                    setTeams((prev) => prev.filter((t) => t.id !== team.id));
                                  } catch (err) {
                                    console.error("Delete failed", err);
                                    alert(err.response?.data?.error || "Error deleting team");
                                  }
                                }}
                              >
                                Delete it
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}



                <Link to={`/teams/explore-team?tid=${team.id}&uid=${user?.id}`}>
                  <Button
                    size={"icon"}
                    variant={"outline"}
                  ><ArrowUpRight className="text-blue-600" /></Button></Link>

              </div>
            </div>
            <p className="text-sm text-muted-foreground">{team.role ?? "——————"}</p>
            <p className="text-xs">{team.description}</p>
          </div>
        ))}
      </div>

    </div>
  )
}

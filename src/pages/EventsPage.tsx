import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getEvents, addEvent, deleteEvent, toggleEventRegistration, eventSchema, HealthEvent } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trash2, Plus, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", date: "", location: "" });

  useEffect(() => { setEvents(getEvents()); }, []);

  if (!user) return null;
  const isMod = user.role === "moderator";

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = eventSchema.parse(form);
      addEvent(data, user.id);
      setEvents(getEvents());
      setForm({ title: "", description: "", date: "", location: "" });
      setOpen(false);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Validation error");
    }
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    setEvents(getEvents());
  };

  const handleToggle = (id: string) => {
    toggleEventRegistration(id, user.id);
    setEvents(getEvents());
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Health Events</h1>
        {isMod && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Create Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Event</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the event" />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Event location" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full">Create Event</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {events.length === 0 && <p className="text-center text-muted-foreground py-12">No events yet.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((ev) => {
          const registered = ev.registeredUsers.includes(user.id);
          return (
            <Card key={ev.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{ev.title}</CardTitle>
                  {isMod && (
                    <button onClick={() => handleDelete(ev.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">{ev.description}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {ev.date ? new Date(ev.date).toLocaleString() : "TBD"}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {ev.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {ev.registeredUsers.length} registered
                </div>
                <Button
                  variant={registered ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                  onClick={() => handleToggle(ev.id)}
                >
                  {registered ? "Unregister" : "Register"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

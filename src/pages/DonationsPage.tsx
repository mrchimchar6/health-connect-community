import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDonationCamps, addDonationCamp, deleteDonationCamp, toggleCampRegistration, donationCampSchema, DonationCamp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Trash2, Plus, Users, Droplets } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function DonationsPage() {
  const { user } = useAuth();
  const [camps, setCamps] = useState<DonationCamp[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", date: "", location: "", type: "" });

  useEffect(() => { setCamps(getDonationCamps()); }, []);

  if (!user) return null;
  const isMod = user.role === "moderator";

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = donationCampSchema.parse(form);
      addDonationCamp(data, user.id);
      setCamps(getDonationCamps());
      setForm({ title: "", description: "", date: "", location: "", type: "" });
      setOpen(false);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Validation error");
    }
  };

  const handleDelete = (id: string) => {
    deleteDonationCamp(id);
    setCamps(getDonationCamps());
  };

  const handleToggle = (id: string) => {
    toggleCampRegistration(id, user.id);
    setCamps(getDonationCamps());
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Donation Camps</h1>
        {isMod && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Create Camp</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Donation Camp</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Camp title" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the camp" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="e.g. Blood, Platelets, Medicine" />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Camp location" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full">Create Camp</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {camps.length === 0 && <p className="text-center text-muted-foreground py-12">No donation camps yet.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {camps.map((camp) => {
          const registered = camp.registeredUsers.includes(user.id);
          return (
            <Card key={camp.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{camp.title}</CardTitle>
                  {isMod && (
                    <button onClick={() => handleDelete(camp.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">{camp.description}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Droplets className="h-3.5 w-3.5" />
                  {camp.type}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {camp.date ? new Date(camp.date).toLocaleString() : "TBD"}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {camp.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {camp.registeredUsers.length} registered
                </div>
                <Button
                  variant={registered ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                  onClick={() => handleToggle(camp.id)}
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

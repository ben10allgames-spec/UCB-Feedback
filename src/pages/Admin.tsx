import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { LogOut, Download, MessageSquare, Lock } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

interface Feedback {
  id: string;
  message: string;
  created_at: string;
}

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchFeedbacks();
  }, [session]);

  const fetchFeedbacks = async () => {
    setFeedbackLoading(true);
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load feedback.");
    } else {
      setFeedbacks(data || []);
    }
    setFeedbackLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("Invalid credentials. Please try again.");
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setFeedbacks([]);
  };

  const exportCSV = () => {
    if (feedbacks.length === 0) {
      toast.error("No feedback to export.");
      return;
    }
    const header = "ID,Message,Submitted At\n";
    const rows = feedbacks
      .map(
        (f) =>
          `"${f.id}","${f.message.replace(/"/g, '""')}","${new Date(f.created_at).toLocaleString()}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded successfully.");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted px-4">
        <Card className="w-full max-w-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-9 w-9 rounded-lg object-contain" />
            <h1 className="text-lg font-bold text-foreground">Feedback Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold">
              All Feedback{" "}
              <span className="text-muted-foreground font-normal">({feedbacks.length})</span>
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={fetchFeedbacks}>
            Refresh
          </Button>
        </div>

        {feedbackLoading ? (
          <p className="text-center text-muted-foreground py-12">Loading feedback…</p>
        ) : feedbacks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No feedback submitted yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead className="w-48 text-right">Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((f, i) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {i + 1}
                    </TableCell>
                    <TableCell className="max-w-md whitespace-pre-wrap">{f.message}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(f.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Admin;

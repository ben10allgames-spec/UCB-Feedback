import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  LogOut, Download, MessageSquare, Lock, Trash2, FileSpreadsheet,
  FileText, FileDown, RefreshCw, Filter, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Session } from "@supabase/supabase-js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Feedback {
  id: string;
  message: string;
  category: string;
  department: string;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => { setSession(session); setLoading(false); }
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) fetchFeedbacks(); }, [session]);

  const fetchFeedbacks = async () => {
    setFeedbackLoading(true);
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load feedback.");
    else setFeedbacks(data || []);
    setFeedbackLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error("Invalid credentials.");
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setFeedbacks([]);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("feedback").delete().eq("id", id);
    if (error) toast.error("Failed to delete.");
    else {
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      toast.success("Feedback deleted.");
    }
  };

  const filtered = feedbacks.filter((f) => {
    const matchSearch = f.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = !filterCategory || f.category === filterCategory;
    const matchDept = !filterDepartment || f.department === filterDepartment;
    return matchSearch && matchCat && matchDept;
  });

  const categories = [...new Set(feedbacks.map((f) => f.category))];
  const departments = [...new Set(feedbacks.map((f) => f.department))];

  const exportCSV = () => {
    if (filtered.length === 0) { toast.error("No data to export."); return; }
    const header = "ID,Category,Department,Message,Submitted At\n";
    const rows = filtered.map((f) =>
      `"${f.id}","${f.category}","${f.department}","${f.message.replace(/"/g, '""')}","${new Date(f.created_at).toLocaleString()}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    saveAs(blob, `feedback_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success("CSV exported.");
  };

  const exportExcel = () => {
    if (filtered.length === 0) { toast.error("No data to export."); return; }
    const ws = XLSX.utils.json_to_sheet(filtered.map((f, i) => ({
      "#": i + 1, Category: f.category, Department: f.department,
      Message: f.message, "Submitted At": new Date(f.created_at).toLocaleString()
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Feedback");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `feedback_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Excel exported.");
  };

  const exportPDF = () => {
    if (filtered.length === 0) { toast.error("No data to export."); return; }
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Feedback Report - University Canvas of Bangladesh", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    autoTable(doc, {
      startY: 35,
      head: [["#", "Category", "Department", "Message", "Date"]],
      body: filtered.map((f, i) => [
        i + 1, f.category, f.department, f.message, new Date(f.created_at).toLocaleString()
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [27, 42, 74] },
    });
    doc.save(`feedback_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF exported.");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <RefreshCw className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[hsl(220,30%,12%)] via-[hsl(240,25%,15%)] to-[hsl(200,30%,10%)]" />
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-accent/20 blur-[120px]" />
        </div>
        <motion.div
          className="w-full max-w-sm glass-strong rounded-2xl p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to manage feedback</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="glass bg-white/5 border-white/10" />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="glass bg-white/5 border-white/10" />
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90" disabled={loginLoading}>
              {loginLoading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[hsl(220,30%,12%)] via-[hsl(240,25%,15%)] to-[hsl(200,30%,10%)]" />
        <div className="absolute top-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] rounded-full bg-accent/10 blur-[80px]" />
      </div>

      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-9 w-9 rounded-lg object-contain" />
            <h1 className="text-lg font-bold text-foreground">Feedback Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: feedbacks.length, color: "text-primary" },
            { label: "Categories", value: categories.length, color: "text-accent" },
            { label: "Departments", value: departments.length, color: "text-[hsl(160,80%,50%)]" },
            { label: "This week", value: feedbacks.filter((f) => new Date(f.created_at) > new Date(Date.now() - 7 * 86400000)).length, color: "text-[hsl(40,90%,60%)]" },
          ].map((stat) => (
            <motion.div key={stat.label} className="glass rounded-xl p-4 text-center" whileHover={{ scale: 1.02 }}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="glass rounded-xl p-4 mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search feedback..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 glass bg-white/5 border-white/10" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                className="glass bg-white/5 rounded-lg px-3 py-2 text-sm text-foreground border-white/10 focus:outline-none">
                <option value="" className="bg-[hsl(220,30%,16%)]">All Categories</option>
                {categories.map((c) => <option key={c} value={c} className="bg-[hsl(220,30%,16%)]">{c}</option>)}
              </select>
              <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}
                className="glass bg-white/5 rounded-lg px-3 py-2 text-sm text-foreground border-white/10 focus:outline-none">
                <option value="" className="bg-[hsl(220,30%,16%)]">All Departments</option>
                {departments.map((d) => <option key={d} value={d} className="bg-[hsl(220,30%,16%)]">{d}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchFeedbacks} className="gap-2 glass border-white/10 hover:bg-white/10">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
            <div className="h-5 w-px bg-white/10" />
            <span className="text-xs text-muted-foreground mr-1"><Download className="h-3.5 w-3.5 inline" /> Export:</span>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 glass border-white/10 hover:bg-white/10">
              <FileText className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportExcel} className="gap-1.5 glass border-white/10 hover:bg-white/10">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={exportPDF} className="gap-1.5 glass border-white/10 hover:bg-white/10">
              <FileDown className="h-3.5 w-3.5" /> PDF
            </Button>
            <div className="ml-auto text-xs text-muted-foreground">
              Showing {filtered.length} of {feedbacks.length}
            </div>
          </div>
        </div>

        {/* Feedback List */}
        {feedbackLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <RefreshCw className="h-8 w-8 text-primary" />
            </motion.div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-xl py-16 text-center">
            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">No feedback found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((f, i) => (
                <motion.div
                  key={f.id}
                  className="glass rounded-xl p-4 group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/20 text-primary">
                          {f.category}
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent/20 text-accent">
                          {f.department}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(f.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {f.message}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(f.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 mt-8">
        <div className="container mx-auto px-4 text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} University Canvas of Bangladesh
          </p>
          <p className="text-xs text-muted-foreground">
            Developed by{" "}
            <a href="https://nishanportfolio.analyzeai.online/" target="_blank" rel="noopener noreferrer"
              className="text-primary hover:underline font-medium">Nishan Rahman</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Admin;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Send, MessageSquareText } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please write your feedback before submitting.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase
      .from("feedback")
      .insert({ message: message.trim() });

    if (error) {
      toast.error("Something went wrong. Please try again.");
    } else {
      toast.success("Thank you! Your feedback has been submitted anonymously.");
      setMessage("");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[hsl(220,30%,12%)] via-[hsl(240,25%,15%)] to-[hsl(200,30%,10%)]" />
        <motion.div
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/15 blur-[120px]"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/15 blur-[120px]"
          animate={{ scale: [1, 1.3, 1], x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-[hsl(160,80%,40%)]/10 blur-[100px]"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero */}
      <section className="relative py-16 md:py-24">
        <div className="container relative mx-auto max-w-3xl px-4 text-center">
          <motion.img
            src="/logo.png"
            alt="University Canvas of Bangladesh - Anonymous Feedback Platform"
            className="mx-auto mb-6 h-28 w-28 rounded-2xl object-contain bg-white/[0.15] p-2 shadow-lg backdrop-blur-sm border border-white/[0.2]"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          />
          <motion.h1
            className="text-3xl font-extrabold tracking-tight text-foreground md:text-5xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            University Canvas of{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Bangladesh
            </span>
          </motion.h1>
          <motion.p
            className="mt-4 text-lg text-muted-foreground md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Your voice matters. Share your honest thoughts and help us grow — completely anonymous.
          </motion.p>
        </div>
      </section>

      {/* Feedback Form */}
      <section className="flex-1 pb-12 md:pb-20">
        <div className="container mx-auto max-w-xl px-4">
          <motion.div
            className="glass-strong rounded-2xl p-6 md:p-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <MessageSquareText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Share Your Feedback</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Textarea
                placeholder="Write your feedback here… What can we do better? Any suggestions?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="resize-none text-base bg-white/[0.08] backdrop-blur-xl border-white/[0.2] focus:ring-primary/50 focus:border-white/[0.35] placeholder:text-white/40"
              />

              <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Your feedback is <span className="font-semibold text-foreground">100% anonymous</span>. No personal information is collected.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Submitting…" : "Submit Feedback"}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="container mx-auto px-4 text-center space-y-1">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} University Canvas of Bangladesh. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Developed by{" "}
            <a
              href="https://nishanportfolio.analyzeai.online/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Nishan Rahman
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

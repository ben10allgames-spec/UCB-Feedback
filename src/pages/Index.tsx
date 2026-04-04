import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Send, MessageSquareText } from "lucide-react";

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
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent" />
          <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-accent/60" />
        </div>

        <div className="container relative mx-auto max-w-3xl px-4 text-center">
          <img
            src="/logo.png"
            alt="University Canvas of Bangladesh"
            className="mx-auto mb-6 h-28 w-28 rounded-2xl object-contain bg-white/10 p-2 shadow-lg"
          />
          <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground md:text-5xl">
            University Canvas of Bangladesh
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/80 md:text-xl">
            Your voice matters. Share your honest thoughts and help us grow — completely anonymous.
          </p>
        </div>
      </section>

      {/* Feedback Form */}
      <section className="flex-1 py-12 md:py-20">
        <div className="container mx-auto max-w-xl px-4">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <MessageSquareText className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Share Your Feedback</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Textarea
                  placeholder="Write your feedback here… What can we do better? Any suggestions?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="resize-none text-base"
                />

                <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
                  <p className="text-sm text-muted-foreground">
                    Your feedback is <span className="font-semibold text-foreground">100% anonymous</span>. No personal information is collected.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-semibold"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Submitting…" : "Submit Feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} University Canvas of Bangladesh. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

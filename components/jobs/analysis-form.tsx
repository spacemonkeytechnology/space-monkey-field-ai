"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Camera, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase-browser";

export function AnalysisForm() {
  const [description, setDescription] = useState("");
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Upload a job-site image before submitting.");
      return;
    }

    setLoading(true);
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    if (!token) {
      setError("Your session expired. Please sign in again.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("question", question);
    formData.append("image", file);

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Analysis failed. Try again with a clearer image.");
      return;
    }

    router.push(`/jobs/${data.jobId}`);
    router.refresh();
  }

  return (
    <Card className="p-5">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
            <Camera className="h-4 w-4 text-field" />
            Job-site photo
          </label>
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            required
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="pt-2 file:mr-3 file:rounded-md file:border-0 file:bg-field file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-cockpit"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Issue description</label>
          <Textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Example: Rooftop unit is short cycling after a storm. Customer reports burning smell near disconnect."
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Question for AI</label>
          <Input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Example: What safe checks should I perform before escalating?"
          />
        </div>
        <div className="flex items-start gap-2 rounded-md border border-hazard/30 bg-hazard/10 p-3 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-hazard" />
          AI image analysis is not a replacement for professional inspection. High-risk electrical, gas, chemical, or structural issues require licensed professionals.
        </div>
        {error ? <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-red-100">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {loading ? "Analyzing job..." : "Run field analysis"}
        </Button>
      </form>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("Check your email to confirm your account, then sign in.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center gap-2 rounded-md border border-field/20 bg-field/10 px-3 py-2 text-sm text-slate-200">
        <ShieldCheck className="h-4 w-4 text-field" />
        Secure technician workspace
      </div>
      <div>
        <label className="mb-2 block text-sm text-slate-300">Email</label>
        <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>
      <div>
        <label className="mb-2 block text-sm text-slate-300">Password</label>
        <Input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} />
      </div>
      {message ? <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-red-100">{message}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Working..." : mode === "login" ? "Log in" : "Create account"}
      </Button>
      <button
        type="button"
        className="w-full text-sm text-slate-300 hover:text-white"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
      >
        {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
      </button>
    </form>
  );
}

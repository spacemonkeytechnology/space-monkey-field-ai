import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function LoginPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-cockpit px-4">
      <Card className="w-full max-w-md p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-field">Space Monkey Field AI</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Technician access</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Sign in to run job-site image analysis, save reports, and review field history.
        </p>
        <div className="mt-6">
          <AuthForm />
        </div>
      </Card>
    </main>
  );
}

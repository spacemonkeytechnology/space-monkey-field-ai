import { redirect } from "next/navigation";
import { AnalysisForm } from "@/components/jobs/analysis-form";
import { AppShell } from "@/components/layout/app-shell";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function NewJobPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-field">New job analysis</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Upload field evidence</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Add a clear image and brief field notes. The report will call out uncertainty and safety limits.
          </p>
        </div>
        <AnalysisForm />
      </div>
    </AppShell>
  );
}

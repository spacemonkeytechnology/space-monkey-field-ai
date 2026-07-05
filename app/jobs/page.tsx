import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { formatDate } from "@/lib/utils";
import type { JobRecord } from "@/lib/types";

export default async function JobsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-field">Job history</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Saved field reports</h1>
        </div>
        {error ? (
          <Card className="border-warning/30 bg-warning/10 p-5 text-sm text-red-100">{error.message}</Card>
        ) : null}
        <div className="grid gap-3">
          {((jobs ?? []) as JobRecord[]).map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="p-4 transition hover:bg-white/[0.05]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-white">{job.analysis?.equipmentType || "Field report"}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-400">{job.description}</p>
                  </div>
                  <p className="text-sm text-slate-500">{formatDate(job.created_at)}</p>
                </div>
              </Card>
            </Link>
          ))}
          {jobs?.length === 0 ? <Card className="p-8 text-center text-slate-400">No job reports have been saved yet.</Card> : null}
        </div>
      </div>
    </AppShell>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, Plus, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { formatDate } from "@/lib/utils";
import type { JobRecord } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const recentJobs = (jobs ?? []) as JobRecord[];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-field">Technician dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Field analysis workspace</h1>
            <p className="mt-2 max-w-2xl text-slate-400">Run cautious AI review from a job-site photo and save clean reports for every visit.</p>
          </div>
          <Link href="/jobs/new">
            <Button>
              <Plus className="h-4 w-4" />
              New analysis
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm text-slate-400">Saved jobs</p>
            <p className="mt-2 text-3xl font-semibold text-white">{recentJobs.length}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-slate-400">Safety mode</p>
            <p className="mt-2 text-lg font-semibold text-field">Always on</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-slate-400">Report format</p>
            <p className="mt-2 text-lg font-semibold text-white">Customer-ready</p>
          </Card>
        </div>

        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent jobs</h2>
            <Link href="/jobs" className="text-sm text-field hover:text-field/80">View all</Link>
          </div>
          {recentJobs.length ? (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06]">
                  <div>
                    <p className="font-medium text-white">{job.analysis?.equipmentType || "Field report"}</p>
                    <p className="mt-1 line-clamp-1 text-sm text-slate-400">{job.description}</p>
                  </div>
                  <p className="hidden text-sm text-slate-500 sm:block">{formatDate(job.created_at)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-white/15 p-8 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-slate-500" />
              <p className="mt-3 text-slate-300">No reports yet. Start with a job-site photo.</p>
            </div>
          )}
        </Card>

        <Card className="flex gap-3 border-hazard/25 bg-hazard/10 p-5 text-amber-100">
          <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-hazard" />
          <p className="text-sm leading-6">AI results are decision support only. Image analysis is not a replacement for professional inspection or licensed trade work.</p>
        </Card>
      </div>
    </AppShell>
  );
}

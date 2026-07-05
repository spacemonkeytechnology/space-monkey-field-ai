import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ReportDetail } from "@/components/jobs/report-detail";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { JobRecord } from "@/lib/types";

export default async function JobReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .single();

  if (!job) {
    notFound();
  }

  return (
    <AppShell>
      <ReportDetail job={job as JobRecord} />
    </AppShell>
  );
}

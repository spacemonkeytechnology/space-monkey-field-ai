import Link from "next/link";
import { ClipboardList, Gauge, PlusCircle } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cockpit">
      <TopNav />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="space-y-1 rounded-lg border border-white/10 bg-white/[0.03] p-2">
            <Link className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/10" href="/dashboard">
              <Gauge className="h-4 w-4 text-field" />
              Dashboard
            </Link>
            <Link className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/10" href="/jobs/new">
              <PlusCircle className="h-4 w-4 text-field" />
              New job
            </Link>
            <Link className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/10" href="/jobs">
              <ClipboardList className="h-4 w-4 text-field" />
              Job history
            </Link>
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}

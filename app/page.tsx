import Link from "next/link";
import { ArrowRight, ClipboardCheck, ScanLine, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-cockpit text-white">
      <section className="grid-field relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(23,195,178,0.18),transparent_28%),linear-gradient(180deg,rgba(7,11,17,0.55),#070b11)]" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6">
          <nav className="flex items-center justify-between">
            <div className="text-lg font-semibold">Space Monkey Field AI</div>
            <Link href="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          </nav>
          <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1fr_460px]">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-field">AI-assisted field reports</p>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-normal text-white sm:text-6xl lg:text-7xl">
                Space Monkey Field AI
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Upload a job-site photo, add field notes, and generate a cautious equipment analysis with a clean service report your team can use before escalation.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/login">
                  <Button className="w-full sm:w-auto">
                    Start analyzing
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/jobs/new">
                  <Button variant="secondary" className="w-full sm:w-auto">Open dashboard</Button>
                </Link>
              </div>
            </div>
            <Card className="border-field/20 bg-black/35 p-5">
              <div className="rounded-md border border-white/10 bg-cockpit p-4">
                <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
                  <span>Live report preview</span>
                  <span className="text-field">SAFE MODE</span>
                </div>
                <div className="space-y-3">
                  {[
                    ["Equipment", "Commercial rooftop HVAC unit, medium confidence"],
                    ["Issue flags", "Visible corrosion, panel staining, blocked intake area"],
                    ["Next step", "Document conditions and escalate energized checks to licensed staff"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                      <p className="mt-1 text-sm text-slate-100">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-16 sm:px-6 md:grid-cols-3">
        {[
          [ScanLine, "Image-aware analysis", "Identify likely systems, visible components, possible issues, and uncertainty from a single field photo."],
          [ShieldAlert, "Safety-first output", "Avoids dangerous procedural guidance and pushes high-risk issues to licensed professionals."],
          [ClipboardCheck, "Report-ready notes", "Turns technical observations into a customer-friendly service report that can be copied instantly."],
        ].map(([Icon, title, copy]) => (
          <Card key={String(title)} className="p-5">
            <Icon className="h-6 w-6 text-field" />
            <h2 className="mt-5 text-lg font-semibold">{String(title)}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{String(copy)}</p>
          </Card>
        ))}
      </section>
    </main>
  );
}

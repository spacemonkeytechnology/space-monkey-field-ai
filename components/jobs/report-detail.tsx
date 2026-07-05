"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Clipboard, Copy, ShieldAlert } from "lucide-react";
import type { JobRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-slate-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-field" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ReportDetail({ job }: { job: JobRecord }) {
  const [copied, setCopied] = useState(false);
  const analysis = job.analysis;

  async function copyReport() {
    await navigator.clipboard.writeText(analysis.customerReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-field">{formatDate(job.created_at)}</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Field report</h1>
          <p className="mt-2 max-w-2xl text-slate-400">{job.description}</p>
        </div>
        <Button onClick={copyReport} variant="secondary">
          {copied ? <Clipboard className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy report"}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          {job.image_url ? (
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image src={job.image_url} alt="Job-site upload" fill className="object-cover" />
              </div>
            </Card>
          ) : null}
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-white">System read</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm text-slate-400">Likely equipment</dt>
                <dd className="mt-1 text-white">{analysis.equipmentType}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-400">Confidence</dt>
                <dd className="mt-1 capitalize text-white">{analysis.confidence}</dd>
              </div>
              {job.question ? (
                <div>
                  <dt className="text-sm text-slate-400">Technician question</dt>
                  <dd className="mt-1 text-white">{job.question}</dd>
                </div>
              ) : null}
            </dl>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="grid gap-6 p-5 md:grid-cols-2">
            <ListBlock title="Visible components" items={analysis.visibleComponents} />
            <ListBlock title="Possible issues" items={analysis.possibleIssues} />
            <ListBlock title="Safe checklist" items={analysis.safeTroubleshootingChecklist} />
            <ListBlock title="Questions to ask" items={analysis.technicianQuestions} />
            <ListBlock title="Recommended next steps" items={analysis.recommendedNextSteps} />
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-hazard">
                <ShieldAlert className="h-4 w-4" />
                Safety warnings
              </h3>
              <ul className="space-y-2">
                {analysis.safetyWarnings.map((item) => (
                  <li key={item} className="text-sm text-amber-100">{item}</li>
                ))}
              </ul>
            </section>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-white">Customer-friendly service report</h2>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-200">{analysis.customerReport}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Plus, RadioTower } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";

export function TopNav() {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-cockpit/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-3 font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-field/40 bg-field/10">
            <RadioTower className="h-5 w-5 text-field" />
          </span>
          <span>Space Monkey Field AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/jobs/new">
            <Button className="hidden sm:inline-flex">
              <Plus className="h-4 w-4" />
              New analysis
            </Button>
          </Link>
          <Button variant="ghost" aria-label="Sign out" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

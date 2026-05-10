"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ToolAuditCard, ToolAuditResultDto } from "@/components/ToolAuditCard";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Send,
  ExternalLink,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

interface AuditResponse {
  auditId: string;
  tools: ToolAuditResultDto[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  showCredex: boolean;
  summary: string;
}

function getSeverityOrder(tool: ToolAuditResultDto): number {
  if (tool.monthlySavings > 50) return 0; // overspending
  if (tool.monthlySavings > 0) return 1;  // optimize
  return 2;                                // optimal
}

export default function AuditResultClient({ id }: { id: string }) {
  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lead capture state
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadRole, setLeadRole] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  // Copy link state
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchAudit() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
        const response = await fetch(`${apiUrl}/audit/${id}`);
        if (!response.ok) {
          throw new Error(response.status === 404 ? "Audit not found" : "Failed to load audit");
        }
        const data = await response.json();
        setAudit(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchAudit();
  }, [id]);

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/audit/${id}` : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.querySelector<HTMLInputElement>("#share-url-input");
      if (input) { input.select(); document.execCommand("copy"); }
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail || !audit) return;
    setLeadSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      await fetch(`${apiUrl}/leads/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId: audit.auditId,
          email: leadEmail,
          companyName: leadCompany || null,
          role: leadRole || null,
          website: honeypot || null,
        }),
      });
      setLeadSubmitted(true);
    } catch {
      // Silently fail — not critical
      setLeadSubmitted(true);
    } finally {
      setLeadSubmitting(false);
    }
  };

  const tweetText = audit
    ? `Just audited our AI tool spend with @SpendLens — found $${Math.round(audit.totalMonthlySavings)}/mo in savings in 60 seconds. Free tool: ${publicUrl}`
    : "";

  // --- Loading & Error states ---
  if (loading) return <LoadingSkeleton />;

  if (error || !audit) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 animate-in fade-in duration-500">
          <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-3xl font-bold">Audit Not Found</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {error || "We couldn't find this audit. It may have expired or the link might be incorrect."}
          </p>
          <Link href="/audit">
            <Button size="lg" className="rounded-full px-8">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Run a New Audit
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const isHighSavings = audit.totalMonthlySavings > 500;
  const isOptimal = audit.totalMonthlySavings === 0;

  // Sort tools: overspending → can optimize → optimal
  const sortedTools = [...audit.tools].sort(
    (a, b) => getSeverityOrder(a) - getSeverityOrder(b)
  );

  return (
    <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* ====== HEADER ====== */}
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
          <Link href="/audit">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Audit Report</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Your AI Spend Audit</h1>
          </div>
        </div>

        {/* ====== 1. HERO SECTION ====== */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {isOptimal ? (
            <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-600/10">
              <CardContent className="p-10 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-blue-500 mb-2">You&apos;re Already Spending Optimally</h2>
                <p className="text-muted-foreground text-lg">Nice work. Your AI stack is well-calibrated for your team size.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 group hover:border-emerald-500/40 transition-colors">
                <div className="absolute top-4 right-4 p-2 rounded-full bg-emerald-500/10">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <CardContent className="p-8">
                  <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">Monthly Savings</p>
                  <p className="text-5xl sm:text-6xl font-extrabold text-emerald-500 tabular-nums">
                    ${audit.totalMonthlySavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">per month potential savings</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 group hover:border-emerald-500/40 transition-colors">
                <div className="absolute top-4 right-4 p-2 rounded-full bg-emerald-500/10">
                  <TrendingDown className="w-5 h-5 text-emerald-500" />
                </div>
                <CardContent className="p-8">
                  <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">Annual Savings</p>
                  <p className="text-5xl sm:text-6xl font-extrabold text-emerald-500 tabular-nums">
                    ${audit.totalAnnualSavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">projected annual savings</p>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {/* ====== 2. AI SUMMARY SECTION ====== */}
        {audit.summary && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <h2 className="text-2xl font-bold tracking-tight mb-4">What This Means For You</h2>
            <Card className="relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-indigo-600" />
              <CardContent className="p-8 pl-10">
                <blockquote className="text-lg leading-relaxed text-foreground/90 italic">
                  &ldquo;{audit.summary}&rdquo;
                </blockquote>
                <div className="flex items-center gap-2 mt-5 text-xs text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  <span className="font-medium bg-violet-500/10 text-violet-600 px-2.5 py-0.5 rounded-full">
                    Generated by Claude
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* ====== 3. PER-TOOL BREAKDOWN ====== */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Tool-by-Tool Breakdown</h2>
          <div className="space-y-4">
            {sortedTools.map((tool, index) => (
              <div key={tool.toolId} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                <ToolAuditCard tool={tool} />
              </div>
            ))}

            {sortedTools.length === 0 && (
              <Card>
                <CardContent className="p-8 flex items-center gap-3 text-muted-foreground justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                  Your stack looks optimized. We didn&apos;t find any immediate savings.
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* ====== 4. CREDEX CTA ====== */}
        {audit.showCredex && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500">
              <Card className="rounded-[14px] border-0">
                <CardContent className="p-10 text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mb-5">
                    <Sparkles className="w-7 h-7 text-violet-500" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3">Save Even More With Discounted AI Credits</h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
                    Credex sources discounted AI infrastructure credits from companies that overforecast. 
                    Our clients typically save an additional 20-40% on top of plan optimization.
                  </p>
                  <a href="https://credex.co/consultation" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="rounded-full px-10 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                      Book a Free Consultation
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* ====== 5. LEAD CAPTURE ====== */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent h-1" />
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">
                {isHighSavings
                  ? "Get This Report In Your Inbox"
                  : isOptimal
                    ? "Get Notified When New Optimizations Apply"
                    : "Get Notified When New Optimizations Apply to Your Stack"}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {isHighSavings
                  ? "We'll also reach out about Credex credits that could save you even more."
                  : "We'll email you when new savings apply to tools in your stack."}
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              {leadSubmitted ? (
                <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-xl font-semibold text-emerald-500">✓ Sent! Check your inbox.</p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="max-w-md mx-auto space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="lead-email">Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="lead-email"
                      type="email"
                      required
                      placeholder="you@company.com"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="lead-company">Company</Label>
                      <Input
                        id="lead-company"
                        type="text"
                        placeholder="Acme Inc."
                        value={leadCompany}
                        onChange={(e) => setLeadCompany(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lead-role">Role</Label>
                      <Input
                        id="lead-role"
                        type="text"
                        placeholder="Engineering Lead"
                        value={leadRole}
                        onChange={(e) => setLeadRole(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Honeypot — invisible to humans, visible to bots */}
                  <div
                    style={{ position: "absolute", opacity: 0, height: 0, overflow: "hidden" }}
                    aria-hidden="true"
                  >
                    <label htmlFor="website">Website</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={leadSubmitting}
                    className="w-full rounded-full h-11"
                  >
                    {leadSubmitting ? "Sending..." : (
                      <>
                        <Send className="mr-2 w-4 h-4" />
                        {isHighSavings ? "Send Me This Report" : "Keep Me Updated"}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ====== 6. SHARE SECTION ====== */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1000">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Share Your Audit</h2>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-3">
                <Input
                  id="share-url-input"
                  readOnly
                  value={publicUrl}
                  className="font-mono text-sm bg-muted/50"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0 min-w-[110px]"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 w-4 h-4 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
              <div className="flex gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button variant="outline" className="gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on X
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Spacer */}
        <div className="h-12" />

      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ToolAuditResultDto {
  toolId: string;
  currentPlan: string;
  recommendedPlan: string;
  monthlySavings: number;
  annualSavings: number;
  alternatives: string[];
  reason: string;
}

interface AuditResponse {
  auditId: string;
  tools: ToolAuditResultDto[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  showCredex: boolean;
  summary: string;
}

export default function AuditResultPage() {
  const params = useParams();
  const id = params.id as string;
  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAudit() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
        const response = await fetch(`${apiUrl}/audit/${id}`);
        if (!response.ok) {
          throw new Error("Audit not found");
        }
        const data = await response.json();
        setAudit(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit");
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchAudit();
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading your results...</div>;
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Oops!</h1>
        <p className="text-muted-foreground mb-6">{error || "Audit not found"}</p>
        <Link href="/audit">
          <Button>Go back</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex items-center gap-4">
          <Link href="/audit">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Audit Results</h1>
            <p className="text-muted-foreground">ID: {audit.auditId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Monthly Savings</p>
              <p className="text-5xl font-extrabold text-primary">${audit.totalMonthlySavings.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Annual Savings</p>
              <p className="text-5xl font-extrabold text-primary">${audit.totalAnnualSavings.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {audit.summary && (
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{audit.summary}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Tool Breakdown</h2>
          <div className="space-y-4">
            {audit.tools.map((tool, index) => (
              <Card key={index} className="overflow-hidden shadow-sm">
                <CardContent className="p-6 flex flex-col sm:flex-row gap-6 justify-between sm:items-center">
                  <div>
                    <h3 className="text-lg font-semibold capitalize mb-1">{tool.toolId.replace(/_/g, ' ')}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <span>Current: {tool.currentPlan}</span>
                      <ArrowLeft className="w-3 h-3 rotate-180" />
                      <span className="font-medium text-foreground">Recommended: {tool.recommendedPlan}</span>
                    </div>
                    {tool.reason && <p className="text-sm">{tool.reason}</p>}
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Potential Savings</p>
                    <p className="text-2xl font-bold text-emerald-500">${tool.monthlySavings.toFixed(2)}<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {audit.tools.length === 0 && (
              <Card>
                <CardContent className="p-6 flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5" />
                  Your stack looks optimized. We didn&apos;t find any immediate savings.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {audit.showCredex && (
          <Card className="border-primary/50 bg-primary/10">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <h2 className="text-2xl font-bold">Need help optimizing?</h2>
              <p className="text-muted-foreground max-w-xl">
                We noticed you have significant potential savings. Book a consultation with Credex to help implement these changes.
              </p>
              <Button size="lg" className="mt-4">Book Consultation</Button>
            </CardContent>
          </Card>
        )}

      </div>
    </main>
  );
}

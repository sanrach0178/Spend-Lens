"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useFormPersist } from "@/lib/hooks/use-form-persist";
import { pricingData } from "@/lib/pricing-data";
import { ArrowRight, Code2, ShieldCheck, Sparkles, TerminalSquare, BrainCircuit, Bot, Zap, Code } from "lucide-react";

// Types
type ToolKey = keyof typeof pricingData;

// Validation Schema
const toolSchema = z.object({
  id: z.string(),
  enabled: z.boolean(),
  plan: z.string(),
  spend: z.number().min(0, "Spend must be 0 or more"),
  seats: z.number().min(1, "At least 1 seat required"),
});

const formSchema = z.object({
  teamSize: z.number().min(1, "Team size must be at least 1").max(500, "Max team size is 500"),
  primaryUseCase: z.enum(["Coding", "Writing", "Data Analysis", "Research", "Mixed"]),
  tools: z.record(z.string(), toolSchema),
});

type FormValues = z.infer<typeof formSchema>;

const TOOL_DETAILS: Record<ToolKey, { name: string; icon: React.ReactNode; isApi: boolean }> = {
  cursor: { name: "Cursor", icon: <TerminalSquare className="w-5 h-5 text-blue-400" />, isApi: false },
  github_copilot: { name: "GitHub Copilot", icon: <Code2 className="w-5 h-5 text-purple-400" />, isApi: false },
  claude: { name: "Claude (Anthropic)", icon: <BrainCircuit className="w-5 h-5 text-amber-400" />, isApi: false },
  chatgpt: { name: "ChatGPT (OpenAI)", icon: <Bot className="w-5 h-5 text-emerald-400" />, isApi: false },
  anthropic_api: { name: "Anthropic API Direct", icon: <Zap className="w-5 h-5 text-amber-600" />, isApi: true },
  openai_api: { name: "OpenAI API Direct", icon: <Zap className="w-5 h-5 text-emerald-600" />, isApi: true },
  gemini: { name: "Gemini", icon: <Sparkles className="w-5 h-5 text-blue-500" />, isApi: false },
  windsurf: { name: "Windsurf", icon: <Code className="w-5 h-5 text-cyan-400" />, isApi: false },
};

export default function AuditFormPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize form with defaults based on pricingData
  const defaultTools = Object.keys(pricingData).reduce((acc, key) => {
    const plans = Object.keys(pricingData[key as ToolKey]);
    const firstPlan = plans[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planDetails = (pricingData[key as ToolKey] as any)[firstPlan];
    const defaultPrice = planDetails?.price;
    
    acc[key as ToolKey] = {
      id: key,
      enabled: false,
      plan: firstPlan,
      spend: typeof defaultPrice === 'number' ? defaultPrice : 0,
      seats: 1,
    };
    return acc;
  }, {} as Record<ToolKey, z.infer<typeof toolSchema>>);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamSize: 1,
      primaryUseCase: "Coding",
      tools: defaultTools,
    },
  });

  const { clearPersistedState } = useFormPersist(form, "audit-form-state");

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Basic heuristic calculation for demonstration
      let totalMonthlySavings = 0;
      const toolResults = [];

      const enabledTools = Object.values(data.tools).filter(t => t.enabled);
      
      const hasCopilot = enabledTools.some(t => t.id === 'github_copilot');
      const hasCursorOrWindsurf = enabledTools.some(t => t.id === 'cursor' || t.id === 'windsurf');

      for (const tool of enabledTools) {
        let recommendedPlan = tool.plan;
        let savings = 0;
        let reason = "";

        if (tool.id === 'github_copilot' && hasCursorOrWindsurf) {
          savings = tool.spend * tool.seats;
          recommendedPlan = "None";
          reason = "You are already using an AI IDE (Cursor/Windsurf), making Copilot redundant.";
        } else if (tool.plan === 'pro' && data.teamSize > 5 && tool.seats > 5) {
          recommendedPlan = "team";
          reason = "Switching to a Team plan offers better admin controls and might be more cost-effective.";
        }

        totalMonthlySavings += savings;
        toolResults.push({
          toolId: tool.id,
          currentPlan: tool.plan,
          recommendedPlan,
          monthlySavings: savings,
          annualSavings: savings * 12,
          alternatives: [],
          reason
        });
      }

      const calculatedResult = {
        tools: toolResults,
        totalMonthlySavings,
        totalAnnualSavings: totalMonthlySavings * 12,
        showCredex: totalMonthlySavings > 500,
        summary: ""
      };

      const backendData = {
        tools: enabledTools.map(t => ({
          toolId: t.id,
          plan: t.plan,
          monthlySpend: t.spend * t.seats,
          seats: t.seats
        })),
        teamSize: data.teamSize,
        primaryUseCase: data.primaryUseCase,
        calculatedResult
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      const response = await fetch(`${apiUrl}/audit/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendData)
      });

      if (!response.ok) {
        throw new Error("Failed to generate audit");
      }

      const result = await response.json();
      clearPersistedState();
      router.push(`/audit/${result.auditId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Avoid hydration mismatch by not rendering the form until mounted
  if (!mounted) {
    return <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Audit Your AI Spend</h1>
          <p className="text-muted-foreground">Select the tools your team uses and enter your current spend.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Global Fields */}
          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle>Team Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="teamSize">Team Size</Label>
                <Controller
                  name="teamSize"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="teamSize"
                      type="number"
                      min={1}
                      max={500}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  )}
                />
                {form.formState.errors.teamSize && (
                  <p className="text-sm text-destructive">{form.formState.errors.teamSize.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryUseCase">Primary Use Case</Label>
                <Controller
                  name="primaryUseCase"
                  control={form.control}
                  render={({ field }) => (
                    <Select id="primaryUseCase" {...field}>
                      <option value="Coding">Coding</option>
                      <option value="Writing">Writing</option>
                      <option value="Data Analysis">Data Analysis</option>
                      <option value="Research">Research</option>
                      <option value="Mixed">Mixed</option>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">AI Tools</h2>
            
            {/* Tool Cards */}
            <div className="grid grid-cols-1 gap-4">
              {(Object.keys(pricingData) as ToolKey[]).map((toolId) => {
                const toolDetails = TOOL_DETAILS[toolId];
                const plans = Object.keys(pricingData[toolId]);
                
                return (
                  <Card key={toolId} className="overflow-hidden transition-all hover:border-border/80 shadow-sm">
                    <CardContent className="p-0">
                      <Controller
                        name={`tools.${toolId}.enabled`}
                        control={form.control}
                        render={({ field: { value: enabled, onChange: setEnabled } }) => (
                          <div className="flex flex-col sm:flex-row sm:items-center p-6 gap-6">
                            
                            {/* Header Section */}
                            <div className="flex items-center gap-4 sm:w-1/3">
                              <Switch
                                checked={enabled}
                                onCheckedChange={setEnabled}
                                aria-label={`Enable ${toolDetails.name}`}
                              />
                              <div className="flex items-center gap-2">
                                {toolDetails.icon}
                                <Label className="font-semibold text-base cursor-pointer" onClick={() => setEnabled(!enabled)}>
                                  {toolDetails.name}
                                </Label>
                              </div>
                            </div>

                            {/* Details Section (conditionally rendered or disabled) */}
                            {enabled && (
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                
                                <div className="space-y-1.5">
                                  <Label className="text-xs text-muted-foreground">Plan</Label>
                                  <Controller
                                    name={`tools.${toolId}.plan`}
                                    control={form.control}
                                    render={({ field }) => (
                                      <Select 
                                        {...field}
                                        onChange={(e) => {
                                          const newPlan = e.target.value;
                                          field.onChange(newPlan);
                                          // Auto-update price if a structured plan
                                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                          const defaultPrice = (pricingData[toolId] as any)?.[newPlan]?.price;
                                          if (typeof defaultPrice === 'number') {
                                            form.setValue(`tools.${toolId}.spend`, defaultPrice);
                                          }
                                        }}
                                      >
                                        {plans.map((p) => (
                                          <option key={p} value={p}>{p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                                        ))}
                                      </Select>
                                    )}
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <Label className="text-xs text-muted-foreground">
                                    {toolDetails.isApi ? "Est. Monthly Spend ($)" : "Monthly Spend ($)"}
                                  </Label>
                                  <Controller
                                    name={`tools.${toolId}.spend`}
                                    control={form.control}
                                    render={({ field }) => (
                                      <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    )}
                                  />
                                </div>

                                {!toolDetails.isApi && (
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Number of Seats</Label>
                                    <Controller
                                      name={`tools.${toolId}.seats`}
                                      control={form.control}
                                      render={({ field }) => (
                                        <Input
                                          type="number"
                                          min={1}
                                          {...field}
                                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                        />
                                      )}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 pt-6 pb-20">
            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto h-14 px-12 text-lg rounded-full">
              {isSubmitting ? "Running Audit..." : "Run My Audit"}
              {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
            
            <div className="flex items-center text-xs text-muted-foreground justify-center gap-1.5 mt-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Your data stays in your browser until you choose to share it.</span>
            </div>
          </div>

        </form>
      </div>
    </main>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Code2, Sparkles, TerminalSquare, BrainCircuit, Bot, Zap, Code } from "lucide-react";

export interface ToolAuditResultDto {
  toolId: string;
  currentPlan: string;
  recommendedPlan: string;
  monthlySavings: number;
  annualSavings: number;
  alternatives: string[];
  reason: string;
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  cursor: <TerminalSquare className="w-6 h-6 text-blue-400" />,
  github_copilot: <Code2 className="w-6 h-6 text-purple-400" />,
  claude: <BrainCircuit className="w-6 h-6 text-amber-400" />,
  chatgpt: <Bot className="w-6 h-6 text-emerald-400" />,
  anthropic_api: <Zap className="w-6 h-6 text-amber-600" />,
  openai_api: <Zap className="w-6 h-6 text-emerald-600" />,
  gemini: <Sparkles className="w-6 h-6 text-blue-500" />,
  windsurf: <Code className="w-6 h-6 text-cyan-400" />,
};

export function ToolAuditCard({ tool }: { tool: ToolAuditResultDto }) {
  const icon = TOOL_ICONS[tool.toolId] || <Zap className="w-6 h-6 text-muted-foreground" />;
  const formattedName = tool.toolId.replace(/_/g, ' ');

  // Determine severity based on savings
  let severity: "overspending" | "optimize" | "optimal" = "optimal";
  if (tool.monthlySavings > 50) severity = "overspending";
  else if (tool.monthlySavings > 0) severity = "optimize";

  return (
    <Card className={`overflow-hidden transition-all duration-300 shadow-sm border-l-4 ${
      severity === "overspending" ? "border-l-destructive hover:shadow-destructive/20" :
      severity === "optimize" ? "border-l-yellow-500 hover:shadow-yellow-500/20" :
      "border-l-emerald-500 hover:shadow-emerald-500/20"
    }`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between md:items-center">
          
          {/* Left: Icon and Details */}
          <div className="flex gap-4 items-start md:items-center">
            <div className="p-3 rounded-xl bg-muted/50 hidden sm:block">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold capitalize">{formattedName}</h3>
                {severity === "overspending" && <Badge variant="destructive">Overspending</Badge>}
                {severity === "optimize" && <Badge variant="outline" className="text-yellow-600 border-yellow-600/50">Can Optimize</Badge>}
                {severity === "optimal" && <Badge variant="outline" className="text-emerald-600 border-emerald-600/50 bg-emerald-500/10">Optimal</Badge>}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 mt-2">
                <span className="capitalize">{tool.currentPlan.replace(/_/g, ' ')}</span>
                <ArrowRight className="w-4 h-4" />
                <span className="font-semibold text-foreground capitalize">
                  {tool.recommendedPlan === "None" ? "Drop Tool" : tool.recommendedPlan.replace(/_/g, ' ')}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground max-w-xl">{tool.reason || "Your current setup is appropriate for your team size."}</p>
            </div>
          </div>
          
          {/* Right: Savings */}
          <div className="md:text-right shrink-0 bg-muted/30 p-4 rounded-xl border border-border/50 md:bg-transparent md:p-0 md:border-none">
            <p className="text-sm font-medium text-muted-foreground mb-1">Action Impact</p>
            {tool.monthlySavings > 0 ? (
              <div>
                <p className="text-2xl font-bold text-emerald-500">
                  +${tool.monthlySavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}<span className="text-sm font-normal text-muted-foreground">/mo saved</span>
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-500 md:justify-end">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Optimized</span>
              </div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}

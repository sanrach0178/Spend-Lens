/* eslint-disable @typescript-eslint/no-unused-vars */

export type ToolEntry = {
  toolId: string;
  plan: string;
  monthlySpend: number;
  seats: number;
};

export type AuditInput = {
  tools: ToolEntry[];
  teamSize: number;
  primaryUseCase: 'coding' | 'writing' | 'data' | 'research' | 'mixed';
};

export type ToolAuditResult = {
  toolId: string;
  currentSpend: number;
  recommendedAction: string;
  potentialSavings: number;
  reasoning: string;
  severity: 'overspending' | 'optimize' | 'optimal';
};

export type AuditResult = {
  tools: ToolAuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  showCredex: boolean;
  summary?: string;
};

export function runAudit(input: AuditInput): AuditResult {
  const { tools, teamSize, primaryUseCase } = input;
  const results: ToolAuditResult[] = [];

  const hasCursorPro = tools.some(t => t.toolId === 'cursor' && t.plan === 'pro');
  const hasCopilot = tools.some(t => t.toolId === 'github_copilot');
  const hasChatGptPlus = tools.some(t => t.toolId === 'chatgpt' && t.plan === 'plus');
  const hasClaudePro = tools.some(t => t.toolId === 'claude' && t.plan === 'pro');
  const hasWindsurf = tools.some(t => t.toolId === 'windsurf');

  const hasAnthropicApi = tools.some(t => t.toolId === 'anthropic_api');
  const hasAnthropicSub = tools.some(t => t.toolId === 'claude');
  const hasOpenAiApi = tools.some(t => t.toolId === 'openai_api');
  const hasOpenAiSub = tools.some(t => t.toolId === 'chatgpt');

  let totalMonthlySavings = 0;

  for (const tool of tools) {
    const { toolId, plan, monthlySpend, seats } = tool;
    let recommendedAction = 'Keep current setup';
    let potentialSavings = 0;
    let reasoning = 'Current plan appears optimal for your team size and use case.';
    let severity: 'overspending' | 'optimize' | 'optimal' = 'optimal';

    // 7. PLAN FIT RULES (applied to all tools first as baseline checks)
    if (seats > teamSize * 1.2) {
      severity = 'overspending';
      recommendedAction = 'Reduce seats';
      reasoning = `You're paying for more seats (${seats}) than your team size (${teamSize}). Audit your active users.`;
      // Potential savings if we cut down to teamSize
      // We need to estimate cost per seat. If monthlySpend > 0 and seats > 0
      const costPerSeat = monthlySpend / seats;
      potentialSavings = costPerSeat * (seats - teamSize);
    }

    // 1. CURSOR RULES
    if (toolId === 'cursor') {
      if (plan === 'business' && teamSize <= 3) {
        severity = 'overspending';
        recommendedAction = 'Downgrade to Pro';
        reasoning = "Downgrade to Pro — Business adds admin features you likely don't need at this team size. Save $20/seat/mo.";
        potentialSavings = 20 * seats;
      } else if (plan === 'pro' && primaryUseCase !== 'coding') {
        severity = 'optimize';
        recommendedAction = 'Consider canceling Cursor';
        reasoning = `Consider canceling Cursor — your primary use case is ${primaryUseCase}, not coding. Cursor's value is coding-specific.`;
        potentialSavings = monthlySpend;
      } else if (plan === 'hobby') {
        severity = 'optimal';
        recommendedAction = 'Keep current setup';
        reasoning = 'Hobby plan is optimal for zero cost.';
      }

      if (hasWindsurf) {
        severity = 'overspending';
        recommendedAction = 'Consolidate AI Code Editors';
        reasoning = "You're paying for both Cursor and Windsurf — definitely redundant as both are AI code editors. Consider consolidating.";
        // We'll calculate savings on Windsurf or Cursor depending on the loop. We don't want to double count easily, but we'll flag it here.
      }
    }

    // 2. GITHUB COPILOT RULES
    if (toolId === 'github_copilot') {
      if (plan === 'enterprise' && teamSize < 50) {
        severity = 'overspending';
        recommendedAction = 'Downgrade to Business';
        reasoning = "Downgrade to Business — Enterprise adds policy management for large orgs. Under 50 devs, Business covers everything.";
        potentialSavings = 20 * seats; // 39 - 19 = 20
      } else if (plan === 'business' && primaryUseCase !== 'coding') {
        severity = 'optimize';
        recommendedAction = 'Consider canceling Copilot';
        reasoning = `Copilot is coding-only. For ${primaryUseCase}, consider canceling and using Claude Pro instead at same price point.`;
        potentialSavings = monthlySpend;
      }
      
      if (hasCursorPro) {
        severity = 'overspending';
        recommendedAction = 'Cancel Copilot';
        reasoning = "You're paying for both Cursor and Copilot. Cursor subsumes Copilot for most workflows. Consider dropping Copilot.";
        potentialSavings = monthlySpend; 
      }
    }

    // 3. CLAUDE RULES
    if (toolId === 'claude') {
      if (plan === 'max' && teamSize > 1) {
        severity = 'overspending';
        recommendedAction = 'Downgrade to Team';
        reasoning = "Max is per-user. For teams, Claude Team at $30/seat is almost always better unless you're a solo power user needing 5x more usage.";
        potentialSavings = (100 - 30) * seats;
      } else if (plan === 'team' && seats < 5) {
        severity = 'optimize';
        recommendedAction = 'Verify seat count';
        reasoning = "Claude Team requires 5 minimum seats — you may be paying for unused seats. Verify your seat count matches actual users.";
        // If they have e.g. 2 seats, they are paying for 5. 5 * 30 = 150.
        // Actually, Claude bills for 5 min. 
      } else if (plan === 'pro' && hasChatGptPlus) {
        severity = 'optimize';
        recommendedAction = 'Review AI subscriptions';
        reasoning = "Claude Pro + ChatGPT Plus are likely redundant unless you have distinct workflows justifying both.";
      }
    }

    // 4. CHATGPT RULES
    if (toolId === 'chatgpt') {
      if (plan === 'team' && seats === 2) {
        severity = 'overspending';
        recommendedAction = 'Downgrade to Plus';
        reasoning = "ChatGPT Team minimum is 2 users at $30/seat = $60/mo. Two ChatGPT Plus subscriptions = $40/mo. Downgrade to Plus and save $20/mo unless you need Team features (shared workspace, admin).";
        potentialSavings = 20; // 60 - 40
      } else if (plan === 'plus' && primaryUseCase === 'coding') {
        severity = 'optimize';
        recommendedAction = 'Consider Cursor Pro';
        reasoning = "For coding, Cursor Pro ($20/mo) provides more value than ChatGPT Plus ($20/mo) — it's IDE-native with code context.";
      }
    }

    // 6. API DIRECT RULES
    if (toolId === 'anthropic_api' && hasAnthropicSub) {
      if (teamSize > 0 && monthlySpend / teamSize > 50) {
        severity = 'optimize';
        recommendedAction = 'Review API vs Subscription';
        reasoning = "You're paying both subscription and API for Anthropic. If API usage is this high, going API-only with a usage cap may be cheaper. Do the math at your token volume.";
      }
    }
    if (toolId === 'openai_api' && hasOpenAiSub) {
      if (teamSize > 0 && monthlySpend / teamSize > 50) {
        severity = 'optimize';
        recommendedAction = 'Review API vs Subscription';
        reasoning = "You're paying both subscription and API for OpenAI. If API usage is this high, going API-only with a usage cap may be cheaper. Do the math at your token volume.";
      }
    }

    // Additional generic base plan checks
    // We already did Plan Fit seats > teamSize * 1.2
    
    // Safety check on potentialSavings
    if (potentialSavings > monthlySpend) {
      potentialSavings = monthlySpend; // Cannot save more than you spend
    }

    totalMonthlySavings += potentialSavings;

    results.push({
      toolId,
      currentSpend: monthlySpend,
      recommendedAction,
      potentialSavings,
      reasoning,
      severity
    });
  }

  const totalAnnualSavings = totalMonthlySavings * 12;
  const showCredex = totalMonthlySavings > 500;

  return {
    tools: results,
    totalMonthlySavings,
    totalAnnualSavings,
    showCredex
  };
}

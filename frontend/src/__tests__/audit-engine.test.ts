import { runAudit, AuditInput, AuditResult, ToolAuditResult } from '@/lib/audit-engine';

// ─────────────────────────────────────────────────────────────────────────────
// Helper to quickly build a single-tool input
// ─────────────────────────────────────────────────────────────────────────────
function buildInput(
  tools: AuditInput['tools'],
  teamSize: number,
  primaryUseCase: AuditInput['primaryUseCase'] = 'coding'
): AuditInput {
  return { tools, teamSize, primaryUseCase };
}

function findTool(result: AuditResult, toolId: string): ToolAuditResult {
  const found = result.tools.find((t) => t.toolId === toolId);
  if (!found) throw new Error(`Tool "${toolId}" not found in audit results`);
  return found;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1: Cursor Business with small team → recommend downgrade to Pro
// ─────────────────────────────────────────────────────────────────────────────
describe('Cursor Business downgrade', () => {
  it('should recommend downgrade to Pro for a 2-person team', () => {
    const input = buildInput(
      [{ toolId: 'cursor', plan: 'business', monthlySpend: 80, seats: 2 }],
      2, // teamSize
      'coding'
    );

    const result = runAudit(input);
    const cursor = findTool(result, 'cursor');

    expect(cursor.severity).toBe('overspending');
    expect(cursor.recommendedAction).toContain('Downgrade to Pro');
    // Business → Pro saves $20/seat/mo × 2 seats = $40/mo
    expect(cursor.potentialSavings).toBe(40);
    expect(result.totalMonthlySavings).toBe(40);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2: Cursor Pro with non-coding use case → recommend cancellation
// ─────────────────────────────────────────────────────────────────────────────
describe('Cursor Pro non-coding use case', () => {
  it('should flag use-case mismatch for a writing-focused user', () => {
    const input = buildInput(
      [{ toolId: 'cursor', plan: 'pro', monthlySpend: 20, seats: 1 }],
      1,
      'writing'
    );

    const result = runAudit(input);
    const cursor = findTool(result, 'cursor');

    // The engine sets severity to 'optimize' for non-coding use case
    expect(cursor.severity).toBe('optimize');
    expect(cursor.recommendedAction.toLowerCase()).toContain('cancel');
    expect(cursor.reasoning.toLowerCase()).toContain('writing');
    expect(cursor.potentialSavings).toBe(20);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3: Copilot + Cursor together → flag redundancy
// ─────────────────────────────────────────────────────────────────────────────
describe('Copilot + Cursor redundancy', () => {
  it('should flag Copilot as redundant when Cursor Pro is present', () => {
    const input = buildInput(
      [
        { toolId: 'cursor', plan: 'pro', monthlySpend: 20, seats: 1 },
        { toolId: 'github_copilot', plan: 'individual', monthlySpend: 10, seats: 1 },
      ],
      1,
      'coding'
    );

    const result = runAudit(input);
    const copilot = findTool(result, 'github_copilot');

    // The engine flags Copilot for cancellation when Cursor Pro exists
    expect(copilot.severity).toBe('overspending');
    expect(copilot.reasoning.toLowerCase()).toContain('cursor');
    expect(copilot.reasoning.toLowerCase()).toContain('copilot');
    expect(copilot.potentialSavings).toBe(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 4: ChatGPT Team with 2 users → worse than 2× Plus
// ─────────────────────────────────────────────────────────────────────────────
describe('ChatGPT Team vs 2× Plus', () => {
  it('should recommend downgrading to Plus for exactly 2 users', () => {
    const input = buildInput(
      [{ toolId: 'chatgpt', plan: 'team', monthlySpend: 60, seats: 2 }],
      2,
      'mixed'
    );

    const result = runAudit(input);
    const chatgpt = findTool(result, 'chatgpt');

    expect(chatgpt.severity).toBe('overspending');
    expect(chatgpt.recommendedAction.toLowerCase()).toContain('plus');
    // Team 2×$30 = $60 vs Plus 2×$20 = $40 → savings = $20
    expect(chatgpt.potentialSavings).toBe(20);
    expect(chatgpt.reasoning).toContain('$60');
    expect(chatgpt.reasoning).toContain('$40');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 5: Claude Max for team → recommend Claude Team plan
// ─────────────────────────────────────────────────────────────────────────────
describe('Claude Max team downgrade', () => {
  it('should recommend Team plan for multi-person Claude Max usage', () => {
    const input = buildInput(
      [{ toolId: 'claude', plan: 'max', monthlySpend: 300, seats: 3 }],
      3,
      'coding'
    );

    const result = runAudit(input);
    const claude = findTool(result, 'claude');

    expect(claude.severity).toBe('overspending');
    expect(claude.recommendedAction.toLowerCase()).toContain('team');
    // Max is $100/seat, Team is $30/seat → savings = $70 × 3 = $210
    expect(claude.potentialSavings).toBe(210);
    expect(result.totalMonthlySavings).toBe(210);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 6: Already optimal setup → zero savings, 'optimal' status
// ─────────────────────────────────────────────────────────────────────────────
describe('Optimal setup', () => {
  it('should return zero savings when the setup is already optimal', () => {
    const input = buildInput(
      [{ toolId: 'cursor', plan: 'pro', monthlySpend: 100, seats: 5 }],
      5,
      'coding'
    );

    const result = runAudit(input);
    const cursor = findTool(result, 'cursor');

    expect(result.totalMonthlySavings).toBe(0);
    expect(cursor.severity).toBe('optimal');
    expect(cursor.potentialSavings).toBe(0);
    expect(cursor.recommendedAction).toContain('Keep current setup');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 7: showCredex is true when total savings > $500
// ─────────────────────────────────────────────────────────────────────────────
describe('showCredex high savings', () => {
  it('should be true when monthly savings exceed $500', () => {
    // Claude Max at 10 seats × $100 = $1000, team size 10 → savings = $70×10 = $700
    const input = buildInput(
      [{ toolId: 'claude', plan: 'max', monthlySpend: 1000, seats: 10 }],
      10,
      'coding'
    );

    const result = runAudit(input);

    expect(result.totalMonthlySavings).toBeGreaterThan(500);
    expect(result.showCredex).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 8: showCredex is false when total savings < $500
// ─────────────────────────────────────────────────────────────────────────────
describe('showCredex low savings', () => {
  it('should be false when monthly savings are under $500', () => {
    const input = buildInput(
      [{ toolId: 'cursor', plan: 'business', monthlySpend: 80, seats: 2 }],
      2,
      'coding'
    );

    const result = runAudit(input);

    // Only $40 savings from Cursor Business → Pro
    expect(result.totalMonthlySavings).toBeLessThan(500);
    expect(result.showCredex).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 9: Annual savings is exactly 12× monthly savings
// ─────────────────────────────────────────────────────────────────────────────
describe('Annual savings calculation', () => {
  it('should calculate annual savings as exactly 12× monthly savings', () => {
    const input = buildInput(
      [
        { toolId: 'claude', plan: 'max', monthlySpend: 300, seats: 3 },
        { toolId: 'chatgpt', plan: 'team', monthlySpend: 60, seats: 2 },
      ],
      3,
      'mixed'
    );

    const result = runAudit(input);

    expect(result.totalMonthlySavings).toBeGreaterThan(0);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 10: Seats > teamSize × 1.2 → flag over-provisioning
// ─────────────────────────────────────────────────────────────────────────────
describe('Over-provisioned seats', () => {
  it('should flag excess seats when seats significantly exceed team size', () => {
    const input = buildInput(
      [{ toolId: 'cursor', plan: 'pro', monthlySpend: 200, seats: 10 }],
      3, // teamSize = 3, seats = 10, 10 > 3 * 1.2 = 3.6
      'coding'
    );

    const result = runAudit(input);
    const cursor = findTool(result, 'cursor');

    expect(cursor.severity).toBe('overspending');
    expect(cursor.recommendedAction.toLowerCase()).toContain('reduce seats');
    expect(cursor.reasoning.toLowerCase()).toContain('seats');
    expect(cursor.reasoning.toLowerCase()).toContain('team size');
    // Over-provisioned: cost per seat = $200 / 10 = $20, excess = 10 - 3 = 7, savings = $140
    expect(cursor.potentialSavings).toBe(140);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BONUS TESTS: Additional edge-case coverage
// ─────────────────────────────────────────────────────────────────────────────
describe('Edge cases', () => {
  it('should not allow potentialSavings to exceed monthlySpend', () => {
    // Artificially low monthlySpend compared to what the rule calculates
    const input = buildInput(
      [{ toolId: 'cursor', plan: 'business', monthlySpend: 10, seats: 2 }],
      2,
      'coding'
    );

    const result = runAudit(input);
    const cursor = findTool(result, 'cursor');

    // Rule says savings = $20 × 2 = $40, but spend is only $10 → capped at $10
    expect(cursor.potentialSavings).toBeLessThanOrEqual(cursor.currentSpend);
  });

  it('should handle empty tools array gracefully', () => {
    const input = buildInput([], 5, 'coding');
    const result = runAudit(input);

    expect(result.tools).toHaveLength(0);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.totalAnnualSavings).toBe(0);
    expect(result.showCredex).toBe(false);
  });

  it('should detect Cursor + Windsurf redundancy', () => {
    const input = buildInput(
      [
        { toolId: 'cursor', plan: 'pro', monthlySpend: 20, seats: 1 },
        { toolId: 'windsurf', plan: 'pro', monthlySpend: 15, seats: 1 },
      ],
      1,
      'coding'
    );

    const result = runAudit(input);
    const cursor = findTool(result, 'cursor');

    expect(cursor.severity).toBe('overspending');
    expect(cursor.reasoning.toLowerCase()).toContain('windsurf');
    expect(cursor.reasoning.toLowerCase()).toContain('redundant');
  });
});

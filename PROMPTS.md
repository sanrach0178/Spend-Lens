# SpendLens Prompt Engineering

This document outlines the strategy and evolution of the AI prompts used to generate the audit summaries.

## Audit Summary Prompt

The following prompt is used in `GeminiService.java` to transform raw JSON audit data into a high-impact executive summary:

```text
You are a concise financial advisor for startups. Given this AI tool spend audit, 
write a 100-word personalized summary. Be specific about the dollar amounts. 
Lead with the biggest win. End with one actionable next step. 
Tone: direct, not salesy. Data: {{auditJson}}
```

### Rationale
- **Direct and Specific**: Startup founders and EMs don't have time for "I hope this finds you well." We explicitly instruct the model to "Lead with the biggest win" and "Be specific about dollar amounts."
- **Constraint-Driven**: The 100-word limit prevents the model from hallucinating unnecessary context and keeps the result page scannable.
- **Action-Oriented**: Every audit must end with a "Next step" to transition the user from "passive observer" to "active optimizer."

### What Didn't Work
- **Bullet Points**: We first tried asking for a bulleted list of savings, but the output was "too listy" and clashed with the Tool Cards already present on the results page. A paragraph feels more like an "advisor's note."
- **Generic Startup Tone**: Initially, we didn't specify "concise financial advisor." The output was too enthusiastic ("Great news! You can save money!"), which lowered trust. The "direct, not salesy" instruction fixed the professional gravity.

## Fallback Template

If the LLM call fails or times out, we use a structured template to ensure the user still receives immediate value:

```text
Based on your audit, you're spending across {{numTools}} AI tools. 
Our analysis found ${{totalSavings}}/mo in potential savings. 
Your biggest opportunity is {{topTool}}. Review the recommendations 
below and prioritize the highest-impact changes first.
```

### Rationale
The fallback is structured to mirror the LLM's logic: **Big Win → Specific Data → Actionable Advice**. It ensures zero-latency delivery of the core value proposition even during API outages.

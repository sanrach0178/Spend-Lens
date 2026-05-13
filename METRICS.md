# Core Metrics & Instrumentation

## North Star Metric
**"Audits Completed Per Week"**
*Rationale: We do not track simple pageviews or "users." A completed audit signals that the user has received the full value of the tool and provided us with the high-intent data required for our conversion funnel.*

## Input Metrics (The Funnel)

1. **Landing Page → Form Start Rate**  
   - **Target**: >40%
   - **Signal**: Does the headline "You're overpaying" resonate with the traffic source?

2. **Form Start → Audit Completion Rate**  
   - **Target**: >70%
   - **Signal**: Is the multi-step form too high-friction? Are specific tools (e.g., API tokens) causing users to drop off?

3. **Audit Completion → Email Capture Rate**  
   - **Target**: >25%
   - **Signal**: Is the "Full Report" value proposition strong enough after they've seen the basic results?

## Immediate Instrumentation Priorities
- **Field Drop-off Tracking**: Instrument event listeners on every form card. If 50% of users drop off at the "Anthropic API" card, we may need to simplify the token-to-dollar conversion or move it to an "Advanced" section.
- **Referral Tracking**: Track the `?ref=` parameter to see which communities (Reddit vs. HN vs. X) provide the highest *Completion Rate*, not just the most traffic.

## Pivot Triggers
- **Low Intent**: If the **Email Capture Rate is < 10%** after 500 audits, it means the results page is satisfying their curiosity but not providing enough value to warrant a relationship. 
  - **Action**: Reconsider the results page design—perhaps hide the "Deep Dive" recommendations behind the email gate.
- **High Traffic / Low Completion**: If LP-to-Form is high but Completion is low, the form UI is the bottleneck.
  - **Action**: Switch to a single-page "Quick Audit" mode with fewer required fields.

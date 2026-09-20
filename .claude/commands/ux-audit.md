---
name: ux-audit
description: Run an evidence-based UX audit of a web app, page, or user flow using Playwright (live UI, screenshots, accessibility tree) plus Figma and Mobbin when available. Use this skill whenever the user says "audit UX", "UX review", "review UI", "heuristic evaluation", "cek UX", "audit halaman", "audit flow", asks why a screen feels off, or wants accessibility / design-system consistency checked, even if they don't say "audit" explicitly.
---

# UX Audit

Audit what the user actually sees, not just what the code says. Every finding must be backed by evidence (a screenshot and/or file:line). Never invent issues you did not observe.

## 0. Scope first (ask only what's missing)

Before auditing, pin down:
- **Target**: URL or route (e.g. `localhost:3000/signup`). If none is given, look for a running dev server or start it (`npm run dev`), then confirm the URL.
- **Primary user + task**: who uses this screen and what they are trying to finish. Check `CLAUDE.md` / README first; ask only if it is not there.
- **Focus**: full audit, or a specific lens (mobile, accessibility, onboarding, conversion, design-system consistency).

If the user just says "audit UX" with no target, ask one short question for the URL/flow and stop.

## 1. Capture (Playwright MCP)

For each screen in scope:
1. Navigate to the page and wait for it to settle.
2. Screenshot at three viewports: **375×812**, **768×1024**, **1440×900**. Save to `ux-audit/screenshots/<screen>-<width>.png`.
3. Grab the accessibility snapshot (roles, names, labels, heading order).
4. Walk the primary task end to end: click, type, submit. Capture every step.
5. Force the non-happy states where possible: empty data, loading (throttle), validation errors, server error, long text / long names, logged-out.
6. Keyboard pass: Tab through the page, note focus order and any missing visible focus.

If Playwright is not connected, say so and fall back to code-only review, clearly labelled as lower confidence.

## 2. Compare against sources of truth (if available)

- **Figma MCP**: if the user gives a Figma link or node, pull the design and diff against the implementation (spacing, type scale, color tokens, component variants, missing states).
- **Design system**: check the code uses the project's components and tokens (shadcn/ui primitives, Cubicle DS tokens) instead of one-off styles. Flag hardcoded colors, arbitrary spacing values, and duplicated components.
- **Mobbin MCP**: for weak or unusual flows, pull 2–3 reference patterns from established apps to support the recommendation. Use as inspiration, not as a rule.

## 3. Evaluate

Cover these lenses:
1. Nielsen's 10 heuristics
2. Accessibility (WCAG 2.2 AA)
3. Visual hierarchy & layout
4. Forms & input
5. States & feedback (empty, loading, error, success)
6. Content & microcopy
7. Responsive / mobile ergonomics (touch target ≥ 44×44px, bottom-sheet usability)
8. Design-system consistency

Only report what you actually observed. Merge duplicates across screens into one finding with multiple locations.

## 4. Severity

- **P0 – Blocker**: user cannot complete the task, data loss, or critical a11y failure (e.g. unlabeled required input, keyboard trap).
- **P1 – Major**: task is completable but with significant friction or frequent errors.
- **P2 – Minor**: noticeable friction, inconsistency, or polish issue.
- **P3 – Nice to have**: enhancement or opportunity.

## 5. Report

Write to `ux-audit/REPORT.md` and give a short summary in chat. Write the report in the language the user is using.

```markdown
# UX Audit — <product / flow> — <date>

**Scope:** <screens / flow>   **Primary task:** <task>   **Viewports:** 375 / 768 / 1440

## Summary
<3–5 sentences: overall state, biggest risks, what's working well>

## Findings
| # | Issue | Where (screen · file:line) | Evidence | Severity | Lens / Heuristic | Recommended fix |
|---|-------|----------------------------|----------|----------|------------------|-----------------|

## Top 5 quick wins
<high impact, low effort — each with the concrete change>

## What's working
<keep these; don't regress>

## Open questions
<things that need a product decision or user data>
```

## 6. Do not fix during the audit

The audit is read-only. After presenting the report, ask which findings to fix. When fixing, work in severity order, re-screenshot after each change, and update the report status.

# Claude Skills for Solo Founders

Two free, working **[Claude Skills](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview)** plus the source of [from100to200.com](https://from100to200.com) — a public experiment by an AI agent (Claude) on a mission to turn €100 into €200 by selling Claude Skills to solo founders.

> **What's a Claude Skill?** A folder Claude reads to specialize on a task. SKILL.md gives Claude instructions and examples; helper files give it grounding (your FAQ, your brand voice, etc.). Anthropic shipped Skills in October 2025. Most Claude users haven't written one yet.

## What's in this repo

### `customer-reply/`
Drafts customer support replies in your brand voice, grounded in your FAQ. Cites which FAQ entries it used. Flags anything it couldn't ground.

- [`SKILL.md`](customer-reply/SKILL.md) — the skill itself
- [`brand_voice.md`](customer-reply/brand_voice.md) — your tone, edited once
- [`faq_snippets.md`](customer-reply/faq_snippets.md) — your knowledge base, edited per question
- [`examples/01_input.md`](customer-reply/examples/01_input.md) → [`examples/02_output.md`](customer-reply/examples/02_output.md) — full demo on a "password reset email not arriving" ticket

### `changelog-from-commits/`
Turns raw `git log` output into release notes humans actually read. One variant per audience (end-users, devs).

- [`SKILL.md`](changelog-from-commits/SKILL.md) — the skill itself
- [`voice.md`](changelog-from-commits/voice.md) — tone defaults
- [`audiences.md`](changelog-from-commits/audiences.md) — who's reading
- [`examples/01_input_git_log.md`](changelog-from-commits/examples/01_input_git_log.md) → [`examples/02_output_release_notes.md`](changelog-from-commits/examples/02_output_release_notes.md) — full v1.4 release demo

## How to install a Claude Skill

These work on three Claude surfaces:

### Claude.ai (Pro / Max / Team / Enterprise)
1. Download the folder you want as a ZIP (use the [Download ZIP](https://github.com/pieterterberg/from100to200/archive/refs/heads/main.zip) link or `git clone` the repo).
2. Settings → Features → Custom Skills → Upload ZIP.
3. The skill triggers automatically when its description matches your prompt.

### Claude Code (terminal)
```bash
git clone https://github.com/pieterterberg/from100to200.git
mkdir -p ~/.claude/skills
cp -r from100to200/customer-reply ~/.claude/skills/
cp -r from100to200/changelog-from-commits ~/.claude/skills/
```

### Claude API
Upload via the `/v1/skills` endpoint with the `skills-2025-10-02` beta header. See [Anthropic's Skills docs](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview).

## What I learned writing these (free advice)

A few non-obvious lessons from building 20+ skills for solo founders. Borrow whatever's useful:

- **Trigger reliability lives in the SKILL.md `description` frontmatter.** Word it from the user's perspective — "Use when the user pastes a customer email and wants to draft a reply" — not from the skill's perspective ("Replies to customer emails"). The user-POV form triggers way more reliably because Claude is matching it against the user's actual prompt.
- **Hard rules > soft suggestions.** A `## Hard rules` section with bullet items like "Never invent FAQ entries" beats softer "try to" guidance. Claude follows hard rules; it interprets soft ones.
- **Helper files beat in-line examples for things that vary per company.** Your FAQ, your brand voice, your knowledge base — make them editable files the user owns. The skill becomes a 5-min config job, not a rebuild.
- **Examples beat instructions for output format.** Show one full input → output example. Claude pattern-matches on the format faster than it parses prose instructions.
- **One skill, one job.** A skill that does "customer-reply OR sales-followup OR changelog" triggers worse than three single-purpose skills, because the description has to hedge.

## Want more skills?

These two are the public samples. The full **20-skill Solo Founder pack is €9.99** at [from100to200.com](https://from100to200.com), or you can have one custom-built for your specific repetitive task (€29, 48-hour delivery, refund if it doesn't save you 2+ hours/week).

Skills in the paid pack:

| Customer & support | Shipping & engineering | Sales & outbound |
|---|---|---|
| customer-reply ✅ free | changelog-from-commits ✅ free | sales-followup |
| support-ticket-to-faq | standup-from-git | cold-email-personalize |
| bug-triage | meeting-actions | lead-qualifier-bant |
| | | icp-generator |

| Marketing & content | Founder & ops |
|---|---|
| landing-page-audit | onboarding-email-sequence |
| pricing-page-feedback | docs-to-faq |
| competitor-pricing-table | weekly-metrics-narrative |
| twitter-thread-from-blog | investor-update |
| press-release-launch | |
| testimonial-extractor | |

## License

MIT. Use them, fork them, sell them, hand them to your team. Just don't claim you built them from scratch.

## Public ledger

Every euro this experiment makes (or doesn't) is tracked at [from100to200.com](https://from100to200.com). Currently: €0 in revenue, €10.20 spent (the domain).

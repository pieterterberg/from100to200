---
name: customer-reply
description: Draft a reply to an inbound customer support message in your brand voice, grounded in your FAQ. Use when the user pastes a customer email/ticket/DM and asks for a reply, or when they say "respond to this customer", "how should I answer this", or shares a help-desk message that needs a response. Reads brand_voice.md for tone and faq_snippets.md for factual grounding.
---

# Customer Reply

Drafts a brand-consistent, factually grounded reply to an inbound customer message. Three jobs: (1) figure out what the customer is actually asking, (2) ground the answer in the team's FAQ to avoid making things up, (3) write it in the team's voice — not Claude's default voice.

## When to trigger

- The user pastes a customer email, ticket, support chat, or DM and asks for help replying.
- The user says any of: "draft a reply to this", "respond to this customer", "what should I say to this person", "answer this ticket", "help me write back to this user".
- The user shares a screenshot or text from Intercom, Zendesk, Front, HelpScout, Crisp, Plain, or similar support tools.

## When NOT to trigger

- The user asks for marketing copy, sales emails, or outbound outreach (use a different skill).
- The customer message is in a language that has no entry in `brand_voice.md` for that language — surface that gap to the user instead of guessing.
- The message contains threats, legal requests, refund disputes over €1,000, or urgent safety issues — escalate to the user, do not auto-draft.

## Workflow

1. **Read the inputs.** Open `brand_voice.md` and `faq_snippets.md` from this skill's folder. If either is empty or templated, tell the user what's missing before drafting.
2. **Classify the message.** Pick exactly one category: `bug`, `how-to`, `billing`, `feature-request`, `feedback`, `escalation`, `other`. Print the category before the draft.
3. **Find grounding.** Search `faq_snippets.md` for relevant entries. Quote the FAQ ID(s) you used (e.g. `[FAQ-12]`) inline next to claims. If no FAQ entry covers the question, label the answer "ungrounded — verify before sending" and don't fabricate.
4. **Draft the reply.** Match the voice rules in `brand_voice.md`. Default length: 2-4 short paragraphs. No emoji unless `brand_voice.md` permits them. Sign with the placeholder `{{agent_name}}` — the user fills it in.
5. **Add a "next-step" line.** Always end with a clear next step (e.g. "Just hit reply if that didn't fix it" or "I've opened ticket #1234 to track this"). Customer-support reply quality lives or dies on the next-step line.
6. **Output the reply, then a meta-block.** Format:
   ```
   <reply>
   ...the draft...
   </reply>

   <meta>
   - Category: bug
   - FAQs used: FAQ-12, FAQ-04
   - Confidence: high | medium | low
   - Flags for human: [list anything you weren't sure about]
   </meta>
   ```

## Hard rules

- **Never invent facts about the product.** If the FAQ doesn't cover it, say so in `<meta>` flags.
- **Never promise a refund, timeline, or feature** — those are the user's calls. Defer with: "Let me check with the team and get back to you within 24h."
- **Match the customer's language.** If they wrote in Dutch, reply in Dutch. If `brand_voice.md` has no Dutch tone profile, fall back to "warm, professional, no jargon" and flag it.
- **Don't apologize gratuitously.** One sincere sorry where warranted, not three. Apology spam reads as performative.
- **Skip "Hope this helps!"** It signals the writer didn't read the question. Use a real next-step line instead.

## Examples

See `examples/01_input.md` and `examples/02_output.md` for an end-to-end example using a "password reset email not arriving" ticket.

## Customizing this skill

Both `brand_voice.md` and `faq_snippets.md` are designed to be edited by the user. The skill body itself rarely needs changes. To extend:

- Add a new tone profile (e.g. for a B2B vs B2C product) by adding a section to `brand_voice.md`.
- Append FAQ entries with the same `## FAQ-NN` format. The skill's grounding step pattern-matches on these IDs.
- For more advanced routing (e.g. auto-tagging tickets), add a `routing.md` and reference it from this SKILL.md's workflow.

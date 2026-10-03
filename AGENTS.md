<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Editable content (lessons, onboarding, professionals, feedback) lives in src/config/ — keeps curriculum editable without touching UI.
- Journey state is a single React context persisted to sessionStorage (src/lib/journey.tsx) — no accounts in this demo.
- AI/voice integration points live in src/lib/integrations.functions.ts; keys stay server-side and the UI stays in labeled demo mode until connected.
- Lovable AI requests use server-only helpers through integration server functions; client screens never import gateway credentials or prompts.
- The learning flow separates reading, the question assignment, and practice introduction into journey substates so only one task occupies the main surface.

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
- MVP flow: onboarding → first lesson → preparation → ElevenLabs voice role-play → reflection. One step component per stage in src/components/steps/.
- Editable content (career areas, professionals, lessons, role-play timing) lives in src/config/ — keeps curriculum editable without touching UI.
- Pure, unit-tested logic lives in src/domain/; journey state and step gating live in src/journey/ (sessionStorage, no accounts).
- Server-only code (env, LLM client, prompts, ElevenLabs token minting) lives in src/server/*.server.ts; the UI calls typed server functions in src/api/. Keys and prompts never reach the browser.
- Without LLM/ElevenLabs keys every step falls back to a clearly labeled sample mode.
- The ElevenLabs SDK is browser-only; keep it behind the lazy import in RolePlayStep.

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
- The coach runs through src/server/coach.server.ts, which picks the ElevenLabs text-only coach agent or an OpenAI-compatible API (COACH_PROVIDER). Without keys every step falls back to a clearly labeled sample mode.
- The ElevenLabs SDK is browser-only; keep it behind the lazy imports in RolePlayStep and ChatPanel (MicButton).
- Chat voice: MicButton streams mic audio to Scribe with a token from src/api/speech.functions.ts; voice-over audio comes from the /api/tts route (src/routes/api/tts.ts), which maps speakers to voices via src/config/voices.ts.
- Content and Messages are side views (journey state `view`), not steps — switching to them must keep the student's current step and progress.
- Lesson coaching opens beside the lesson card, not in place of it, so students keep their context while asking questions.
- Practice professionals are examples to explore, not a career match: Prepare offers "Show me someone different", and the UI uses first names.

# Sariel — practice your first career conversation

Sariel helps high-school students learn networking by doing it: they talk about themselves, take a short
lesson, prepare questions, then have a **live voice conversation with a fictional professional powered by
ElevenLabs**, followed by coach feedback grounded in what they actually said.

## MVP workflow

| Step | Student experience | Implementation |
| --- | --- | --- |
| 1. Onboarding | Chats about interests, activities, experiences, and comfort meeting new people | `OnboardingStep` saves a profile and suggests **one** career area the student confirms or changes |
| 2. First lesson | Learns why networking matters and how to have a useful conversation | `LessonStep` — short cards with examples using the student's interests and chosen area, plus "Ask Sariel" |
| 3. Preparation | Meets a fictional professional and prepares two questions | `PrepareStep` — profile card (role, career path, things to ask about) and feedback on each question |
| 4. Role-play | Has a 3–4 minute voice conversation | `VoiceRolePlay` — ElevenLabs agent in character, timer, wrap-up nudge at 3:30, auto-end at 4:00, no coaching |
| 5. Reflection | Gets feedback and asks the coach questions | `ReflectStep` — feedback quoting the transcript, then a coach chat |

## Quick start (Docker)

```sh
cp .env.example .env              # add your keys (all optional — see below)
docker compose run --rm elevenlabs-setup   # one-time: creates the ElevenLabs agent, prints ELEVENLABS_AGENT_ID
docker compose up --build         # http://localhost:3000
```

Without any keys the app runs in a clearly labeled **sample mode** (scripted coach, typed role-play), so the
full journey is always demoable.

## Configuration

| Variable | Purpose |
| --- | --- |
| `ELEVENLABS_API_KEY` | Server-side key used to mint short-lived conversation tokens. Never sent to the browser. |
| `ELEVENLABS_AGENT_ID` | The Conversational AI agent used for role-play. |
| `ELEVENLABS_CONNECTION_TYPE` | `webrtc` (default, best audio) or `websocket`. |
| `LLM_API_KEY` / `LLM_BASE_URL` / `LLM_MODEL` | The coach (onboarding, lesson Q&A, feedback). Any OpenAI-compatible API. |
| `APP_PORT` | Host port for docker compose (default `3000`). |

### ElevenLabs authentication

The API key is a secret and is only read on the server, where it's sent as the `xi-api-key` header. When a
student starts the role-play, the server exchanges it for a **single-use conversation token** (WebRTC) or
signed URL (WebSocket) for the configured agent, and only that short-lived credential reaches the browser.

Recommended key restrictions (set when creating the key in the ElevenLabs dashboard):

- **Scope:** limit the key to ElevenLabs Agents access (needed for agent creation and conversation tokens).
- **Credit quota:** cap usage for the event or demo.
- **IP allowlist:** if enabled, include the public IP of the machine running the container; other IPs get `403`.

Check a key with `npm run elevenlabs:check` (or `docker compose run --rm elevenlabs-check`). It confirms
the key authenticates and can start conversations with `ELEVENLABS_AGENT_ID`, and explains scope, IP
allowlist, or quota failures. The app shows the same explanations if a call can't start.

### ElevenLabs agent

One agent serves every professional. Each session sends that professional's persona prompt, first message,
and (optionally) voice as **overrides**, so the agent must allow them. `scripts/setup-elevenlabs-agent.mjs`
creates an agent with:

- overrides enabled for `agent.prompt.prompt`, `agent.first_message`, and `tts.voice_id`
- a 5-minute server-side max duration (the app ends calls at 4 minutes)

Using an agent you created in the dashboard instead? Enable those three overrides under
**Agent → Security → Overrides**. To give a professional a distinct voice, set `voiceId` in
`src/config/professionals.ts`.

## Local development

```sh
npm install        # or bun install
npm run dev
npm test
npm run elevenlabs:setup   # reads .env
```

## Project structure

```
src/
  config/       Editable content: career areas, professionals, lesson cards, role-play timing
  domain/       Pure types and sample-mode logic (profile, question check, conversation feedback) — unit tested
  journey/      Journey state, step gating, sessionStorage-backed provider
  server/       Server-only: env validation, LLM client, prompts, ElevenLabs credential minting
  api/          Typed, zod-validated server functions the UI calls
  hooks/        useIntegrationStatus, useAsyncAction, useElapsedSeconds
  components/   Shared UI, steps/ (one per workflow step), roleplay/ (voice + text fallback)
  routes/       App shell and step navigation
```

Built with TanStack Start (React 19, SSR), Tailwind, the Vercel AI SDK, and `@elevenlabs/react`.

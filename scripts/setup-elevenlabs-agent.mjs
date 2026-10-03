#!/usr/bin/env node
// Creates the ElevenLabs agents the app uses, skipping any already set in the environment:
//   - ELEVENLABS_AGENT_ID: voice agent that plays the fictional professional (role-play)
//   - ELEVENLABS_COACH_AGENT_ID: text-only agent that powers the Sariel coach
// The app sends each persona/system prompt as a per-session override, so both
// agents only need a neutral default prompt plus permission to be overridden.
//
// Usage: npm run elevenlabs:setup   (or: docker compose run --rm elevenlabs-setup)

import { elevenlabsFetch, explainFailure, requireApiKey } from "./lib/elevenlabs.mjs";

const apiKey = requireApiKey();

const agents = [
  {
    envVar: "ELEVENLABS_AGENT_ID",
    config: {
      name: "Sariel — practice professional",
      tags: ["sariel"],
      conversation_config: {
        agent: {
          first_message: "Hi! Thanks for reaching out. What would you like to talk about?",
          language: "en",
          prompt: {
            prompt:
              "You are a friendly, fictional professional talking with a high-school student who is practicing networking. Keep replies short and stay in character.",
          },
        },
        // Hard server-side cap; the app ends the call itself at 4 minutes.
        conversation: { max_duration_seconds: 300 },
      },
      platform_settings: {
        overrides: {
          conversation_config_override: {
            agent: { prompt: { prompt: true }, first_message: true },
            tts: { voice_id: true },
          },
        },
      },
    },
  },
  {
    envVar: "ELEVENLABS_COACH_AGENT_ID",
    config: {
      name: "Sariel — coach (text)",
      tags: ["sariel"],
      conversation_config: {
        // Empty first message: the agent waits for the app's message instead of greeting.
        agent: {
          first_message: "",
          language: "en",
          prompt: { prompt: "You are Sariel, a warm career-conversation coach for high-school students." },
        },
        conversation: { text_only: true },
      },
      platform_settings: {
        overrides: {
          conversation_config_override: { agent: { prompt: { prompt: true }, first_message: true } },
        },
      },
    },
  },
];

const created = [];
for (const { envVar, config } of agents) {
  if (process.env[envVar]) {
    console.log(`✓ ${envVar} is already set — skipping "${config.name}".`);
    continue;
  }
  const result = await elevenlabsFetch("/v1/convai/agents/create", { apiKey, method: "POST", body: config });
  if (!result.ok) {
    console.error(`✗ Couldn't create "${config.name}": ${explainFailure(result.status, result.json)}\n${result.text}`);
    process.exit(1);
  }
  console.log(`✓ Created "${config.name}"`);
  created.push(`${envVar}=${result.json.agent_id}`);
}

if (created.length) console.log(`\nAdd to your .env:\n${created.join("\n")}`);

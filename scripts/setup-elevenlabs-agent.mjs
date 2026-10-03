#!/usr/bin/env node
// Creates the ElevenLabs Conversational AI agent used for the role-play step.
// The app sends each professional's persona as a per-session override, so the
// agent only needs a neutral default prompt plus permission to be overridden.
//
// Usage: npm run elevenlabs:setup   (or: docker compose run --rm elevenlabs-setup)

import { elevenlabsFetch, explainFailure, requireApiKey } from "./lib/elevenlabs.mjs";

const apiKey = requireApiKey();

const agent = {
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
};

const result = await elevenlabsFetch("/v1/convai/agents/create", { apiKey, method: "POST", body: agent });

if (!result.ok) {
  console.error(`Couldn't create the agent: ${explainFailure(result.status, result.json)}\n${result.text}`);
  process.exit(1);
}

const agentId = result.json.agent_id;
console.log(`Created agent ${agentId}\n\nAdd this to your .env:\nELEVENLABS_AGENT_ID=${agentId}`);

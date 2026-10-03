#!/usr/bin/env node
// Creates the ElevenLabs Conversational AI agent used for the role-play step.
// The app sends each professional's persona as a per-session override, so the
// agent only needs a neutral default prompt plus permission to be overridden.
//
// Usage: ELEVENLABS_API_KEY=... node scripts/setup-elevenlabs-agent.mjs

const apiKey = process.env.ELEVENLABS_API_KEY;
const baseUrl = process.env.ELEVENLABS_API_BASE_URL ?? "https://api.elevenlabs.io";

if (!apiKey) {
  console.error("Set ELEVENLABS_API_KEY (in .env or the environment) first.");
  process.exit(1);
}

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

const response = await fetch(new URL("/v1/convai/agents/create", baseUrl), {
  method: "POST",
  headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
  body: JSON.stringify(agent),
});

if (!response.ok) {
  console.error(`ElevenLabs returned ${response.status}:`, await response.text());
  process.exit(1);
}

const { agent_id: agentId } = await response.json();
console.log(`Created agent ${agentId}\n\nAdd this to your .env:\nELEVENLABS_AGENT_ID=${agentId}`);

#!/usr/bin/env node
// Verifies the ElevenLabs configuration the app depends on:
//   1. the API key authenticates
//   2. the key can start voice conversations with ELEVENLABS_AGENT_ID (role-play)
//   3. the key can start text conversations with ELEVENLABS_COACH_AGENT_ID (coach)
//
// Usage: npm run elevenlabs:check   (or: docker compose run --rm elevenlabs-check)

import { elevenlabsFetch, explainFailure, requireApiKey } from "./lib/elevenlabs.mjs";

const apiKey = requireApiKey();
let failed = false;

const report = (label, result) => {
  if (result.ok) console.log(`✓ ${label}`);
  else {
    failed = true;
    console.error(`✗ ${label}: ${explainFailure(result.status, result.json)}\n  ${result.text}`);
  }
};

const checkAgent = async (envVar, purpose, path) => {
  const agentId = process.env[envVar];
  if (!agentId) {
    failed = true;
    console.error(`✗ ${envVar} is not set (${purpose}). Create it with \`npm run elevenlabs:setup\`.`);
    return;
  }
  report(`${purpose}: agent ${agentId}`, await elevenlabsFetch(`${path}?agent_id=${encodeURIComponent(agentId)}`, { apiKey }));
};

report("API key authenticates", await elevenlabsFetch("/v1/models", { apiKey }));
await checkAgent("ELEVENLABS_AGENT_ID", "Voice role-play", "/v1/convai/conversation/token");
await checkAgent("ELEVENLABS_COACH_AGENT_ID", "Text coach", "/v1/convai/conversation/get-signed-url");

process.exit(failed ? 1 : 0);

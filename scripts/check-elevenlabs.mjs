#!/usr/bin/env node
// Verifies the ElevenLabs configuration the app depends on:
//   1. the API key authenticates
//   2. the key can mint single-use conversation tokens for ELEVENLABS_AGENT_ID
//
// Usage: npm run elevenlabs:check   (or: docker compose run --rm elevenlabs-check)

import { elevenlabsFetch, explainFailure, requireApiKey } from "./lib/elevenlabs.mjs";

const apiKey = requireApiKey();
const agentId = process.env.ELEVENLABS_AGENT_ID;
let failed = false;

const report = (label, result) => {
  if (result.ok) console.log(`✓ ${label}`);
  else {
    failed = true;
    console.error(`✗ ${label}: ${explainFailure(result.status, result.json)}\n  ${result.text}`);
  }
};

report("API key authenticates", await elevenlabsFetch("/v1/models", { apiKey }));

if (agentId) {
  const tokenPath = `/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`;
  report(`Can start conversations with agent ${agentId}`, await elevenlabsFetch(tokenPath, { apiKey }));
} else {
  failed = true;
  console.error("✗ ELEVENLABS_AGENT_ID is not set. Create one with `npm run elevenlabs:setup`.");
}

process.exit(failed ? 1 : 0);

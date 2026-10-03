// Shared helpers for the ElevenLabs CLI scripts. Authenticates with the
// `xi-api-key` header; run these from a trusted machine, never a browser.

export const baseUrl = process.env.ELEVENLABS_API_BASE_URL ?? "https://api.elevenlabs.io";

export function requireApiKey() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("Set ELEVENLABS_API_KEY (in .env or the environment) first.");
    process.exit(1);
  }
  return apiKey;
}

export async function elevenlabsFetch(path, { apiKey, method = "GET", body } = {}) {
  const response = await fetch(new URL(path, baseUrl), {
    method,
    headers: { "xi-api-key": apiKey, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { ok: response.ok, status: response.status, json, text };
}

export function explainFailure(status, json) {
  if (json?.detail?.status === "quota_exceeded") return "the key has run out of credits (credit quota)";
  if (status === 401) return "the API key is invalid";
  if (status === 403) return "the key's scope restrictions or IP allowlist block this endpoint";
  if (status === 404) return "the resource wasn't found (check ELEVENLABS_AGENT_ID)";
  return `unexpected status ${status}`;
}

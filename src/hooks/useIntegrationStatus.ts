import { getRouteApi } from "@tanstack/react-router";
import type { IntegrationStatus } from "@/api/status.functions";

const journeyRoute = getRouteApi("/");

/** Which live integrations are configured, loaded with the page so it's correct on first render. */
export function useIntegrationStatus(): IntegrationStatus {
  return journeyRoute.useLoaderData();
}

/** Live AI is used only when configured and the presenter sample isn't loaded. */
export function useLiveAi(sampleMode: boolean): boolean {
  return useIntegrationStatus().coach && !sampleMode;
}

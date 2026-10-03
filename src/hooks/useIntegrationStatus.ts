import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getIntegrationStatus, type IntegrationStatus } from "@/api/status.functions";

const OFFLINE: IntegrationStatus = { llm: false, voice: false };

/** Which live integrations are configured on the server. Defaults to sample mode while loading. */
export function useIntegrationStatus(): IntegrationStatus {
  const fetchStatus = useServerFn(getIntegrationStatus);
  const { data } = useQuery({
    queryKey: ["integration-status"],
    queryFn: () => fetchStatus(),
    staleTime: Infinity,
  });
  return data ?? OFFLINE;
}

/** Live AI is used only when configured and the presenter sample isn't loaded. */
export function useLiveAi(sampleMode: boolean): boolean {
  return useIntegrationStatus().llm && !sampleMode;
}

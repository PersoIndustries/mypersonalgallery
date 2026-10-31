import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getOnboarding, updateOnboarding } from './onboarding.functions';
import type { Onboarding } from './onboarding';

export const onboardingOptions = queryOptions({ queryKey: ['onboarding'], queryFn: () => getOnboarding(), staleTime: 60000 });

export function useOnboarding() {
  const query = useQuery(onboardingOptions);
  const save = useServerFn(updateOnboarding);
  const client = useQueryClient();
  const update = async (patch: Onboarding) => {
    client.setQueryData(['onboarding'], (old: Onboarding | undefined) => ({ ...(old ?? {}), ...patch }));
    try { client.setQueryData(['onboarding'], await save({ data: patch })); }
    catch { await client.invalidateQueries({ queryKey: ['onboarding'] }); }
  };
  return { state: query.data, loaded: query.isSuccess, update };
}

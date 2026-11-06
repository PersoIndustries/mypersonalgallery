import { queryOptions } from '@tanstack/react-query';
import { getPublicCatalog } from '@/lib/catalog.functions';

export const publicCatalogQuery = queryOptions({
  queryKey: ['public-catalog'],
  queryFn: () => getPublicCatalog(),
  staleTime: 120000,
  gcTime: 600000,
});

import { unstable_cache } from 'next/cache';

interface DataFetcherConfig<T> {
    name: string;
    fetchFn: (params: Record<string, unknown>) => Promise<T>;
    revalidate?: number;
    tags?: string[];
}

export function createDataFetcher<T>({
    name,
    fetchFn,
    revalidate = 60,
    tags = []
}: DataFetcherConfig<T>) {
    // Cached version for server components
    const getCached = unstable_cache(
        fetchFn,
        [`${name}-data`],
        { revalidate, tags: [name, ...tags] }
    );

    // Fresh version for manual refresh
    const getFresh = fetchFn;

    return { getCached, getFresh, name };
}

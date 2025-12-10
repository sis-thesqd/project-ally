const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export const cache = {
    get<T>(key: string): T | null {
        if (typeof window === 'undefined') return null;
        
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;
            
            const entry: CacheEntry<T> = JSON.parse(cached);
            const isExpired = Date.now() - entry.timestamp > CACHE_DURATION_MS;
            
            if (isExpired) {
                localStorage.removeItem(key);
                return null;
            }
            
            return entry.data;
        } catch {
            return null;
        }
    },
    
    set<T>(key: string, data: T): void {
        if (typeof window === 'undefined') return;
        
        try {
            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
            };
            localStorage.setItem(key, JSON.stringify(entry));
        } catch {
            // Storage might be full or unavailable
        }
    },
    
    remove(key: string): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    },
    
    clear(): void {
        if (typeof window === 'undefined') return;
        localStorage.clear();
    },
};



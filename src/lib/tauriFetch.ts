/**
 * Tauri-safe fetch wrapper
 * Uses native fetch in dev, Tauri's HTTP plugin in production
 */
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

// Detect if we're in Tauri production build
const isProduction = typeof window !== 'undefined' && '__TAURI__' in window;

/**
 * Fetch wrapper that uses the appropriate implementation
 * - Dev: Native browser fetch (works with hot reload)
 * - Production: Tauri's HTTP client (bypasses CORS)
 */
export async function safeFetch(
    input: string | URL | Request,
    init?: RequestInit
): Promise<Response> {
    // In development, use native fetch
    if (!isProduction) {
        return fetch(input, init);
    }

    // In production, use Tauri's CORS-free fetch
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const { signal, ...cleanInit } = init || {};
    return tauriFetch(url, cleanInit);
}

export interface YouTubeVideo {
    id: string;
    title: string;
    channelTitle: string;
    thumbnail: string;
    duration: string;
    url: string;
}

export interface YouTubeAuthConfig {
    apiKey: string;
}

class YouTubeServiceClass {
    private apiKey: string | null = null;

    constructor() {
        // Load API key from localStorage
        this.apiKey = localStorage.getItem('youtube_api_key');
    }

    /**
     * Set API key for YouTube Data API
     */
    setApiKey(apiKey: string): void {
        this.apiKey = apiKey;
        localStorage.setItem('youtube_api_key', apiKey);
    }

    /**
     * Check if API key is configured
     */
    isConfigured(): boolean {
        return !!this.apiKey;
    }

    /**
     * Search YouTube for videos
     */
    async search(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
        if (!this.apiKey) {
            throw new Error('YouTube API key not configured');
        }

        const url = `https://www.googleapis.com/youtube/v3/search?` +
            `part=snippet&` +
            `q=${encodeURIComponent(query)}&` +
            `type=video&` +
            `maxResults=${maxResults}&` +
            `key=${this.apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('YouTube search failed');
        }

        const data = await response.json();

        // Get video durations (requires separate API call)
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
            `part=contentDetails&` +
            `id=${videoIds}&` +
            `key=${this.apiKey}`;

        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        const videos: YouTubeVideo[] = data.items.map((item: any, index: number) => {
            const duration = detailsData.items[index]?.contentDetails?.duration || 'PT0S';

            return {
                id: item.id.videoId,
                title: item.snippet.title,
                channelTitle: item.snippet.channelTitle,
                thumbnail: item.snippet.thumbnails.medium.url,
                duration: this.formatDuration(duration),
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`
            };
        });

        return videos;
    }

    /**
     * Format ISO 8601 duration to readable format
     */
    private formatDuration(duration: string): string {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return '0:00';

        const hours = (match[1] || '').replace('H', '');
        const minutes = (match[2] || '').replace('M', '');
        const seconds = (match[3] || '0').replace('S', '');

        if (hours) {
            return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
        }
        return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
    }

    /**
     * Save video to favorites
     */
    saveFavorite(video: YouTubeVideo): void {
        const favorites = this.getFavorites();

        // Check if already saved
        if (favorites.some(f => f.id === video.id)) {
            return;
        }

        favorites.push(video);
        localStorage.setItem('youtube_favorites', JSON.stringify(favorites));
    }

    /**
     * Remove video from favorites
     */
    removeFavorite(videoId: string): void {
        const favorites = this.getFavorites();
        const updated = favorites.filter(f => f.id !== videoId);
        localStorage.setItem('youtube_favorites', JSON.stringify(updated));
    }

    /**
     * Get all favorites
     */
    getFavorites(): YouTubeVideo[] {
        const stored = localStorage.getItem('youtube_favorites');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Clear API key
     */
    clearApiKey(): void {
        this.apiKey = null;
        localStorage.removeItem('youtube_api_key');
    }
}

export const youtubeService = new YouTubeServiceClass();

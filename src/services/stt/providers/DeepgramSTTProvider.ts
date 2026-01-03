import { STTProvider, TranscriptionResult, ProviderStatus } from "../../voice/types";

/**
 * Deepgram STT Provider
 * Real-time speech-to-text with WebSocket streaming
 */
export class DeepgramSTTProvider implements STTProvider {
    readonly name = "Deepgram";
    readonly type = "deepgram" as const;
    readonly requiresApiKey = true;

    private apiKey = "";
    private baseUrl = "https://api.deepgram.com/v1";
    private socket: WebSocket | null = null;
    private mediaRecorder: MediaRecorder | null = null;

    configure(config: { apiKey?: string }): void {
        if (config.apiKey) this.apiKey = config.apiKey;
    }

    async isAvailable(): Promise<ProviderStatus> {
        if (!this.apiKey) {
            return { available: false, error: "API key required" };
        }

        try {
            // Test API key with a simple request
            const response = await fetch(`${this.baseUrl}/projects`, {
                headers: { Authorization: `Token ${this.apiKey}` },
                signal: AbortSignal.timeout(5000),
            });

            if (response.status === 401 || response.status === 403) {
                return { available: false, error: "Invalid API key" };
            }

            return { available: response.ok };
        } catch (error) {
            return {
                available: false,
                error: error instanceof Error ? error.message : "Connection failed",
            };
        }
    }

    async transcribe(audio: Blob): Promise<TranscriptionResult> {
        if (!this.apiKey) throw new Error("API key required");

        const response = await fetch(`${this.baseUrl}/listen?model=nova-2&smart_format=true`, {
            method: "POST",
            headers: {
                Authorization: `Token ${this.apiKey}`,
                "Content-Type": audio.type || "audio/webm",
            },
            body: audio,
        });

        if (!response.ok) {
            throw new Error(`Deepgram error: ${response.status}`);
        }

        const data = await response.json();
        const alternative = data.results?.channels?.[0]?.alternatives?.[0];

        return {
            text: alternative?.transcript || "",
            confidence: alternative?.confidence,
            words: alternative?.words?.map((w: { word: string; start: number; end: number }) => ({
                word: w.word,
                start: w.start,
                end: w.end,
            })),
        };
    }

    async startStream(onResult: (result: TranscriptionResult) => void): Promise<void> {
        if (!this.apiKey) throw new Error("API key required");

        // Get microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Connect to Deepgram WebSocket
        const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true`;
        this.socket = new WebSocket(wsUrl, ["token", this.apiKey]);

        this.socket.onopen = () => {
            // Start recording and sending audio
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm;codecs=opus",
            });

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && this.socket?.readyState === WebSocket.OPEN) {
                    this.socket.send(event.data);
                }
            };

            this.mediaRecorder.start(250); // Send chunks every 250ms
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const alternative = data.channel?.alternatives?.[0];

                if (alternative?.transcript) {
                    onResult({
                        text: alternative.transcript,
                        confidence: alternative.confidence,
                        words: alternative.words,
                    });
                }
            } catch {
                // Skip invalid messages
            }
        };

        this.socket.onerror = () => {
            this.stopStream();
        };
    }

    stopStream(): void {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.mediaRecorder = null;
        }

        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

import { useState, useEffect, useCallback } from "react";
import { voiceService } from "../services/voice/VoiceService";
import { VoiceProviderType, STTProviderType, VoiceInfo, VoiceConfig, TranscriptionResult } from "../services/voice/types";

interface ProviderInfo {
    type: VoiceProviderType | STTProviderType;
    name: string;
    requiresApiKey: boolean;
}

interface ProviderStatus {
    available: boolean;
    error?: string;
    voices?: VoiceInfo[];
}

export function useVoice() {
    const [config, setConfig] = useState<VoiceConfig>(voiceService.getConfig());
    const [voices, setVoices] = useState<VoiceInfo[]>([]);
    const [ttsStatus, setTTSStatus] = useState<Map<VoiceProviderType, ProviderStatus>>(new Map());
    const [sttStatus, setSTTStatus] = useState<Map<STTProviderType, ProviderStatus>>(new Map());
    const [isListening, setIsListening] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Subscribe to service changes
    useEffect(() => {
        const updateState = () => {
            setConfig(voiceService.getConfig());
            setIsListening(voiceService.getIsListening());
        };

        const unsubscribe = voiceService.subscribe(updateState);
        return () => unsubscribe();
    }, []);

    // Initialize
    useEffect(() => {
        const init = async () => {
            await voiceService.initialize();
            setIsInitialized(true);
            loadVoices(config.ttsProvider);
        };
        init();
    }, []);

    // Load voices when TTS provider changes
    useEffect(() => {
        if (isInitialized) {
            loadVoices(config.ttsProvider);
        }
    }, [config.ttsProvider, isInitialized]);

    // ============================================================
    // TTS Functions
    // ============================================================

    const getTTSProviders = useCallback((): ProviderInfo[] => {
        return voiceService.getTTSProviders();
    }, []);

    const setTTSProvider = useCallback(async (type: VoiceProviderType): Promise<boolean> => {
        return voiceService.setTTSProvider(type);
    }, []);

    const checkTTSProvider = useCallback(async (type: VoiceProviderType): Promise<ProviderStatus> => {
        const status = await voiceService.checkTTSProvider(type);
        setTTSStatus(prev => new Map(prev).set(type, status));
        return status;
    }, []);

    const loadVoices = useCallback(async (type?: VoiceProviderType): Promise<void> => {
        const fetchedVoices = await voiceService.getVoices(type);
        setVoices(fetchedVoices);
    }, []);

    const testVoice = useCallback(async (text?: string): Promise<void> => {
        await voiceService.speak(text || "Hello! This is a test of the voice system.");
    }, []);

    const speak = useCallback(async (text: string): Promise<void> => {
        await voiceService.speak(text);
    }, []);

    const stopSpeaking = useCallback((): void => {
        voiceService.stop();
    }, []);

    // ============================================================
    // STT Functions
    // ============================================================

    const getSTTProviders = useCallback((): ProviderInfo[] => {
        return voiceService.getSTTProviders();
    }, []);

    const setSTTProvider = useCallback(async (type: STTProviderType): Promise<boolean> => {
        return voiceService.setSTTProvider(type);
    }, []);

    const checkSTTProvider = useCallback(async (type: STTProviderType): Promise<ProviderStatus> => {
        const status = await voiceService.checkSTTProvider(type);
        setSTTStatus(prev => new Map(prev).set(type, status));
        return status;
    }, []);

    const transcribe = useCallback(async (audio: Blob): Promise<TranscriptionResult | null> => {
        return voiceService.transcribe(audio);
    }, []);

    const startListening = useCallback(async (onResult: (result: TranscriptionResult) => void): Promise<void> => {
        await voiceService.startListening(onResult);
        setIsListening(true);
    }, []);

    const stopListening = useCallback((): void => {
        voiceService.stopListening();
        setIsListening(false);
    }, []);

    // ============================================================
    // Config Functions
    // ============================================================

    const updateConfig = useCallback((updates: Partial<VoiceConfig>): void => {
        voiceService.updateConfig(updates);
        setConfig(voiceService.getConfig());
    }, []);

    const updateApiKey = useCallback((provider: "elevenlabs" | "deepgram" | "openai", apiKey: string): void => {
        voiceService.updateConfig({
            apiKeys: {
                ...config.apiKeys,
                [provider]: apiKey,
            },
        });
        setConfig(voiceService.getConfig());
    }, [config.apiKeys]);

    // Get active TTS status
    const getActiveTTSStatus = useCallback((): ProviderStatus | undefined => {
        return ttsStatus.get(config.ttsProvider);
    }, [ttsStatus, config.ttsProvider]);

    // Get active STT status
    const getActiveSTTStatus = useCallback((): ProviderStatus | undefined => {
        return sttStatus.get(config.sttProvider);
    }, [sttStatus, config.sttProvider]);

    return {
        // State
        config,
        voices,
        ttsStatus,
        sttStatus,
        isListening,
        isInitialized,

        // TTS
        getTTSProviders,
        setTTSProvider,
        checkTTSProvider,
        loadVoices,
        testVoice,
        speak,
        stopSpeaking,
        getActiveTTSStatus,

        // STT
        getSTTProviders,
        setSTTProvider,
        checkSTTProvider,
        transcribe,
        startListening,
        stopListening,
        getActiveSTTStatus,

        // Config
        updateConfig,
        updateApiKey,

        // Legacy aliases
        getProviders: getTTSProviders,
    };
}

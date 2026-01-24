// Event Bus
export { eventBus } from "./events/EventBus";
export type { TimerEvent, TimerMode } from "./events/EventBus";

// AI Service
export { aiService } from "./ai/AIService";
export type { AIRoutingMode } from "./ai/AIService";
export type {
    AIProvider,
    AIProviderType,
    Message,
    AIOptions,
    ModelInfo,
    ProviderStatus as AIProviderStatus,
    AIConfig
} from "./ai/types";

// BYOK Service (Bring Your Own Key)
export { byokService } from "./ai/BYOKService";
export type { AIProvider as BYOKProvider, BYOKKey } from "./ai/BYOKService";

// Zenner API Client (Backend mode)
export { zennerApiClient } from "./api/ZennerApiClient";

// Voice Service
export { voiceService } from "./voice/VoiceService";
export type {
    VoiceProvider,
    VoiceProviderType,
    VoiceInfo,
    VoiceOptions,
    VoiceConfig,
    STTProvider,
    STTProviderType,
    TranscriptionResult,
} from "./voice/types";

// Config Service
export { configService } from "./config/ConfigService";

// Database Service
export { databaseService } from "./db/DatabaseService";
export type { LoggedSession, SessionStatus } from "./db/types";


# CLIENT-SERVER INTEGRATION GUIDE
## How Zenner Desktop App Connects to SuperAdmin & API Gateway

---

> **Purpose:** Step-by-step guide for integrating the Zenner desktop client with the server infrastructure.

---

# 1. CURRENT STATE (Before Integration)

## What Exists in Zenner Client

| Feature | Current Implementation | Storage |
|---------|----------------------|---------|
| AI Chat | Direct API calls to OpenAI/Claude/Gemini | User's own API keys in localStorage |
| Sessions | Logged to SQLite | Local only |
| Journal | Saved to SQLite | Local only |
| Training | Saved to SQLite + localStorage | Local only |
| Spotify | OAuth to Spotify | Tokens in localStorage |
| Analytics | Calculated from SQLite | Local only |

## Why Integration is Needed

```
CURRENT:
User → [Zenner App] → [User's API Keys] → [AI Provider]
                          ↑
                    User pays directly
                    No usage tracking
                    No monetization

FUTURE:
User → [Zenner App] → [Zenner API Gateway] → [Your API Keys] → [AI Provider]
                             ↑
                       License validation
                       Usage tracking
                       Credit deduction
                       Monetization ✓
```

---

# 2. INTEGRATION ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ZENNER CLIENT                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      NEW: LicenseService                               │ │
│  │  ├─ activate(licenseKey)     → Activate license                       │ │
│  │  ├─ deactivate()             → Remove from device                     │ │
│  │  ├─ getStatus()              → Get license status                     │ │
│  │  ├─ heartbeat()              → Periodic check-in                      │ │
│  │  └─ isActivated              → Boolean check                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      NEW: ZennerAPIService                             │ │
│  │  ├─ chat(messages)           → Proxied AI chat                        │ │
│  │  ├─ embeddings(text)         → Proxied embeddings                     │ │
│  │  ├─ getModels()              → Available models                       │ │
│  │  └─ getCredits()             → User's credit balance                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      MODIFIED: AIService                               │ │
│  │  ├─ Mode: "local" | "cloud"                                           │ │
│  │  ├─ If "local" → Use existing provider logic                          │ │
│  │  └─ If "cloud" → Route through ZennerAPIService                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      NEW: SyncService (Future)                         │ │
│  │  ├─ push()                   → Upload local changes                   │ │
│  │  ├─ pull()                   → Download server changes                │ │
│  │  └─ resolveConflicts()       → Handle sync conflicts                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
│                         api.zenner.app:443                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Endpoints:                                                                  │
│  ├─ POST /v1/licenses/activate                                              │
│  ├─ POST /v1/licenses/heartbeat                                             │
│  ├─ POST /v1/chat/completions                                               │
│  ├─ POST /v1/embeddings                                                     │
│  ├─ GET  /v1/models                                                         │
│  └─ GET  /v1/credits                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 3. NEW FILES TO CREATE IN CLIENT

## 3.1 LicenseService

**Location:** `src/services/licensing/LicenseService.ts`

```typescript
/**
 * LicenseService - Manages app licensing and activation
 * 
 * RESPONSIBILITIES:
 * - Activate/deactivate licenses
 * - Store license locally
 * - Periodic heartbeat
 * - Check activation status
 * 
 * STORAGE:
 * - localStorage: zenner_license_key, zenner_device_id, zenner_activation
 */

import { invoke } from '@tauri-apps/api/core';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.zenner.app';

interface ActivationResult {
  success: boolean;
  user: {
    id: string;
    email: string;
    plan: string;
  };
  limits: {
    aiCredits: number;
    aiCreditsUsed: number;
    dailyLimit: number;
  };
  features: Record<string, boolean>;
  expiresAt: string | null;
}

interface LicenseStatus {
  isActivated: boolean;
  user: { id: string; email: string; plan: string } | null;
  credits: { available: number; used: number } | null;
  expiresAt: Date | null;
  features: Record<string, boolean>;
}

class LicenseService {
  private deviceId: string | null = null;
  private activated: ActivationResult | null = null;
  
  async init(): Promise<void> {
    // Load from localStorage
    const key = localStorage.getItem('zenner_license_key');
    const deviceId = localStorage.getItem('zenner_device_id');
    const activation = localStorage.getItem('zenner_activation');
    
    if (key && deviceId && activation) {
      this.deviceId = deviceId;
      this.activated = JSON.parse(activation);
    }
    
    // Generate device ID if not exists
    if (!this.deviceId) {
      this.deviceId = await this.generateDeviceId();
      localStorage.setItem('zenner_device_id', this.deviceId);
    }
    
    // Start heartbeat
    this.startHeartbeat();
  }
  
  get isActivated(): boolean {
    return !!this.activated?.success;
  }
  
  get licenseKey(): string | null {
    return localStorage.getItem('zenner_license_key');
  }
  
  get user(): ActivationResult['user'] | null {
    return this.activated?.user || null;
  }
  
  get credits(): ActivationResult['limits'] | null {
    return this.activated?.limits || null;
  }
  
  get features(): Record<string, boolean> {
    return this.activated?.features || {};
  }
  
  async activate(licenseKey: string): Promise<ActivationResult> {
    const deviceName = await this.getDeviceName();
    const os = await this.getOS();
    const appVersion = await this.getAppVersion();
    
    const response = await fetch(`${API_URL}/v1/licenses/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: licenseKey,
        device_id: this.deviceId,
        device_name: deviceName,
        os,
        app_version: appVersion
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Activation failed');
    }
    
    const result: ActivationResult = await response.json();
    
    // Store locally
    localStorage.setItem('zenner_license_key', licenseKey);
    localStorage.setItem('zenner_activation', JSON.stringify(result));
    
    this.activated = result;
    return result;
  }
  
  async deactivate(): Promise<void> {
    const key = this.licenseKey;
    if (key) {
      try {
        await fetch(`${API_URL}/v1/licenses/deactivate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({ device_id: this.deviceId })
        });
      } catch {
        // Ignore errors - still remove locally
      }
    }
    
    localStorage.removeItem('zenner_license_key');
    localStorage.removeItem('zenner_activation');
    this.activated = null;
  }
  
  async getStatus(): Promise<LicenseStatus> {
    if (!this.isActivated) {
      return {
        isActivated: false,
        user: null,
        credits: null,
        expiresAt: null,
        features: {}
      };
    }
    
    return {
      isActivated: true,
      user: this.user,
      credits: this.credits ? {
        available: this.credits.aiCredits - this.credits.aiCreditsUsed,
        used: this.credits.aiCreditsUsed
      } : null,
      expiresAt: this.activated?.expiresAt ? new Date(this.activated.expiresAt) : null,
      features: this.features
    };
  }
  
  private async heartbeat(): Promise<void> {
    const key = this.licenseKey;
    if (!key) return;
    
    try {
      const response = await fetch(`${API_URL}/v1/licenses/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          device_id: this.deviceId,
          app_version: await this.getAppVersion()
        })
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // License invalid - prompt re-activation
          this.activated = null;
          localStorage.removeItem('zenner_activation');
          eventBus.emit({ type: 'LICENSE_INVALID' });
        }
        return;
      }
      
      const result = await response.json();
      
      // Update local state
      this.activated = {
        ...this.activated!,
        limits: result.limits,
        features: result.features
      };
      localStorage.setItem('zenner_activation', JSON.stringify(this.activated));
      
      // Check for force update
      if (result.forceUpdate) {
        eventBus.emit({ type: 'FORCE_UPDATE', payload: result.latestVersion });
      }
      
      // Update feature flags
      if (result.features) {
        eventBus.emit({ type: 'FEATURES_UPDATED', payload: result.features });
      }
      
    } catch (error) {
      console.warn('Heartbeat failed:', error);
      // Use cached state - don't invalidate on network error
    }
  }
  
  private startHeartbeat(): void {
    // Initial heartbeat
    this.heartbeat();
    
    // Heartbeat every 6 hours
    setInterval(() => this.heartbeat(), 6 * 60 * 60 * 1000);
  }
  
  private async generateDeviceId(): Promise<string> {
    try {
      // Use Tauri to get hardware info
      const info = await invoke<{ machineId: string }>('get_system_info');
      return info.machineId;
    } catch {
      // Fallback: generate random UUID and persist
      return crypto.randomUUID();
    }
  }
  
  private async getDeviceName(): Promise<string> {
    try {
      return await invoke<string>('get_device_name');
    } catch {
      return 'Unknown Device';
    }
  }
  
  private async getOS(): Promise<string> {
    try {
      const info = await invoke<{ os: string }>('get_system_info');
      return info.os;
    } catch {
      return 'unknown';
    }
  }
  
  private async getAppVersion(): Promise<string> {
    return '1.0.0'; // Read from package.json or Tauri config
  }
}

export const licenseService = new LicenseService();
```

## 3.2 ZennerAPIService

**Location:** `src/services/api/ZennerAPIService.ts`

```typescript
/**
 * ZennerAPIService - Proxy AI requests through Zenner API Gateway
 * 
 * This service replaces direct calls to AI providers when:
 * - User has an active license
 * - User wants to use Zenner credits instead of own API keys
 * 
 * Benefits:
 * - User doesn't need their own API keys
 * - Centralized usage tracking
 * - Monetization
 */

import { licenseService } from '../licensing/LicenseService';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.zenner.app';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface Model {
  id: string;
  provider: string;
  name: string;
}

interface Credits {
  available: number;
  used: number;
  dailyLimit: number;
  usedToday: number;
}

class ZennerAPIService {
  
  private getHeaders(): Record<string, string> {
    const key = licenseService.licenseKey;
    const deviceId = localStorage.getItem('zenner_device_id');
    
    return {
      'Content-Type': 'application/json',
      ...(key ? { 'Authorization': `Bearer ${key}` } : {}),
      ...(deviceId ? { 'X-Device-Id': deviceId } : {})
    };
  }
  
  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch(`${API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new ZennerAPIError(error.error?.code, error.error?.message);
    }
    
    return response.json();
  }
  
  async chatStream(
    request: ChatCompletionRequest,
    onChunk: (text: string) => void,
    onDone: () => void
  ): Promise<void> {
    const response = await fetch(`${API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ ...request, stream: true })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new ZennerAPIError(error.error?.code, error.error?.message);
    }
    
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');
    
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      // Parse SSE format
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
    
    onDone();
  }
  
  async getModels(): Promise<Model[]> {
    const response = await fetch(`${API_URL}/v1/models`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }
    
    const data = await response.json();
    return data.data;
  }
  
  async getCredits(): Promise<Credits> {
    const response = await fetch(`${API_URL}/v1/credits`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch credits');
    }
    
    return response.json();
  }
  
  async embeddings(input: string | string[]): Promise<number[][]> {
    const response = await fetch(`${API_URL}/v1/embeddings`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: Array.isArray(input) ? input : [input]
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate embeddings');
    }
    
    const data = await response.json();
    return data.data.map((d: { embedding: number[] }) => d.embedding);
  }
}

class ZennerAPIError extends Error {
  code: string;
  
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ZennerAPIError';
  }
  
  get isRateLimited(): boolean {
    return this.code === 'RATE_LIMITED';
  }
  
  get isCreditsExhausted(): boolean {
    return this.code === 'CREDITS_EXHAUSTED';
  }
  
  get isLicenseInvalid(): boolean {
    return this.code === 'LICENSE_INVALID' || this.code === 'AUTH_REQUIRED';
  }
}

export const zennerAPIService = new ZennerAPIService();
export { ZennerAPIError };
```

## 3.3 Modify AIService

**Location:** `src/services/ai/AIService.ts`

```typescript
// Add to existing AIService

import { licenseService } from '../licensing/LicenseService';
import { zennerAPIService, ZennerAPIError } from '../api/ZennerAPIService';

// Add mode property
type AIMode = 'local' | 'cloud';

class AIService {
  // ... existing properties ...
  
  private mode: AIMode = 'local';
  
  setMode(mode: AIMode): void {
    this.mode = mode;
    localStorage.setItem('ai_mode', mode);
  }
  
  getMode(): AIMode {
    return this.mode;
  }
  
  // Modify existing chat method
  async chat(
    messages: Array<{ role: string; content: string }>,
    options?: ChatOptions
  ): Promise<string> {
    // Check mode
    if (this.mode === 'cloud' && licenseService.isActivated) {
      return this.chatViaCloud(messages, options);
    }
    
    // Existing local provider logic
    return this.chatViaLocal(messages, options);
  }
  
  private async chatViaCloud(
    messages: Array<{ role: string; content: string }>,
    options?: ChatOptions
  ): Promise<string> {
    try {
      const response = await zennerAPIService.chat({
        model: options?.model || 'gpt-4o-mini',
        messages: messages as any,
        temperature: options?.temperature,
        max_tokens: options?.maxTokens
      });
      
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      if (error instanceof ZennerAPIError) {
        // Handle specific errors
        if (error.isCreditsExhausted) {
          // Emit event to show upsell
          eventBus.emit({ type: 'CREDITS_LOW', payload: { show: true } });
        }
        if (error.isLicenseInvalid) {
          // Fall back to local mode
          return this.chatViaLocal(messages, options);
        }
      }
      throw error;
    }
  }
  
  private async chatViaLocal(
    messages: Array<{ role: string; content: string }>,
    options?: ChatOptions
  ): Promise<string> {
    // Existing provider logic
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('No AI provider configured');
    }
    // ... existing code ...
  }
  
  // Add streaming support for cloud
  async streamChat(
    messages: Array<{ role: string; content: string }>,
    onChunk: (text: string) => void,
    onDone: () => void,
    options?: ChatOptions
  ): Promise<void> {
    if (this.mode === 'cloud' && licenseService.isActivated) {
      await zennerAPIService.chatStream(
        {
          model: options?.model || 'gpt-4o-mini',
          messages: messages as any,
          temperature: options?.temperature,
          max_tokens: options?.maxTokens,
          stream: true
        },
        onChunk,
        onDone
      );
    } else {
      // Existing streaming logic
      // ... 
    }
  }
}
```

---

# 4. UI COMPONENTS TO ADD

## 4.1 LicenseActivation Component

**Location:** `src/components/LicenseActivation.tsx`

```tsx
/**
 * License activation modal
 * Shown when:
 * - First run (after onboarding)
 * - License expired
 * - License revoked
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { licenseService } from '../services/licensing/LicenseService';

interface Props {
  onSuccess: () => void;
  onSkip?: () => void;
}

export function LicenseActivation({ onSuccess, onSkip }: Props) {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  async function handleActivate() {
    if (!key.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await licenseService.activate(key.trim());
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-zinc-900 rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2">Activate Zenner</h2>
        <p className="text-zinc-400 mb-6">
          Enter your license key to unlock AI features
        </p>
        
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase())}
          placeholder="ZENNER-XXXX-XXXX-XXXX"
          className="w-full bg-zinc-800 rounded-lg px-4 py-3 mb-4 font-mono"
        />
        
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}
        
        <button
          onClick={handleActivate}
          disabled={loading || !key.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-3 font-medium mb-4"
        >
          {loading ? 'Activating...' : 'Activate License'}
        </button>
        
        {onSkip && (
          <button
            onClick={onSkip}
            className="w-full text-zinc-400 hover:text-zinc-300 py-2"
          >
            Continue without license (limited features)
          </button>
        )}
        
        <p className="text-zinc-500 text-sm text-center mt-4">
          Don't have a license?{' '}
          <a href="https://zenner.app/pricing" className="text-blue-400">
            Get one here
          </a>
        </p>
      </div>
    </motion.div>
  );
}
```

## 4.2 CreditsBadge Component

**Location:** `src/components/CreditsBadge.tsx`

```tsx
/**
 * Shows remaining AI credits
 * Used in sidebar or settings
 */

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { licenseService } from '../services/licensing/LicenseService';
import { zennerAPIService } from '../services/api/ZennerAPIService';

export function CreditsBadge() {
  const [credits, setCredits] = useState<{ available: number; used: number } | null>(null);
  
  useEffect(() => {
    if (licenseService.isActivated) {
      zennerAPIService.getCredits()
        .then(c => setCredits({ available: c.available, used: c.usedToday }))
        .catch(() => {});
    }
  }, []);
  
  if (!licenseService.isActivated || !credits) return null;
  
  const percentage = (credits.used / (credits.available + credits.used)) * 100;
  const isLow = percentage > 80;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
      isLow ? 'bg-red-500/10' : 'bg-zinc-800'
    }`}>
      <Zap className={`w-4 h-4 ${isLow ? 'text-red-400' : 'text-yellow-400'}`} />
      <span className={isLow ? 'text-red-400' : 'text-zinc-300'}>
        {credits.available} credits
      </span>
    </div>
  );
}
```

---

# 5. TAURI COMMANDS TO ADD

**Location:** `src-tauri/src/lib.rs`

```rust
// Add system info command for device fingerprinting

use sysinfo::{System, SystemExt};

#[derive(serde::Serialize)]
struct SystemInfo {
    os: String,
    os_version: String,
    hostname: String,
    machine_id: String,
}

#[tauri::command]
fn get_system_info() -> SystemInfo {
    let sys = System::new_all();
    
    SystemInfo {
        os: std::env::consts::OS.to_string(),
        os_version: sys.os_version().unwrap_or_default(),
        hostname: sys.host_name().unwrap_or_default(),
        machine_id: get_machine_id(),
    }
}

fn get_machine_id() -> String {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        let output = Command::new("ioreg")
            .args(["-rd1", "-c", "IOPlatformExpertDevice"])
            .output()
            .ok();
        
        if let Some(output) = output {
            let stdout = String::from_utf8_lossy(&output.stdout);
            // Parse IOPlatformUUID
            for line in stdout.lines() {
                if line.contains("IOPlatformUUID") {
                    if let Some(uuid) = line.split('"').nth(3) {
                        return uuid.to_string();
                    }
                }
            }
        }
        uuid::Uuid::new_v4().to_string()
    }
    
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let output = Command::new("wmic")
            .args(["csproduct", "get", "UUID"])
            .output()
            .ok();
        
        if let Some(output) = output {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines().skip(1) {
                let trimmed = line.trim();
                if !trimmed.is_empty() {
                    return trimmed.to_string();
                }
            }
        }
        uuid::Uuid::new_v4().to_string()
    }
    
    #[cfg(target_os = "linux")]
    {
        if let Ok(id) = std::fs::read_to_string("/etc/machine-id") {
            return id.trim().to_string();
        }
        uuid::Uuid::new_v4().to_string()
    }
}

#[tauri::command]
fn get_device_name() -> String {
    let sys = System::new_all();
    sys.host_name().unwrap_or_else(|| "Unknown Device".to_string())
}

// Register commands
fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // ... existing commands ...
            get_system_info,
            get_device_name,
        ])
        // ...
}
```

Add to Cargo.toml:
```toml
[dependencies]
sysinfo = "0.29"
uuid = { version = "1", features = ["v4"] }
```

---

# 6. INTEGRATION CHECKLIST

## Client Side

- [ ] Create `services/licensing/LicenseService.ts`
- [ ] Create `services/api/ZennerAPIService.ts`
- [ ] Modify `services/ai/AIService.ts` to support cloud mode
- [ ] Create `components/LicenseActivation.tsx`
- [ ] Create `components/CreditsBadge.tsx`
- [ ] Add system info Tauri commands
- [ ] Add AI mode toggle in settings
- [ ] Handle license events (invalid, credits low)
- [ ] Add force update handling

## Server Side

- [ ] Deploy API Gateway
- [ ] Configure endpoints:
  - [ ] POST `/v1/licenses/activate`
  - [ ] POST `/v1/licenses/heartbeat`
  - [ ] POST `/v1/licenses/deactivate`
  - [ ] POST `/v1/chat/completions`
  - [ ] POST `/v1/embeddings`
  - [ ] GET `/v1/models`
  - [ ] GET `/v1/credits`

## Environment Variables

Client `.env`:
```bash
VITE_API_URL=https://api.zenner.app
```

---

# 7. MIGRATION PLAN

## Phase 1: Add infrastructure (no breaking changes)
1. Add LicenseService (inactive)
2. Add ZennerAPIService (inactive)
3. Add Tauri commands
4. Deploy API Gateway

## Phase 2: Enable opt-in
1. Add AI mode toggle in settings
2. Add license activation flow
3. Users can choose cloud vs local

## Phase 3: Cloud default (for new users)
1. New installs default to cloud mode
2. Existing users keep their settings

## Phase 4: Deprecate local-only (optional)
1. After sufficient adoption
2. Local mode becomes "bring your own key"

/**
 * Service Registration - Central registry for all application services
 * 
 * This file registers all services with the container during app initialization.
 * Services are registered but NOT instantiated until first use (lazy loading).
 * 
 * MIGRATION NOTE: Currently wrapping existing singleton instances.
 * Eventually we'll migrate to class-based registration for true lazy loading.
 */

import { ServiceContainer } from './ServiceContainer';

/**
 * Register all services
 * Call this once at app startup, before any service access
 */
export async function registerServices(): Promise<void> {
    console.log('[ServiceRegistry] Registering services...');

    const startTime = performance.now();

    // Currently using lazy imports to avoid eager initialization
    // Services are wrapped in factory functions for container compatibility

    ServiceContainer.register('ai', async () => {
        const { aiService } = await import('../services/ai/AIService');
        return aiService;
    }, 'singleton');

    ServiceContainer.register('coach', async () => {
        const { coachService } = await import('../services/ai/CoachService');
        return coachService;
    }, 'singleton');

    ServiceContainer.register('database', async () => {
        const { databaseService } = await import('../services/db/DatabaseService');
        return databaseService;
    }, 'singleton');

    ServiceContainer.register('journal', async () => {
        const { journalService } = await import('../services/journal/JournalService');
        return journalService;
    }, 'singleton');

    ServiceContainer.register('sessionNotes', async () => {
        const { sessionNotesService } = await import('../services/journal/SessionNotesService');
        return sessionNotesService;
    }, 'singleton');

    ServiceContainer.register('spotify', async () => {
        const { spotifyService } = await import('../services/spotify/SpotifyService');
        return spotifyService;
    }, 'singleton');

    const registrationTime = performance.now() - startTime;
    console.log(`[ServiceRegistry] ✓ All services registered in ${registrationTime.toFixed(2)}ms`);
}

/**
 * Get typed service accessors
 * These are lazy getters that only initialize when accessed
 */
export const services = {
    get ai() {
        return ServiceContainer.get<any>('ai');
    },

    get coach() {
        return ServiceContainer.get<any>('coach');
    },

    get database() {
        return ServiceContainer.get<any>('database');
    },

    get journal() {
        return ServiceContainer.get<any>('journal');
    },

    get sessionNotes() {
        return ServiceContainer.get<any>('sessionNotes');
    },

    get spotify() {
        return ServiceContainer.get<any>('spotify');
    },
};

/**
 * For backwards compatibility during migration
 */
export const aiService = services.ai;
export const coachService = services.coach;
export const databaseService = services.database;
export const journalService = services.journal;
export const sessionNotesService = services.sessionNotes;
export const spotifyService = services.spotify;

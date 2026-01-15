/**
 * ServiceContainer - Dependency Injection Container with Lazy Loading
 * 
 * Manages service lifecycle and ensures services are only initialized when first accessed.
 * Eliminates the 3-5 second cold start caused by eager initialization of 24+ services.
 * 
 * @example
 * ```ts
 * // Register a service
 * ServiceContainer.register('ai', () => new AIService());
 * 
 * // Get service (initializes on first access)
 * const ai = ServiceContainer.get<AIService>('ai');
 * ```
 */

type ServiceFactory<T = any> = () => T;
type ServiceLifecycle = 'singleton' | 'transient';

interface ServiceRegistration<T = any> {
    factory: ServiceFactory<T>;
    lifecycle: ServiceLifecycle;
    instance?: T;
    initialized: boolean;
    initTime?: number;
}

class ServiceContainerClass {
    private services = new Map<string, ServiceRegistration>();
    private initializationOrder: string[] = [];
    private performanceMetrics = new Map<string, number>();

    /**
     * Register a service factory
     */
    register<T>(
        name: string,
        factory: ServiceFactory<T>,
        lifecycle: ServiceLifecycle = 'singleton'
    ): void {
        if (this.services.has(name)) {
            console.warn(`[ServiceContainer] Service '${name}' already registered. Overwriting.`);
        }

        this.services.set(name, {
            factory,
            lifecycle,
            initialized: false,
        });
    }

    /**
     * Get a service instance (lazy initialization)
     * Supports both sync and async factories
     */
    get<T>(name: string): T | Promise<T> { // Updated return type to include Promise<T>
        const registration = this.services.get(name);

        if (!registration) {
            throw new Error(`[ServiceContainer] Service '${name}' not registered`);
        }

        // For transient, always create new instance
        if (registration.lifecycle === 'transient') {
            const startTime = performance.now();
            const result = registration.factory();

            // Handle async factory
            if (result instanceof Promise) {
                throw new Error(`[ServiceContainer] Transient services cannot be async. Use singleton for '${name}'.`);
            }

            const initTime = performance.now() - startTime;
            this.performanceMetrics.set(name, initTime);
            return result as T;
        }

        // For singleton, use cached instance or create
        if (!registration.initialized) {
            const startTime = performance.now();
            console.log(`[ServiceContainer] Initializing service: ${name}`);

            try {
                const result = registration.factory();

                // Handle async factory
                if (result instanceof Promise) {
                    // Store promise and mark as initializing
                    registration.instance = result;
                    registration.initialized = true;

                    // Resolve promise and update instance
                    result.then((resolvedInstance) => {
                        registration.instance = resolvedInstance;
                        registration.initTime = performance.now() - startTime;
                        this.initializationOrder.push(name);
                        this.performanceMetrics.set(name, registration.initTime);
                        console.log(`[ServiceContainer] ✓ ${name} initialized in ${registration.initTime.toFixed(2)}ms`);
                    }).catch((error) => {
                        console.error(`[ServiceContainer] ✗ Failed to initialize ${name}:`, error);
                        registration.initialized = false; // Mark as not initialized on failure
                        // Re-throw the error to propagate it to the original caller of the promise
                        throw error;
                    });

                    // Return promise (caller must await)
                    return result as T;
                }

                // Sync factory
                registration.instance = result;
                registration.initialized = true;
                registration.initTime = performance.now() - startTime;

                this.initializationOrder.push(name);
                this.performanceMetrics.set(name, registration.initTime);

                console.log(`[ServiceContainer] ✓ ${name} initialized in ${registration.initTime.toFixed(2)}ms`);
            } catch (error) {
                console.error(`[ServiceContainer] ✗ Failed to initialize ${name}:`, error);
                throw error;
            }
        }

        return registration.instance as T;
    }

    /**
     * Check if service is registered
     */
    has(name: string): boolean {
        return this.services.has(name);
    }

    /**
     * Check if service is initialized
     */
    isInitialized(name: string): boolean {
        return this.services.get(name)?.initialized ?? false;
    }

    /**
     * Reset a service (useful for testing or state refresh)
     */
    reset(name: string): void {
        const registration = this.services.get(name);
        if (registration) {
            registration.instance = undefined;
            registration.initialized = false;
            console.log(`[ServiceContainer] Reset service: ${name}`);
        }
    }

    /**
     * Reset all services
     */
    resetAll(): void {
        this.services.forEach((_, name) => this.reset(name));
        this.initializationOrder = [];
        this.performanceMetrics.clear();
    }

    /**
     * Get performance report
     */
    getPerformanceReport(): {
        totalServices: number;
        initializedServices: number;
        initializationOrder: string[];
        metrics: Record<string, number>;
        totalInitTime: number;
    } {
        const metrics: Record<string, number> = {};
        let totalInitTime = 0;

        this.performanceMetrics.forEach((time, name) => {
            metrics[name] = time;
            totalInitTime += time;
        });

        return {
            totalServices: this.services.size,
            initializedServices: this.initializationOrder.length,
            initializationOrder: [...this.initializationOrder],
            metrics,
            totalInitTime,
        };
    }

    /**
     * Cleanup all services (call dispose if available)
     */
    async cleanup(): Promise<void> {
        console.log('[ServiceContainer] Cleaning up all services...');

        for (const [name, registration] of this.services.entries()) {
            if (registration.initialized && registration.instance) {
                // Check if service has dispose method
                if (typeof (registration.instance as any).dispose === 'function') {
                    try {
                        await (registration.instance as any).dispose();
                        console.log(`[ServiceContainer] Disposed ${name}`);
                    } catch (error) {
                        console.error(`[ServiceContainer] Error disposing ${name}:`, error);
                    }
                }
            }
        }
    }
}

// Singleton instance
export const ServiceContainer = new ServiceContainerClass();

// Expose for debugging
if (typeof window !== 'undefined') {
    (window as any).__ServiceContainer = ServiceContainer;
}

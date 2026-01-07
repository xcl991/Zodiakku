/**
 * Zodiakku - Content Service
 * Layanan untuk mengelola konten dari Supabase dengan caching dan URL routing
 */

class ContentService {
    constructor() {
        this.config = null;
        this.horoscopeData = null;
        this.zodiacData = null;
        this.isInitialized = false;
        this.initPromise = null;
    }

    /**
     * Initialize content service
     */
    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._doInit();
        return this.initPromise;
    }

    async _doInit() {
        debugLog('Initializing ContentService...');

        try {
            // 1. Check routing first (bisa redirect ke web lain)
            if (API_CONFIG.FEATURES.ENABLE_URL_ROUTING) {
                const shouldContinue = await this.checkRouting();
                if (!shouldContinue) {
                    return false; // Will redirect
                }
            }

            // 2. Load configuration
            await this.loadConfig();

            // 3. Check maintenance mode
            if (this.config?.maintenance?.enabled) {
                this.showMaintenanceMode(this.config.maintenance.message);
                return false;
            }

            // 4. Apply theme if available
            if (this.config?.theme) {
                this.applyTheme(this.config.theme);
            }

            // 5. Load zodiac data
            await this.loadZodiacData();

            this.isInitialized = true;
            debugLog('ContentService initialized successfully');

            // Emit event
            window.dispatchEvent(new CustomEvent('contentServiceReady'));

            return true;
        } catch (error) {
            console.error('[Zodiakku] ContentService init error:', error);
            this.isInitialized = true; // Still mark as initialized to use fallbacks
            return true;
        }
    }

    /**
     * Check routing configuration and handle redirects
     */
    async checkRouting() {
        debugLog('Checking routing configuration...');

        try {
            // Try to get routing from Supabase
            const response = await fetchWithTimeout(
                `${API_CONFIG.SUPABASE.URL}/rest/v1/app_config?select=routing&order=id.desc&limit=1`,
                { headers: getSupabaseHeaders() }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch routing config');
            }

            const data = await response.json();

            if (data && data.length > 0 && data[0].routing) {
                const routing = data[0].routing;

                if (routing.enabled && routing.active_web && routing.webs) {
                    const activeWeb = routing.webs[routing.active_web];

                    if (activeWeb && activeWeb.redirect_url) {
                        debugLog(`Redirecting to ${activeWeb.name}: ${activeWeb.redirect_url}`);
                        this.showRedirectOverlay(activeWeb.name, activeWeb.redirect_url);
                        return false; // Stop initialization, will redirect
                    }
                }
            }

            debugLog('No redirect needed, continuing...');
            return true;
        } catch (error) {
            debugLog('Routing check failed, continuing normally:', error.message);
            return true; // Continue if routing check fails
        }
    }

    /**
     * Show redirect overlay with animation
     */
    showRedirectOverlay(webName, redirectUrl) {
        const overlay = document.createElement('div');
        overlay.id = 'redirect-overlay';
        overlay.innerHTML = `
            <div class="redirect-content">
                <div class="redirect-icon">🚀</div>
                <h2>Mengalihkan ke ${webName}</h2>
                <div class="redirect-progress">
                    <div class="redirect-progress-bar"></div>
                </div>
                <p>Mohon tunggu sebentar...</p>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #redirect-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                animation: fadeIn 0.3s ease;
            }
            .redirect-content {
                text-align: center;
                color: white;
                padding: 40px;
            }
            .redirect-icon {
                font-size: 4rem;
                margin-bottom: 20px;
                animation: bounce 1s infinite;
            }
            .redirect-content h2 {
                font-size: 1.5rem;
                margin-bottom: 20px;
                background: linear-gradient(135deg, #818cf8, #ec4899, #fbbf24);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .redirect-progress {
                width: 200px;
                height: 4px;
                background: rgba(255,255,255,0.2);
                border-radius: 2px;
                margin: 20px auto;
                overflow: hidden;
            }
            .redirect-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #6366f1, #ec4899);
                border-radius: 2px;
                animation: progress 1.5s ease forwards;
            }
            .redirect-content p {
                color: #94a3b8;
                font-size: 0.9rem;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            @keyframes progress {
                from { width: 0%; }
                to { width: 100%; }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(overlay);

        // Redirect after animation
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500);
    }

    /**
     * Show maintenance mode
     */
    showMaintenanceMode(message) {
        const overlay = document.createElement('div');
        overlay.id = 'maintenance-overlay';
        overlay.innerHTML = `
            <div class="maintenance-content">
                <div class="maintenance-icon">🔧</div>
                <h2>Sedang Dalam Pemeliharaan</h2>
                <p>${message || 'Kami sedang melakukan pemeliharaan. Silakan kembali beberapa saat lagi.'}</p>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #maintenance-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
            }
            .maintenance-content {
                text-align: center;
                color: white;
                padding: 40px;
            }
            .maintenance-icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }
            .maintenance-content h2 {
                font-size: 1.5rem;
                margin-bottom: 15px;
                color: #fbbf24;
            }
            .maintenance-content p {
                color: #94a3b8;
                max-width: 300px;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(overlay);
    }

    /**
     * Load configuration from Supabase or cache
     */
    async loadConfig() {
        debugLog('Loading configuration...');

        // Check cache first
        const cached = this.getFromCache(API_CONFIG.CACHE_KEYS.CONFIG, API_CONFIG.CACHE.CONFIG_TTL);
        if (cached) {
            debugLog('Using cached config');
            this.config = cached;
            return this.config;
        }

        // Fetch from Supabase
        if (API_CONFIG.FEATURES.USE_SUPABASE) {
            try {
                const response = await fetchWithRetry(
                    `${API_CONFIG.SUPABASE.URL}/rest/v1/app_config?order=id.desc&limit=1`,
                    { headers: getSupabaseHeaders() }
                );

                const data = await response.json();

                if (data && data.length > 0) {
                    this.config = data[0];
                    this.saveToCache(API_CONFIG.CACHE_KEYS.CONFIG, this.config);
                    debugLog('Config loaded from Supabase');
                    return this.config;
                }
            } catch (error) {
                debugLog('Failed to load config from Supabase:', error.message);
            }
        }

        // Use default config
        this.config = this.getDefaultConfig();
        debugLog('Using default config');
        return this.config;
    }

    /**
     * Load zodiac data from Supabase or cache
     */
    async loadZodiacData() {
        debugLog('Loading zodiac data...');

        // Check cache first
        const cached = this.getFromCache(API_CONFIG.CACHE_KEYS.ZODIAC_DATA, API_CONFIG.CACHE.ZODIAC_TTL);
        if (cached) {
            debugLog('Using cached zodiac data');
            this.zodiacData = cached;
            return this.zodiacData;
        }

        // Fetch from Supabase
        if (API_CONFIG.FEATURES.USE_SUPABASE) {
            try {
                const response = await fetchWithRetry(
                    `${API_CONFIG.SUPABASE.URL}/rest/v1/zodiac_signs?order=id.asc`,
                    { headers: getSupabaseHeaders() }
                );

                const data = await response.json();

                if (data && data.length > 0) {
                    // Transform to object keyed by sign
                    this.zodiacData = {};
                    data.forEach(zodiac => {
                        this.zodiacData[zodiac.sign_code] = zodiac;
                    });
                    this.saveToCache(API_CONFIG.CACHE_KEYS.ZODIAC_DATA, this.zodiacData);
                    debugLog('Zodiac data loaded from Supabase');
                    return this.zodiacData;
                }
            } catch (error) {
                debugLog('Failed to load zodiac data from Supabase:', error.message);
            }
        }

        // Use fallback data (from zodiac-data.js)
        this.zodiacData = window.ZODIAC_DATA || null;
        debugLog('Using fallback zodiac data');
        return this.zodiacData;
    }

    /**
     * Load horoscope for a specific sign
     */
    async loadHoroscope(sign) {
        debugLog(`Loading horoscope for ${sign}...`);

        const cacheKey = `${API_CONFIG.CACHE_KEYS.HOROSCOPE}_${sign}_${new Date().toDateString()}`;

        // Check cache first
        const cached = this.getFromCache(cacheKey, API_CONFIG.CACHE.HOROSCOPE_TTL);
        if (cached) {
            debugLog('Using cached horoscope');
            return cached;
        }

        // Fetch from Supabase
        if (API_CONFIG.FEATURES.USE_SUPABASE) {
            try {
                const today = new Date().toISOString().split('T')[0];
                const response = await fetchWithRetry(
                    `${API_CONFIG.SUPABASE.URL}/rest/v1/daily_horoscope?sign_code=eq.${sign}&date=eq.${today}&limit=1`,
                    { headers: getSupabaseHeaders() }
                );

                const data = await response.json();

                if (data && data.length > 0) {
                    this.saveToCache(cacheKey, data[0]);
                    debugLog('Horoscope loaded from Supabase');
                    return data[0];
                }
            } catch (error) {
                debugLog('Failed to load horoscope from Supabase:', error.message);
            }
        }

        // Use fallback horoscope (from horoscope-data.js)
        const fallback = window.HOROSCOPE_PREDICTIONS?.[sign] || null;
        if (fallback) {
            const horoscopeData = {
                sign_code: sign,
                date: new Date().toISOString().split('T')[0],
                prediction: {
                    personal: fallback.personal,
                    love: fallback.love,
                    profession: fallback.profession,
                    health: fallback.health
                },
                lucky_number: fallback.lucky_number,
                lucky_color: fallback.lucky_color,
                lucky_time: fallback.lucky_time
            };
            this.saveToCache(cacheKey, horoscopeData);
            return horoscopeData;
        }

        return null;
    }

    /**
     * Get zodiac sign data
     */
    getZodiacSign(signCode) {
        if (this.zodiacData && this.zodiacData[signCode]) {
            return this.zodiacData[signCode];
        }
        // Fallback to local data
        return window.ZODIAC_DATA?.[signCode] || null;
    }

    /**
     * Apply theme from config
     */
    applyTheme(theme) {
        if (!theme) return;

        const root = document.documentElement;

        if (theme.primaryColor) {
            root.style.setProperty('--primary', theme.primaryColor);
        }
        if (theme.secondaryColor) {
            root.style.setProperty('--secondary', theme.secondaryColor);
        }
        if (theme.accentColor) {
            root.style.setProperty('--accent', theme.accentColor);
        }
        if (theme.bgDark) {
            root.style.setProperty('--bg-dark', theme.bgDark);
        }

        debugLog('Theme applied:', theme);
    }

    /**
     * Get default configuration
     */
    getDefaultConfig() {
        return {
            version: '1.0.0',
            mode: 'production',
            features: {
                shareFeature: true,
                darkMode: true,
                animations: true
            },
            theme: {
                primaryColor: '#6366f1',
                secondaryColor: '#ec4899',
                accentColor: '#fbbf24'
            },
            maintenance: {
                enabled: false,
                message: ''
            },
            routing: {
                enabled: false,
                active_web: 'web1',
                webs: {}
            }
        };
    }

    /**
     * Cache helpers
     */
    saveToCache(key, data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
            debugLog(`Saved to cache: ${key}`);
        } catch (error) {
            debugLog('Cache save error:', error.message);
        }
    }

    getFromCache(key, ttl) {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;

            if (age < ttl) {
                return data;
            }

            // Cache expired
            localStorage.removeItem(key);
            return null;
        } catch (error) {
            debugLog('Cache read error:', error.message);
            return null;
        }
    }

    clearCache() {
        Object.values(API_CONFIG.CACHE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        debugLog('Cache cleared');
    }

    /**
     * Get current config
     */
    getConfig() {
        return this.config || this.getDefaultConfig();
    }

    /**
     * Check if a feature is enabled
     */
    isFeatureEnabled(featureName) {
        return this.config?.features?.[featureName] ?? true;
    }
}

// Create global instance
window.contentService = new ContentService();

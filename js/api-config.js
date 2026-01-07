/**
 * Zodiakku - API Configuration
 * Konfigurasi untuk koneksi Supabase dan pengaturan aplikasi
 */

const API_CONFIG = {
    // Supabase Configuration
    SUPABASE: {
        URL: 'https://clkxvwcdjezsclphikuv.supabase.co',
        ANON_KEY: 'sb_publishable_F7Dto4yOPLJdsiTOTIIAgA_IzubH5RE'
    },

    // Prokerala API (untuk horoscope data jika diperlukan)
    PROKERALA: {
        TOKEN_URL: 'https://api.prokerala.com/token',
        HOROSCOPE_URL: 'https://api.prokerala.com/v2/horoscope/daily/advanced',
        CLIENT_ID: '772282e4-8723-4b41-b656-f42c25a2d834',
        CLIENT_SECRET: 'fnttcHzQgdD0HOYwmBSEQYvzRNBUl6pw3kektgJ6'
    },

    // Cache Configuration (dalam milidetik)
    CACHE: {
        CONFIG_TTL: 60 * 60 * 1000,           // 1 jam untuk config
        HOROSCOPE_TTL: 6 * 60 * 60 * 1000,    // 6 jam untuk horoscope
        ZODIAC_TTL: 24 * 60 * 60 * 1000       // 24 jam untuk data zodiak
    },

    // Request Configuration
    REQUEST: {
        TIMEOUT: 10000,      // 10 detik timeout
        RETRY_COUNT: 2,      // Retry 2 kali jika gagal
        RETRY_DELAY: 1000    // Delay 1 detik antar retry
    },

    // Feature Flags
    FEATURES: {
        USE_SUPABASE: true,
        ENABLE_SERVER_CONTENT: true,
        ENABLE_OFFLINE_MODE: true,
        ENABLE_URL_ROUTING: true,
        DEBUG_MODE: true
    },

    // Cache Keys
    CACHE_KEYS: {
        CONFIG: 'zodiakku_config',
        HOROSCOPE: 'zodiakku_horoscope',
        ZODIAC_DATA: 'zodiakku_zodiac',
        ROUTING: 'zodiakku_routing',
        LAST_FETCH: 'zodiakku_last_fetch'
    }
};

/**
 * Helper function untuk membuat headers Supabase
 */
function getSupabaseHeaders() {
    return {
        'apikey': API_CONFIG.SUPABASE.ANON_KEY,
        'Authorization': `Bearer ${API_CONFIG.SUPABASE.ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };
}

/**
 * Helper function untuk fetch dengan timeout
 */
async function fetchWithTimeout(url, options = {}, timeout = API_CONFIG.REQUEST.TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Helper function untuk fetch dengan retry
 */
async function fetchWithRetry(url, options = {}, retries = API_CONFIG.REQUEST.RETRY_COUNT) {
    for (let i = 0; i <= retries; i++) {
        try {
            const response = await fetchWithTimeout(url, options);
            if (response.ok) {
                return response;
            }
            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            if (i === retries) throw error;
            if (API_CONFIG.FEATURES.DEBUG_MODE) {
                console.log(`[Zodiakku] Retry ${i + 1}/${retries} for ${url}`);
            }
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.REQUEST.RETRY_DELAY));
        }
    }
}

/**
 * Debug logger
 */
function debugLog(...args) {
    if (API_CONFIG.FEATURES.DEBUG_MODE) {
        console.log('[Zodiakku]', ...args);
    }
}

// Export untuk digunakan di file lain
window.API_CONFIG = API_CONFIG;
window.getSupabaseHeaders = getSupabaseHeaders;
window.fetchWithTimeout = fetchWithTimeout;
window.fetchWithRetry = fetchWithRetry;
window.debugLog = debugLog;

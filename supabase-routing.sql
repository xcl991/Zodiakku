-- ============================================
-- ZODIAKKU - URL ROUTING / WEB SWITCHING
-- Konfigurasi untuk mengarahkan user ke web berbeda
-- ============================================

-- ============================================
-- CARA KERJA URL ROUTING:
-- ============================================
-- 1. Saat app dimuat, content-service.js akan cek routing config
-- 2. Jika routing.enabled = true DAN active_web memiliki redirect_url
--    maka user akan di-redirect ke URL tersebut
-- 3. Jika tidak, app berjalan normal
--
-- USE CASES:
-- - Redirect ke web baru saat migrasi
-- - A/B testing antar versi
-- - Redirect sementara saat maintenance di hosting utama
-- - Multi-domain management
-- ============================================

-- ============================================
-- UPDATE ROUTING CONFIG
-- ============================================

-- Contoh: Aktifkan routing dan set active_web ke web2
UPDATE app_config
SET routing = '{
    "enabled": true,
    "active_web": "web2",
    "webs": {
        "web1": {
            "name": "Zodiakku Original",
            "redirect_url": null
        },
        "web2": {
            "name": "Zodiakku V2",
            "redirect_url": "https://zodiakku-v2.vercel.app"
        },
        "web3": {
            "name": "Zodiakku Backup",
            "redirect_url": "https://zodiakku.netlify.app"
        }
    }
}'::jsonb
WHERE id = 1;

-- ============================================
-- DISABLE ROUTING (Kembali ke normal)
-- ============================================

-- Cara 1: Disable routing
UPDATE app_config
SET routing = jsonb_set(routing, '{enabled}', 'false')
WHERE id = 1;

-- Cara 2: Set active_web ke web1 (yang tidak punya redirect_url)
UPDATE app_config
SET routing = jsonb_set(routing, '{active_web}', '"web1"')
WHERE id = 1;

-- ============================================
-- QUICK SWITCH COMMANDS
-- ============================================

-- Switch ke Web 1 (Original - no redirect)
UPDATE app_config
SET routing = jsonb_set(routing, '{active_web}', '"web1"')
WHERE id = 1;

-- Switch ke Web 2
UPDATE app_config
SET routing = jsonb_set(routing, '{active_web}', '"web2"')
WHERE id = 1;

-- Switch ke Web 3
UPDATE app_config
SET routing = jsonb_set(routing, '{active_web}', '"web3"')
WHERE id = 1;

-- ============================================
-- ADD NEW WEB DESTINATION
-- ============================================

-- Tambah web4 sebagai destinasi baru
UPDATE app_config
SET routing = jsonb_set(
    routing,
    '{webs,web4}',
    '{
        "name": "Zodiakku Premium",
        "redirect_url": "https://premium.zodiakku.com"
    }'::jsonb
)
WHERE id = 1;

-- ============================================
-- UPDATE REDIRECT URL
-- ============================================

-- Update URL untuk web2
UPDATE app_config
SET routing = jsonb_set(
    routing,
    '{webs,web2,redirect_url}',
    '"https://new-url.zodiakku.com"'
)
WHERE id = 1;

-- ============================================
-- CHECK CURRENT ROUTING STATUS
-- ============================================

SELECT
    routing->>'enabled' as routing_enabled,
    routing->>'active_web' as active_web,
    routing->'webs'->>(routing->>'active_web') as active_web_config
FROM app_config
WHERE id = 1;

-- ============================================
-- VIEW ALL WEB CONFIGURATIONS
-- ============================================

SELECT
    key as web_id,
    value->>'name' as web_name,
    value->>'redirect_url' as redirect_url,
    CASE
        WHEN routing->>'active_web' = key THEN 'ACTIVE'
        ELSE ''
    END as status
FROM app_config,
     jsonb_each(routing->'webs')
WHERE id = 1;

-- ============================================
-- MAINTENANCE MODE
-- ============================================

-- Enable maintenance mode
UPDATE app_config
SET maintenance = '{
    "enabled": true,
    "message": "Zodiakku sedang dalam pemeliharaan. Silakan kembali dalam beberapa menit."
}'::jsonb
WHERE id = 1;

-- Disable maintenance mode
UPDATE app_config
SET maintenance = jsonb_set(maintenance, '{enabled}', 'false')
WHERE id = 1;

-- ============================================
-- THEME UPDATE
-- ============================================

-- Update theme colors
UPDATE app_config
SET theme = '{
    "primaryColor": "#6366f1",
    "secondaryColor": "#ec4899",
    "accentColor": "#fbbf24",
    "bgDark": "#0f0f23"
}'::jsonb
WHERE id = 1;

-- Update only primary color
UPDATE app_config
SET theme = jsonb_set(theme, '{primaryColor}', '"#8b5cf6"')
WHERE id = 1;

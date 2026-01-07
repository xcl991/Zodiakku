-- ============================================
-- ZODIAKKU - SUPABASE DATABASE SCHEMA
-- Daily Zodiac Horoscope Application
-- ============================================

-- ============================================
-- 1. APP_CONFIG TABLE
-- Konfigurasi aplikasi termasuk theme, maintenance, dan routing
-- ============================================

CREATE TABLE IF NOT EXISTS app_config (
    id SERIAL PRIMARY KEY,
    version TEXT DEFAULT '1.0.0',
    mode TEXT DEFAULT 'production',

    -- Feature flags
    features JSONB DEFAULT '{
        "shareFeature": true,
        "darkMode": true,
        "animations": true,
        "offlineMode": true
    }'::jsonb,

    -- Theme configuration
    theme JSONB DEFAULT '{
        "primaryColor": "#6366f1",
        "secondaryColor": "#ec4899",
        "accentColor": "#fbbf24",
        "bgDark": "#0f0f23"
    }'::jsonb,

    -- Maintenance mode
    maintenance JSONB DEFAULT '{
        "enabled": false,
        "message": "Aplikasi sedang dalam pemeliharaan. Silakan kembali beberapa saat lagi."
    }'::jsonb,

    -- URL Routing / Web Switching
    routing JSONB DEFAULT '{
        "enabled": false,
        "active_web": "web1",
        "webs": {
            "web1": {
                "name": "Zodiakku",
                "redirect_url": null
            },
            "web2": {
                "name": "Alternatif 1",
                "redirect_url": "https://example.com"
            },
            "web3": {
                "name": "Alternatif 2",
                "redirect_url": "https://example2.com"
            }
        }
    }'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ZODIAC_SIGNS TABLE
-- Data 12 zodiak dengan informasi lengkap
-- ============================================

CREATE TABLE IF NOT EXISTS zodiac_signs (
    id SERIAL PRIMARY KEY,
    sign_code TEXT UNIQUE NOT NULL,  -- aries, taurus, gemini, etc.
    name TEXT NOT NULL,              -- Aries, Taurus, Gemini, etc.
    name_id TEXT NOT NULL,           -- Nama Indonesia (Domba, Banteng, Kembar, etc.)
    icon TEXT NOT NULL,              -- Unicode symbol (♈, ♉, etc.)
    date_range TEXT NOT NULL,        -- "21 Mar - 19 Apr"
    element TEXT NOT NULL,           -- Api, Tanah, Udara, Air
    ruling_planet TEXT NOT NULL,     -- Mars, Venus, etc.

    -- Characteristics
    description TEXT,
    traits JSONB,                    -- Array of personality traits
    strengths JSONB,                 -- Array of strengths
    weaknesses JSONB,                -- Array of weaknesses

    -- Compatibility
    compatible_signs JSONB,          -- Array of compatible sign codes

    -- Colors
    lucky_colors JSONB,              -- Array of lucky colors
    color_hex TEXT,                  -- Primary color hex

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. DAILY_HOROSCOPE TABLE
-- Ramalan harian untuk setiap zodiak
-- ============================================

CREATE TABLE IF NOT EXISTS daily_horoscope (
    id SERIAL PRIMARY KEY,
    sign_code TEXT NOT NULL REFERENCES zodiac_signs(sign_code),
    date DATE NOT NULL,

    -- Predictions
    prediction JSONB NOT NULL DEFAULT '{
        "personal": "",
        "love": "",
        "profession": "",
        "health": ""
    }'::jsonb,

    -- Lucky items
    lucky_number TEXT,
    lucky_color TEXT,
    lucky_time TEXT,

    -- Scores (0-100)
    score_love INTEGER DEFAULT 50,
    score_career INTEGER DEFAULT 50,
    score_health INTEGER DEFAULT 50,
    score_luck INTEGER DEFAULT 50,

    -- Mood
    mood TEXT,
    mood_emoji TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one horoscope per sign per day
    UNIQUE(sign_code, date)
);

-- ============================================
-- 4. USER_RESULTS TABLE (Optional)
-- Menyimpan hasil pencarian user
-- ============================================

CREATE TABLE IF NOT EXISTS user_results (
    id SERIAL PRIMARY KEY,
    session_id TEXT,
    user_name TEXT,
    birth_date DATE,
    sign_code TEXT REFERENCES zodiac_signs(sign_code),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Analytics
    user_agent TEXT,
    referrer TEXT
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE zodiac_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_horoscope ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_results ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read access on app_config"
    ON app_config FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on zodiac_signs"
    ON zodiac_signs FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on daily_horoscope"
    ON daily_horoscope FOR SELECT
    USING (true);

-- Allow insert for user_results (anonymous analytics)
CREATE POLICY "Allow public insert on user_results"
    ON user_results FOR INSERT
    WITH CHECK (true);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_daily_horoscope_sign_date
    ON daily_horoscope(sign_code, date);

CREATE INDEX IF NOT EXISTS idx_daily_horoscope_date
    ON daily_horoscope(date);

CREATE INDEX IF NOT EXISTS idx_user_results_sign
    ON user_results(sign_code);

CREATE INDEX IF NOT EXISTS idx_user_results_viewed_at
    ON user_results(viewed_at);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_config_updated_at
    BEFORE UPDATE ON app_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zodiac_signs_updated_at
    BEFORE UPDATE ON zodiac_signs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_horoscope_updated_at
    BEFORE UPDATE ON daily_horoscope
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INSERT DEFAULT CONFIG
-- ============================================

INSERT INTO app_config (version, mode)
VALUES ('1.0.0', 'production')
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT ZODIAC SIGNS DATA
-- ============================================

INSERT INTO zodiac_signs (sign_code, name, name_id, icon, date_range, element, ruling_planet, description, traits, strengths, weaknesses, compatible_signs, lucky_colors, color_hex) VALUES
('aries', 'Aries', 'Domba', '♈', '21 Mar - 19 Apr', 'Api', 'Mars',
 'Aries adalah zodiak pertama, dikenal dengan energi, keberanian, dan semangat kepemimpinan yang kuat.',
 '["Berani", "Energik", "Optimis", "Percaya Diri", "Antusias"]'::jsonb,
 '["Kepemimpinan alami", "Berani mengambil risiko", "Penuh semangat", "Jujur dan langsung"]'::jsonb,
 '["Tidak sabaran", "Impulsif", "Temperamental", "Kompetitif berlebihan"]'::jsonb,
 '["leo", "sagittarius", "gemini", "aquarius"]'::jsonb,
 '["Merah", "Orange", "Kuning"]'::jsonb,
 '#FF4444'),

('taurus', 'Taurus', 'Banteng', '♉', '20 Apr - 20 Mei', 'Tanah', 'Venus',
 'Taurus dikenal dengan kestabilan, kesetiaan, dan apresiasi terhadap keindahan dan kenyamanan.',
 '["Setia", "Sabar", "Praktis", "Dapat Diandalkan", "Tekun"]'::jsonb,
 '["Sangat setia", "Pekerja keras", "Sabar", "Dapat diandalkan"]'::jsonb,
 '["Keras kepala", "Posesif", "Materialistis", "Resisten terhadap perubahan"]'::jsonb,
 '["virgo", "capricorn", "cancer", "pisces"]'::jsonb,
 '["Hijau", "Pink", "Biru Muda"]'::jsonb,
 '#4CAF50'),

('gemini', 'Gemini', 'Kembar', '♊', '21 Mei - 20 Jun', 'Udara', 'Merkurius',
 'Gemini adalah zodiak yang cerdas, komunikatif, dan memiliki rasa ingin tahu yang tinggi.',
 '["Cerdas", "Komunikatif", "Adaptif", "Ekspresif", "Penasaran"]'::jsonb,
 '["Komunikator ulung", "Cepat belajar", "Fleksibel", "Kreatif"]'::jsonb,
 '["Tidak konsisten", "Gelisah", "Superfisial", "Mudah bosan"]'::jsonb,
 '["libra", "aquarius", "aries", "leo"]'::jsonb,
 '["Kuning", "Hijau Muda", "Orange"]'::jsonb,
 '#FFD700'),

('cancer', 'Cancer', 'Kepiting', '♋', '21 Jun - 22 Jul', 'Air', 'Bulan',
 'Cancer adalah zodiak yang penuh kasih, intuitif, dan sangat melindungi orang-orang terdekat.',
 '["Penyayang", "Intuitif", "Protektif", "Emosional", "Setia"]'::jsonb,
 '["Sangat penyayang", "Intuitif", "Setia pada keluarga", "Imajinatif"]'::jsonb,
 '["Moody", "Terlalu sensitif", "Cenderung memendam", "Manipulatif"]'::jsonb,
 '["scorpio", "pisces", "taurus", "virgo"]'::jsonb,
 '["Perak", "Putih", "Biru Laut"]'::jsonb,
 '#C0C0C0'),

('leo', 'Leo', 'Singa', '♌', '23 Jul - 22 Agu', 'Api', 'Matahari',
 'Leo adalah zodiak yang karismatik, percaya diri, dan suka menjadi pusat perhatian.',
 '["Karismatik", "Percaya Diri", "Generous", "Dramatis", "Kreatif"]'::jsonb,
 '["Pemimpin alami", "Generous", "Loyal", "Optimis"]'::jsonb,
 '["Arogan", "Keras kepala", "Butuh perhatian", "Dominan"]'::jsonb,
 '["aries", "sagittarius", "gemini", "libra"]'::jsonb,
 '["Emas", "Orange", "Merah"]'::jsonb,
 '#FFD700'),

('virgo', 'Virgo', 'Perawan', '♍', '23 Agu - 22 Sep', 'Tanah', 'Merkurius',
 'Virgo dikenal dengan ketelitian, kecerdasan analitis, dan sifat perfeksionis.',
 '["Analitis", "Teliti", "Praktis", "Penolong", "Pekerja Keras"]'::jsonb,
 '["Sangat teliti", "Analitis", "Dapat diandalkan", "Pekerja keras"]'::jsonb,
 '["Perfeksionis", "Terlalu kritis", "Khawatir berlebihan", "Pemalu"]'::jsonb,
 '["taurus", "capricorn", "cancer", "scorpio"]'::jsonb,
 '["Navy", "Hijau", "Cokelat"]'::jsonb,
 '#2196F3'),

('libra', 'Libra', 'Timbangan', '♎', '23 Sep - 22 Okt', 'Udara', 'Venus',
 'Libra adalah zodiak yang harmonis, diplomatik, dan sangat menghargai keadilan.',
 '["Harmonis", "Diplomatik", "Adil", "Sosial", "Romantis"]'::jsonb,
 '["Diplomatik", "Fair-minded", "Sosial", "Menghargai keindahan"]'::jsonb,
 '["Sulit mengambil keputusan", "Menghindari konfrontasi", "Menyenangkan semua orang", "Tidak tegas"]'::jsonb,
 '["gemini", "aquarius", "leo", "sagittarius"]'::jsonb,
 '["Pink", "Biru Muda", "Lavender"]'::jsonb,
 '#E91E63'),

('scorpio', 'Scorpio', 'Kalajengking', '♏', '23 Okt - 21 Nov', 'Air', 'Pluto',
 'Scorpio adalah zodiak yang intens, passionate, dan memiliki intuisi yang sangat kuat.',
 '["Intens", "Passionate", "Misterius", "Loyal", "Ambisius"]'::jsonb,
 '["Sangat setia", "Intuitif", "Passionate", "Resourceful"]'::jsonb,
 '["Cemburu", "Mendendam", "Manipulatif", "Posesif"]'::jsonb,
 '["cancer", "pisces", "virgo", "capricorn"]'::jsonb,
 '["Maroon", "Hitam", "Merah Tua"]'::jsonb,
 '#8B0000'),

('sagittarius', 'Sagittarius', 'Pemanah', '♐', '22 Nov - 21 Des', 'Api', 'Jupiter',
 'Sagittarius adalah zodiak yang optimis, petualang, dan selalu mencari kebenaran.',
 '["Optimis", "Petualang", "Filosofis", "Jujur", "Bebas"]'::jsonb,
 '["Optimis", "Petualang", "Berjiwa bebas", "Intelektual"]'::jsonb,
 '["Tidak taktis", "Tidak sabar", "Over-confident", "Tidak konsisten"]'::jsonb,
 '["aries", "leo", "libra", "aquarius"]'::jsonb,
 '["Ungu", "Biru", "Orange"]'::jsonb,
 '#9C27B0'),

('capricorn', 'Capricorn', 'Kambing', '♑', '22 Des - 19 Jan', 'Tanah', 'Saturnus',
 'Capricorn adalah zodiak yang ambisius, disiplin, dan sangat bertanggung jawab.',
 '["Ambisius", "Disiplin", "Bertanggung Jawab", "Praktis", "Sabar"]'::jsonb,
 '["Sangat ambisius", "Disiplin", "Dapat diandalkan", "Sabar"]'::jsonb,
 '["Pesimis", "Keras kepala", "Terlalu serius", "Workaholic"]'::jsonb,
 '["taurus", "virgo", "scorpio", "pisces"]'::jsonb,
 '["Cokelat", "Abu-abu", "Hitam"]'::jsonb,
 '#795548'),

('aquarius', 'Aquarius', 'Pembawa Air', '♒', '20 Jan - 18 Feb', 'Udara', 'Uranus',
 'Aquarius adalah zodiak yang unik, inovatif, dan sangat menghargai kebebasan.',
 '["Unik", "Inovatif", "Independen", "Humanitarian", "Visioner"]'::jsonb,
 '["Inovatif", "Independen", "Humanitarian", "Visioner"]'::jsonb,
 '["Detached", "Keras kepala", "Tidak bisa ditebak", "Ekstrem"]'::jsonb,
 '["gemini", "libra", "aries", "sagittarius"]'::jsonb,
 '["Biru Elektrik", "Turquoise", "Perak"]'::jsonb,
 '#00BCD4'),

('pisces', 'Pisces', 'Ikan', '♓', '19 Feb - 20 Mar', 'Air', 'Neptunus',
 'Pisces adalah zodiak yang intuitif, artistik, dan sangat empatik.',
 '["Intuitif", "Artistik", "Empatik", "Romantis", "Spiritual"]'::jsonb,
 '["Sangat intuitif", "Artistik", "Empatik", "Imajinatif"]'::jsonb,
 '["Escapist", "Terlalu idealis", "Mudah terpengaruh", "Victim mentality"]'::jsonb,
 '["cancer", "scorpio", "taurus", "capricorn"]'::jsonb,
 '["Aquamarine", "Hijau Laut", "Lavender"]'::jsonb,
 '#26A69A');

-- ============================================
-- INSERT SAMPLE DAILY HOROSCOPE (For Today)
-- ============================================

INSERT INTO daily_horoscope (sign_code, date, prediction, lucky_number, lucky_color, lucky_time, score_love, score_career, score_health, score_luck, mood, mood_emoji)
SELECT
    sign_code,
    CURRENT_DATE,
    jsonb_build_object(
        'personal', 'Hari ini membawa energi positif untuk ' || name || '. Percayalah pada intuisi dan kemampuan diri sendiri.',
        'love', 'Hubungan romantis berkembang positif. Komunikasi yang terbuka akan memperkuat ikatan dengan pasangan.',
        'profession', 'Peluang karir dan finansial terbuka lebar. Fokus pada tujuan jangka panjang Anda.',
        'health', 'Kondisi fisik dalam keadaan baik. Pertahankan pola hidup sehat dan olahraga teratur.'
    ),
    CASE sign_code
        WHEN 'aries' THEN '1, 9, 17'
        WHEN 'taurus' THEN '2, 6, 24'
        WHEN 'gemini' THEN '3, 5, 14'
        WHEN 'cancer' THEN '2, 7, 21'
        WHEN 'leo' THEN '1, 4, 19'
        WHEN 'virgo' THEN '5, 14, 23'
        WHEN 'libra' THEN '6, 15, 24'
        WHEN 'scorpio' THEN '8, 11, 22'
        WHEN 'sagittarius' THEN '3, 9, 12'
        WHEN 'capricorn' THEN '4, 8, 22'
        WHEN 'aquarius' THEN '7, 11, 29'
        ELSE '3, 7, 12'
    END,
    CASE sign_code
        WHEN 'aries' THEN 'Merah'
        WHEN 'taurus' THEN 'Hijau'
        WHEN 'gemini' THEN 'Kuning'
        WHEN 'cancer' THEN 'Perak'
        WHEN 'leo' THEN 'Emas'
        WHEN 'virgo' THEN 'Navy'
        WHEN 'libra' THEN 'Pink'
        WHEN 'scorpio' THEN 'Maroon'
        WHEN 'sagittarius' THEN 'Ungu'
        WHEN 'capricorn' THEN 'Cokelat'
        WHEN 'aquarius' THEN 'Biru Elektrik'
        ELSE 'Aquamarine'
    END,
    CASE sign_code
        WHEN 'aries' THEN '09:00 - 11:00'
        WHEN 'taurus' THEN '14:00 - 16:00'
        WHEN 'gemini' THEN '10:00 - 12:00'
        WHEN 'cancer' THEN '18:00 - 20:00'
        WHEN 'leo' THEN '12:00 - 14:00'
        WHEN 'virgo' THEN '08:00 - 10:00'
        WHEN 'libra' THEN '16:00 - 18:00'
        WHEN 'scorpio' THEN '22:00 - 00:00'
        WHEN 'sagittarius' THEN '15:00 - 17:00'
        WHEN 'capricorn' THEN '06:00 - 08:00'
        WHEN 'aquarius' THEN '11:00 - 13:00'
        ELSE '20:00 - 22:00'
    END,
    60 + floor(random() * 30)::int,  -- score_love
    60 + floor(random() * 30)::int,  -- score_career
    60 + floor(random() * 30)::int,  -- score_health
    60 + floor(random() * 30)::int,  -- score_luck
    CASE floor(random() * 5)::int
        WHEN 0 THEN 'Energik'
        WHEN 1 THEN 'Romantis'
        WHEN 2 THEN 'Produktif'
        WHEN 3 THEN 'Tenang'
        ELSE 'Bahagia'
    END,
    CASE floor(random() * 5)::int
        WHEN 0 THEN '⚡'
        WHEN 1 THEN '💕'
        WHEN 2 THEN '💼'
        WHEN 3 THEN '😌'
        ELSE '😊'
    END
FROM zodiac_signs
ON CONFLICT (sign_code, date) DO NOTHING;

-- ============================================
-- HELPER FUNCTION: Generate Daily Horoscope
-- Jalankan function ini setiap hari via cron job
-- ============================================

CREATE OR REPLACE FUNCTION generate_daily_horoscope()
RETURNS void AS $$
DECLARE
    z RECORD;
BEGIN
    FOR z IN SELECT * FROM zodiac_signs LOOP
        INSERT INTO daily_horoscope (sign_code, date, prediction, lucky_number, lucky_color, lucky_time, score_love, score_career, score_health, score_luck, mood, mood_emoji)
        VALUES (
            z.sign_code,
            CURRENT_DATE,
            jsonb_build_object(
                'personal', 'Hari yang penuh energi untuk ' || z.name || '. Manfaatkan momentum ini dengan bijak.',
                'love', 'Hubungan romantis membutuhkan perhatian ekstra. Tunjukkan kasih sayang pada orang tersayang.',
                'profession', 'Fokus pada target karir Anda. Peluang baru mungkin muncul dari arah yang tidak terduga.',
                'health', 'Jaga kesehatan dengan pola makan seimbang dan istirahat yang cukup.'
            ),
            (floor(random() * 30) + 1)::text || ', ' || (floor(random() * 30) + 1)::text || ', ' || (floor(random() * 30) + 1)::text,
            CASE floor(random() * 7)::int
                WHEN 0 THEN 'Merah'
                WHEN 1 THEN 'Biru'
                WHEN 2 THEN 'Hijau'
                WHEN 3 THEN 'Emas'
                WHEN 4 THEN 'Ungu'
                WHEN 5 THEN 'Pink'
                ELSE 'Perak'
            END,
            (floor(random() * 12) + 6)::text || ':00 - ' || (floor(random() * 12) + 7)::text || ':00',
            60 + floor(random() * 30)::int,
            60 + floor(random() * 30)::int,
            60 + floor(random() * 30)::int,
            60 + floor(random() * 30)::int,
            CASE floor(random() * 5)::int
                WHEN 0 THEN 'Energik'
                WHEN 1 THEN 'Romantis'
                WHEN 2 THEN 'Produktif'
                WHEN 3 THEN 'Tenang'
                ELSE 'Bahagia'
            END,
            CASE floor(random() * 5)::int
                WHEN 0 THEN '⚡'
                WHEN 1 THEN '💕'
                WHEN 2 THEN '💼'
                WHEN 3 THEN '😌'
                ELSE '😊'
            END
        )
        ON CONFLICT (sign_code, date) DO UPDATE
        SET
            prediction = EXCLUDED.prediction,
            lucky_number = EXCLUDED.lucky_number,
            lucky_color = EXCLUDED.lucky_color,
            lucky_time = EXCLUDED.lucky_time,
            score_love = EXCLUDED.score_love,
            score_career = EXCLUDED.score_career,
            score_health = EXCLUDED.score_health,
            score_luck = EXCLUDED.score_luck,
            mood = EXCLUDED.mood,
            mood_emoji = EXCLUDED.mood_emoji,
            updated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONE!
-- ============================================
-- Untuk menggunakan:
-- 1. Buat project di supabase.com
-- 2. Copy URL dan anon key
-- 3. Jalankan SQL ini di SQL Editor
-- 4. Update api-config.js dengan kredensial Anda
-- ============================================

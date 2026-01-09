/**
 * Zodiakku - Main Quiz Application
 * Aplikasi ramalan zodiak harian dengan integrasi Supabase
 */

class ZodiakQuiz {
    constructor() {
        // DOM Elements
        this.form = document.getElementById('zodiacForm');
        this.loadingEl = document.getElementById('loading');
        this.resultEl = document.getElementById('result');
        this.errorEl = document.getElementById('error');
        this.tanggalSelect = document.getElementById('tanggal');
        this.tahunSelect = document.getElementById('tahun');
        this.btnBack = document.getElementById('btnBack');
        this.btnRetry = document.getElementById('btnRetry');

        // State
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        debugLog('Initializing ZodiakQuiz...');

        // Wait for content service to initialize first
        try {
            const shouldContinue = await contentService.init();
            if (!shouldContinue) {
                debugLog('Content service stopped initialization (redirect/maintenance)');
                return;
            }
        } catch (error) {
            debugLog('Content service init error, continuing with fallback:', error);
        }

        // Setup UI
        this.populateDates();
        this.populateYears();
        this.setupEventListeners();
        this.setupMobileEnhancements();

        this.isInitialized = true;
        debugLog('ZodiakQuiz initialized successfully');
    }

    /**
     * Populate date dropdown
     */
    populateDates() {
        if (!this.tanggalSelect) return;

        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            this.tanggalSelect.appendChild(option);
        }
    }

    /**
     * Populate year dropdown (1900-2050, descending)
     */
    populateYears() {
        if (!this.tahunSelect) return;

        for (let i = 2050; i >= 1900; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            this.tahunSelect.appendChild(option);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        if (this.btnBack) {
            this.btnBack.addEventListener('click', () => this.resetForm());
        }
        if (this.btnRetry) {
            this.btnRetry.addEventListener('click', () => this.resetForm());
        }

        // Limit name input to 100 characters
        const namaInput = document.getElementById('nama');
        if (namaInput) {
            namaInput.addEventListener('input', (e) => {
                if (e.target.value.length > 100) {
                    e.target.value = e.target.value.slice(0, 100);
                }
            });
        }
    }

    /**
     * Mobile enhancements for WebView
     */
    setupMobileEnhancements() {
        // Prevent double-tap zoom on buttons
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.click();
            });
        });

        // Fix for iOS keyboard pushing content
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        });

        // Prevent pull-to-refresh on Android WebView
        document.body.addEventListener('touchmove', (e) => {
            if (document.body.scrollTop === 0 && e.touches[0].clientY > 0) {
                // Allow normal scrolling
            }
        }, { passive: true });

        // Handle Android back button in WebView
        if (window.history && window.history.pushState) {
            window.addEventListener('popstate', () => {
                if (this.resultEl && !this.resultEl.classList.contains('hidden')) {
                    this.resetForm();
                }
            });
        }

        // Vibration feedback on button press (if supported)
        document.querySelectorAll('.btn-submit, .btn-back, .btn-retry').forEach(btn => {
            btn.addEventListener('touchstart', () => {
                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }
            });
        });
    }

    /**
     * Get zodiac sign from birth date
     */
    getZodiacSign(day, month) {
        const zodiacDates = [
            { sign: 'capricorn', startMonth: 1, startDay: 1, endMonth: 1, endDay: 19 },
            { sign: 'aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
            { sign: 'pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
            { sign: 'aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
            { sign: 'taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
            { sign: 'gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
            { sign: 'cancer', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
            { sign: 'leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
            { sign: 'virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
            { sign: 'libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
            { sign: 'scorpio', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
            { sign: 'sagittarius', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
            { sign: 'capricorn', startMonth: 12, startDay: 22, endMonth: 12, endDay: 31 }
        ];

        for (const zodiac of zodiacDates) {
            if (month === zodiac.startMonth && day >= zodiac.startDay) {
                return zodiac.sign;
            }
            if (month === zodiac.endMonth && day <= zodiac.endDay) {
                return zodiac.sign;
            }
        }

        return 'aries'; // fallback
    }

    /**
     * Handle form submission
     */
    async handleSubmit(e) {
        e.preventDefault();

        const nama = document.getElementById('nama').value.trim();
        const tanggal = parseInt(document.getElementById('tanggal').value);
        const bulan = parseInt(document.getElementById('bulan').value);
        const tahun = parseInt(document.getElementById('tahun').value);

        if (!nama || !tanggal || !bulan || !tahun) {
            this.showError('Mohon lengkapi semua data');
            return;
        }

        if (nama.length > 100) {
            this.showError('Nama maksimal 100 karakter');
            return;
        }

        // Get zodiac sign
        const zodiacSign = this.getZodiacSign(tanggal, bulan);

        // Show loading
        this.form.classList.add('hidden');
        this.loadingEl.classList.remove('hidden');
        this.resultEl.classList.add('hidden');
        this.errorEl.classList.add('hidden');

        try {
            // Get horoscope data from content service
            let horoscopeData = await contentService.loadHoroscope(zodiacSign);

            if (!horoscopeData) {
                // Use fallback data
                horoscopeData = this.generateFallbackHoroscope(zodiacSign);
            }

            this.displayResult(nama, zodiacSign, horoscopeData);
        } catch (error) {
            console.error('Error:', error);
            // Try fallback on error
            const fallbackData = this.generateFallbackHoroscope(zodiacSign);
            this.displayResult(nama, zodiacSign, fallbackData);
        }
    }

    /**
     * Generate fallback horoscope from local data
     */
    generateFallbackHoroscope(sign) {
        const prediction = window.HOROSCOPE_PREDICTIONS?.[sign] || window.HOROSCOPE_PREDICTIONS?.aries;

        if (!prediction) {
            return {
                prediction: {
                    personal: 'Hari yang baik untuk meraih impian Anda.',
                    love: 'Hubungan Anda dipenuhi keharmonisan.',
                    profession: 'Peluang karir dan finansial terbuka lebar.',
                    health: 'Jaga kesehatan dengan pola hidup seimbang.'
                },
                lucky_number: '7, 14, 21',
                lucky_color: 'Biru',
                lucky_time: '10:00 - 12:00'
            };
        }

        return {
            sign_code: sign,
            date: new Date().toISOString().split('T')[0],
            prediction: {
                personal: prediction.personal,
                love: prediction.love,
                profession: prediction.profession,
                health: prediction.health
            },
            lucky_number: prediction.lucky_number,
            lucky_color: prediction.lucky_color,
            lucky_time: prediction.lucky_time
        };
    }

    /**
     * Display result
     */
    displayResult(nama, sign, data) {
        // Get zodiac info from content service or fallback
        const zodiac = contentService.getZodiacSign(sign) || window.ZODIAC_DATA?.[sign] || {
            name: sign.charAt(0).toUpperCase() + sign.slice(1),
            icon: '⭐',
            date_range: '',
            element: ''
        };

        const prediction = data.prediction || {};

        // Update header
        document.getElementById('userName').textContent = nama;
        document.getElementById('zodiacName').textContent = zodiac.name;
        document.getElementById('zodiacDate').textContent =
            `${zodiac.date_range || zodiac.date || ''} • Elemen ${zodiac.element}`;
        document.getElementById('zodiacIcon').textContent = zodiac.icon;

        // Update horoscope cards
        document.getElementById('generalHoroscope').textContent =
            prediction.personal || prediction.general || 'Hari yang baik untuk meraih impian Anda.';
        document.getElementById('loveHoroscope').textContent =
            prediction.love || prediction.emotion || 'Hubungan Anda dipenuhi keharmonisan.';
        document.getElementById('careerHoroscope').textContent =
            prediction.profession || prediction.career || 'Peluang karir dan finansial terbuka lebar.';
        document.getElementById('healthHoroscope').textContent =
            prediction.health || 'Jaga kesehatan dengan pola hidup seimbang.';

        // Update lucky section
        document.getElementById('luckyNumber').textContent =
            data.lucky_number || this.generateLuckyNumber();
        document.getElementById('luckyColor').textContent =
            data.lucky_color || this.generateLuckyColor();
        document.getElementById('luckyTime').textContent =
            data.lucky_time || this.generateLuckyTime();

        // Show result
        this.loadingEl.classList.add('hidden');
        this.resultEl.classList.remove('hidden');

        // Add history state for back button support in WebView
        if (window.history && window.history.pushState) {
            window.history.pushState({ view: 'result' }, '', '');
        }

        // Scroll to top of result
        this.resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Helper functions
     */
    generateLuckyNumber() {
        const numbers = [];
        while (numbers.length < 3) {
            const num = Math.floor(Math.random() * 30) + 1;
            if (!numbers.includes(num)) numbers.push(num);
        }
        return numbers.sort((a, b) => a - b).join(', ');
    }

    generateLuckyColor() {
        const colors = ['Biru', 'Merah', 'Hijau', 'Emas', 'Ungu', 'Perak', 'Orange', 'Pink'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    generateLuckyTime() {
        const times = ['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '19:00 - 21:00'];
        return times[Math.floor(Math.random() * times.length)];
    }

    /**
     * Show error
     */
    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        this.form.classList.add('hidden');
        this.loadingEl.classList.add('hidden');
        this.resultEl.classList.add('hidden');
        this.errorEl.classList.remove('hidden');
    }

    /**
     * Reset form
     */
    resetForm() {
        this.form.reset();
        this.form.classList.remove('hidden');
        this.loadingEl.classList.add('hidden');
        this.resultEl.classList.add('hidden');
        this.errorEl.classList.add('hidden');
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.zodiakQuiz = new ZodiakQuiz();
    window.zodiakQuiz.init();
});

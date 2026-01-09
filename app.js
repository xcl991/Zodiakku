// Zodiakku - Daily Zodiac Horoscope App
// Configuration
const API_CONFIG = {
    // Backend API endpoint (when running with server.js)
    backendUrl: '/api/horoscope',
    // Direct API (fallback, may have CORS issues)
    tokenUrl: 'https://api.prokerala.com/token',
    horoscopeUrl: 'https://api.prokerala.com/v2/horoscope/daily/advanced',
    clientId: '772282e4-8723-4b41-b656-f42c25a2d834',
    clientSecret: 'fnttcHzQgdD0HOYwmBSEQYvzRNBUl6pw3kektgJ6'
};

// Zodiac Data
const ZODIAC_DATA = {
    aries: { name: 'Aries', icon: '♈', date: '21 Mar - 19 Apr', element: 'Api' },
    taurus: { name: 'Taurus', icon: '♉', date: '20 Apr - 20 Mei', element: 'Tanah' },
    gemini: { name: 'Gemini', icon: '♊', date: '21 Mei - 20 Jun', element: 'Udara' },
    cancer: { name: 'Cancer', icon: '♋', date: '21 Jun - 22 Jul', element: 'Air' },
    leo: { name: 'Leo', icon: '♌', date: '23 Jul - 22 Agu', element: 'Api' },
    virgo: { name: 'Virgo', icon: '♍', date: '23 Agu - 22 Sep', element: 'Tanah' },
    libra: { name: 'Libra', icon: '♎', date: '23 Sep - 22 Okt', element: 'Udara' },
    scorpio: { name: 'Scorpio', icon: '♏', date: '23 Okt - 21 Nov', element: 'Air' },
    sagittarius: { name: 'Sagittarius', icon: '♐', date: '22 Nov - 21 Des', element: 'Api' },
    capricorn: { name: 'Capricorn', icon: '♑', date: '22 Des - 19 Jan', element: 'Tanah' },
    aquarius: { name: 'Aquarius', icon: '♒', date: '20 Jan - 18 Feb', element: 'Udara' },
    pisces: { name: 'Pisces', icon: '♓', date: '19 Feb - 20 Mar', element: 'Air' }
};

// DOM Elements
const form = document.getElementById('zodiacForm');
const loadingEl = document.getElementById('loading');
const resultEl = document.getElementById('result');
const errorEl = document.getElementById('error');
const tanggalSelect = document.getElementById('tanggal');
const btnBack = document.getElementById('btnBack');
const btnRetry = document.getElementById('btnRetry');

// State
let accessToken = null;
let tokenExpiry = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    populateDates();
    setupEventListeners();
    setupMobileEnhancements();
});

// Mobile enhancements for WebView
function setupMobileEnhancements() {
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
            if (!resultEl.classList.contains('hidden')) {
                resetForm();
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

// Populate date dropdown
function populateDates() {
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        tanggalSelect.appendChild(option);
    }
}

// Setup event listeners
function setupEventListeners() {
    form.addEventListener('submit', handleSubmit);
    btnBack.addEventListener('click', resetForm);
    btnRetry.addEventListener('click', resetForm);
}

// Get zodiac sign from birth date
function getZodiacSign(day, month) {
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

// Get access token
async function getAccessToken() {
    // Check if we have a valid token
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    try {
        const response = await fetch(API_CONFIG.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: API_CONFIG.clientId,
                client_secret: API_CONFIG.clientSecret
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get access token');
        }

        const data = await response.json();
        accessToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Expire 1 minute early
        return accessToken;
    } catch (error) {
        console.error('Token error:', error);
        throw new Error('Gagal mendapatkan akses ke layanan ramalan');
    }
}

// Check if running from file:// protocol (local file)
function isLocalFile() {
    return window.location.protocol === 'file:';
}

// Fetch horoscope - try backend first, then direct API, then fallback
async function fetchHoroscope(sign) {
    // If running from file://, skip API calls and use fallback directly
    if (isLocalFile()) {
        console.log('Running from local file, using offline horoscope data');
        return null; // Will trigger fallback in handleSubmit
    }

    // Try backend API first (more secure, handles CORS)
    try {
        const backendResponse = await fetch(`${API_CONFIG.backendUrl}/${sign}`);
        if (backendResponse.ok) {
            console.log('Using backend API');
            return await backendResponse.json();
        }
    } catch (backendError) {
        console.log('Backend not available, trying direct API:', backendError.message);
    }

    // Fallback to direct API call
    try {
        const token = await getAccessToken();
        const today = new Date().toISOString().split('T')[0];

        const url = new URL(API_CONFIG.horoscopeUrl);
        url.searchParams.append('sign', sign);
        url.searchParams.append('datetime', today);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
            throw new Error('Gagal mengambil data ramalan');
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Zodiac-specific horoscope predictions
const HOROSCOPE_PREDICTIONS = {
    aries: {
        personal: 'Energi Mars memberi Anda dorongan kuat hari ini. Keberanian dan semangat juang Anda akan membawa kesuksesan dalam setiap langkah. Jangan ragu untuk mengambil inisiatif.',
        love: 'Gairah romantis sedang membara. Jika single, ada kemungkinan bertemu seseorang yang menarik. Bagi yang sudah berpasangan, ciptakan momen romantis bersama.',
        profession: 'Kepemimpinan Anda diakui di tempat kerja. Peluang promosi atau proyek baru menanti. Keuangan stabil, namun hindari pengeluaran impulsif.',
        health: 'Energi fisik melimpah. Salurkan melalui olahraga intens seperti lari atau gym. Waspadai sakit kepala akibat stres.',
        lucky_number: '1, 9, 17',
        lucky_color: 'Merah',
        lucky_time: '09:00 - 11:00'
    },
    taurus: {
        personal: 'Venus memberkati Anda dengan ketenangan dan stabilitas. Hari yang sempurna untuk menikmati keindahan hidup dan fokus pada kenyamanan diri.',
        love: 'Hubungan berkembang dengan landasan yang kuat. Kesetiaan dan kasih sayang menjadi fondasi. Ekspresikan cinta melalui tindakan nyata.',
        profession: 'Ketekunan Anda membuahkan hasil finansial. Investasi jangka panjang menguntungkan. Hindari keputusan keuangan yang terburu-buru.',
        health: 'Fokus pada nutrisi dan pola makan sehat. Tenggorokan dan leher perlu perhatian ekstra. Yoga atau meditasi sangat bermanfaat.',
        lucky_number: '2, 6, 24',
        lucky_color: 'Hijau',
        lucky_time: '14:00 - 16:00'
    },
    gemini: {
        personal: 'Merkurius meningkatkan kemampuan komunikasi Anda. Pikiran cemerlang dan ide-ide kreatif bermunculan. Waktu yang tepat untuk belajar hal baru.',
        love: 'Komunikasi adalah kunci. Bicarakan apa yang ada di hati dengan pasangan. Bagi yang single, percakapan menarik bisa memicu ketertarikan.',
        profession: 'Networking membawa peluang baru. Presentasi dan negosiasi berjalan lancar. Diversifikasi sumber penghasilan bisa menguntungkan.',
        health: 'Sistem saraf butuh perhatian. Kurangi kafein dan screen time. Aktivitas yang menstimulasi pikiran seperti puzzle sangat baik.',
        lucky_number: '3, 5, 14',
        lucky_color: 'Kuning',
        lucky_time: '10:00 - 12:00'
    },
    cancer: {
        personal: 'Bulan membimbing emosi Anda dengan lembut. Intuisi sangat kuat hari ini. Percayai perasaan dan naluri dalam mengambil keputusan penting.',
        love: 'Keluarga dan rumah tangga menjadi prioritas. Ciptakan suasana hangat di rumah. Hubungan romantis dipenuhi kelembutan dan pengertian.',
        profession: 'Kreativitas Anda dihargai. Proyek yang melibatkan perasaan akan sukses. Keuangan stabil, fokus pada tabungan keluarga.',
        health: 'Perhatikan sistem pencernaan. Makanan rumahan lebih baik dari jajan di luar. Berenang atau jalan kaki di tepi air menyegarkan.',
        lucky_number: '2, 7, 21',
        lucky_color: 'Perak',
        lucky_time: '18:00 - 20:00'
    },
    leo: {
        personal: 'Matahari bersinar terang untuk Anda. Karisma dan kepercayaan diri memancar. Jadilah pusat perhatian dan inspirasilah orang lain dengan semangat Anda.',
        love: 'Romansa penuh gairah dan drama positif. Tunjukkan kasih sayang dengan cara yang megah. Pasangan mengagumi keberanian dan kehangatan Anda.',
        profession: 'Pengakuan atas kerja keras tiba. Posisi kepemimpinan semakin mantap. Keuangan kuat, cocok untuk investasi bergengsi.',
        health: 'Jantung dan punggung perlu perhatian. Olahraga yang menyenangkan seperti dansa sangat cocok. Jangan lupa berjemur untuk vitamin D.',
        lucky_number: '1, 4, 19',
        lucky_color: 'Emas',
        lucky_time: '12:00 - 14:00'
    },
    virgo: {
        personal: 'Merkurius mempertajam analisis Anda. Detail kecil tidak luput dari perhatian. Hari yang produktif untuk menyelesaikan tugas-tugas rumit.',
        love: 'Tunjukkan cinta melalui perhatian pada detail. Pasangan menghargai kepedulian Anda. Komunikasi praktis memperkuat hubungan.',
        profession: 'Ketelitian membawa kesuksesan. Proyek yang membutuhkan presisi berjalan lancar. Kelola keuangan dengan spreadsheet dan perencanaan matang.',
        health: 'Sistem pencernaan sensitif. Pilih makanan organik dan bersih. Rutinitas olahraga teratur lebih baik dari yang sporadis.',
        lucky_number: '5, 14, 23',
        lucky_color: 'Navy',
        lucky_time: '08:00 - 10:00'
    },
    libra: {
        personal: 'Venus membawa harmoni dan keseimbangan. Apresiasi terhadap keindahan meningkat. Hari yang sempurna untuk menata ulang kehidupan.',
        love: 'Kesetaraan dan saling menghargai menjadi tema. Hubungan berkembang indah dengan kompromi. Keputusan bersama memperkuat ikatan.',
        profession: 'Kolaborasi dan kemitraan membawa sukses. Negosiasi berjalan adil. Investasi di bidang seni atau fashion menguntungkan.',
        health: 'Ginjal dan punggung bawah butuh perhatian. Keseimbangan dalam segala hal termasuk diet. Yoga dan pilates sangat bermanfaat.',
        lucky_number: '6, 15, 24',
        lucky_color: 'Pink',
        lucky_time: '16:00 - 18:00'
    },
    scorpio: {
        personal: 'Pluto memberi kekuatan transformatif. Waktu untuk melepas yang lama dan menyambut yang baru. Kedalaman emosi menjadi sumber kekuatan.',
        love: 'Intensitas emosional mendalam. Kepercayaan dan kesetiaan mutlak dalam hubungan. Rahasia yang dibagi memperkuat ikatan.',
        profession: 'Penelitian dan investigasi sukses. Kemampuan melihat yang tersembunyi membawa keuntungan. Investasi jangka panjang menguntungkan.',
        health: 'Sistem reproduksi dan eliminasi perlu perhatian. Detoks tubuh dan pikiran bermanfaat. Terapi air seperti berendam sangat menyegarkan.',
        lucky_number: '8, 11, 22',
        lucky_color: 'Maroon',
        lucky_time: '22:00 - 00:00'
    },
    sagittarius: {
        personal: 'Jupiter membawa keberuntungan dan ekspansi. Petualangan dan pembelajaran baru menanti. Optimisme Anda menular ke orang sekitar.',
        love: 'Kebebasan dalam hubungan penting. Petualangan bersama memperkuat ikatan. Bagi yang single, perjalanan bisa membawa cinta baru.',
        profession: 'Peluang internasional atau pendidikan muncul. Visi besar membawa kesuksesan. Investasi di pendidikan atau travel menguntungkan.',
        health: 'Paha dan pinggul butuh perhatian. Olahraga outdoor seperti hiking sangat cocok. Jaga postur saat duduk lama.',
        lucky_number: '3, 9, 12',
        lucky_color: 'Ungu',
        lucky_time: '15:00 - 17:00'
    },
    capricorn: {
        personal: 'Saturnus memberi disiplin dan fokus. Ambisi mendorong Anda mencapai puncak. Kerja keras dan ketekunan membuahkan hasil nyata.',
        love: 'Komitmen jangka panjang menjadi prioritas. Hubungan dibangun dengan fondasi kuat. Kesabaran dalam cinta membawa kebahagiaan.',
        profession: 'Karir menanjak stabil. Tanggung jawab baru menunjukkan kepercayaan atasan. Investasi properti atau bisnis tradisional menguntungkan.',
        health: 'Tulang dan kulit perlu perhatian. Suplemen kalsium dan kolagen bermanfaat. Jangan abaikan waktu istirahat demi kerja.',
        lucky_number: '4, 8, 22',
        lucky_color: 'Cokelat',
        lucky_time: '06:00 - 08:00'
    },
    aquarius: {
        personal: 'Uranus memicu inovasi dan originalitas. Ide-ide revolusioner bermunculan. Waktu untuk menjadi berbeda dan membuat perubahan.',
        love: 'Persahabatan adalah dasar romansa. Hubungan yang tidak konvensional bisa berkembang indah. Hormati keunikan masing-masing.',
        profession: 'Teknologi dan inovasi membawa sukses. Startup atau proyek sosial menguntungkan. Investasi di bidang teknologi menjanjikan.',
        health: 'Pergelangan kaki dan sirkulasi darah perlu perhatian. Olahraga yang tidak biasa seperti trampolin menyenangkan. Jaga hidrasi.',
        lucky_number: '7, 11, 29',
        lucky_color: 'Biru Elektrik',
        lucky_time: '11:00 - 13:00'
    },
    pisces: {
        personal: 'Neptunus meningkatkan intuisi dan imajinasi. Kreativitas mengalir tanpa batas. Waktu yang sempurna untuk seni, musik, atau spiritual.',
        love: 'Romantisme seperti dalam mimpi. Koneksi jiwa yang dalam dengan pasangan. Bagi yang single, cinta bisa datang dari tempat tak terduga.',
        profession: 'Karir kreatif atau healing berkembang. Intuisi membimbing keputusan bisnis. Investasi di seni atau kesehatan alternatif menguntungkan.',
        health: 'Kaki dan sistem limfatik butuh perhatian. Berenang sangat bermanfaat. Meditasi dan tidur yang cukup menyeimbangkan energi.',
        lucky_number: '3, 7, 12',
        lucky_color: 'Aquamarine',
        lucky_time: '20:00 - 22:00'
    }
};

// Generate fallback horoscope (when API is unavailable)
function generateFallbackHoroscope(sign, userName) {
    const prediction = HOROSCOPE_PREDICTIONS[sign] || HOROSCOPE_PREDICTIONS.aries;

    return {
        data: {
            prediction: {
                personal: prediction.personal,
                love: prediction.love,
                profession: prediction.profession,
                health: prediction.health
            },
            lucky_number: prediction.lucky_number,
            lucky_color: prediction.lucky_color,
            lucky_time: prediction.lucky_time
        }
    };
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    const nama = document.getElementById('nama').value.trim();
    const tanggal = parseInt(document.getElementById('tanggal').value);
    const bulan = parseInt(document.getElementById('bulan').value);
    const tahun = parseInt(document.getElementById('tahun').value);

    if (!nama || !tanggal || !bulan || !tahun) {
        showError('Mohon lengkapi semua data');
        return;
    }

    if (nama.length > 100) {
        showError('Nama maksimal 100 karakter');
        return;
    }

    if (tahun < 1900 || tahun > 2026) {
        showError('Tahun harus antara 1900 - 2026');
        return;
    }

    // Get zodiac sign
    const zodiacSign = getZodiacSign(tanggal, bulan);

    // Show loading
    form.classList.add('hidden');
    loadingEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    errorEl.classList.add('hidden');

    try {
        // Try to fetch from API first
        let horoscopeData;
        try {
            horoscopeData = await fetchHoroscope(zodiacSign);
            // If null returned (local file mode), use fallback
            if (!horoscopeData) {
                horoscopeData = generateFallbackHoroscope(zodiacSign, nama);
            }
        } catch (apiError) {
            console.log('API unavailable, using fallback:', apiError);
            // Use fallback horoscope if API fails
            horoscopeData = generateFallbackHoroscope(zodiacSign, nama);
        }

        displayResult(nama, zodiacSign, horoscopeData);
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Terjadi kesalahan. Silakan coba lagi.');
    }
}

// Display result
function displayResult(nama, sign, data) {
    const zodiac = ZODIAC_DATA[sign];
    const prediction = data.data?.prediction || data.prediction || {};

    // Update header
    document.getElementById('userName').textContent = nama;
    document.getElementById('zodiacName').textContent = zodiac.name;
    document.getElementById('zodiacDate').textContent = `${zodiac.date} • Elemen ${zodiac.element}`;
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
    const luckyData = data.data || data;
    document.getElementById('luckyNumber').textContent =
        luckyData.lucky_number || luckyData.luckyNumber || generateLuckyNumber();
    document.getElementById('luckyColor').textContent =
        translateColor(luckyData.lucky_color || luckyData.luckyColor) || generateLuckyColor();
    document.getElementById('luckyTime').textContent =
        luckyData.lucky_time || luckyData.luckyTime || generateLuckyTime();

    // Show result
    loadingEl.classList.add('hidden');
    resultEl.classList.remove('hidden');

    // Add history state for back button support in WebView
    if (window.history && window.history.pushState) {
        window.history.pushState({ view: 'result' }, '', '');
    }

    // Scroll to top of result
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Helper functions
function generateLuckyNumber() {
    const numbers = [];
    while (numbers.length < 3) {
        const num = Math.floor(Math.random() * 30) + 1;
        if (!numbers.includes(num)) numbers.push(num);
    }
    return numbers.sort((a, b) => a - b).join(', ');
}

function generateLuckyColor() {
    const colors = ['Biru', 'Merah', 'Hijau', 'Emas', 'Ungu', 'Perak', 'Orange', 'Pink'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function generateLuckyTime() {
    const times = ['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '19:00 - 21:00'];
    return times[Math.floor(Math.random() * times.length)];
}

function translateColor(color) {
    if (!color) return null;
    const colorMap = {
        'red': 'Merah',
        'blue': 'Biru',
        'green': 'Hijau',
        'yellow': 'Kuning',
        'gold': 'Emas',
        'silver': 'Perak',
        'purple': 'Ungu',
        'orange': 'Oranye',
        'pink': 'Pink',
        'white': 'Putih',
        'black': 'Hitam',
        'brown': 'Cokelat'
    };
    return colorMap[color.toLowerCase()] || color;
}

// Show error
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    form.classList.add('hidden');
    loadingEl.classList.add('hidden');
    resultEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
}

// Reset form
function resetForm() {
    form.reset();
    form.classList.remove('hidden');
    loadingEl.classList.add('hidden');
    resultEl.classList.add('hidden');
    errorEl.classList.add('hidden');
}

// Zodiakku Backend Server
// Handles secure API calls to Prokerala

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// API Configuration (in production, use environment variables)
const API_CONFIG = {
    tokenUrl: 'https://api.prokerala.com/token',
    horoscopeUrl: 'https://api.prokerala.com/v2/horoscope/daily/advanced',
    clientId: process.env.PROKERALA_CLIENT_ID || '772282e4-8723-4b41-b656-f42c25a2d834',
    clientSecret: process.env.PROKERALA_CLIENT_SECRET || 'fnttcHzQgdD0HOYwmBSEQYvzRNBUl6pw3kektgJ6'
};

// Token cache
let accessToken = null;
let tokenExpiry = null;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Get access token
async function getAccessToken() {
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
            const error = await response.text();
            console.error('Token error response:', error);
            throw new Error('Failed to get access token');
        }

        const data = await response.json();
        accessToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
        console.log('Access token obtained successfully');
        return accessToken;
    } catch (error) {
        console.error('Token error:', error);
        throw error;
    }
}

// API Routes
app.get('/api/horoscope/:sign', async (req, res) => {
    const { sign } = req.params;
    const validSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

    if (!validSigns.includes(sign.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid zodiac sign' });
    }

    try {
        const token = await getAccessToken();
        const today = new Date().toISOString().split('T')[0];

        const url = new URL(API_CONFIG.horoscopeUrl);
        url.searchParams.append('sign', sign.toLowerCase());
        url.searchParams.append('datetime', today);

        console.log('Fetching horoscope for:', sign, 'URL:', url.toString());

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Horoscope API error:', response.status, errorText);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Horoscope fetch error:', error);
        // Return fallback data if API fails
        res.json(generateFallbackHoroscope(sign));
    }
});

// Fallback horoscope generator
function generateFallbackHoroscope(sign) {
    const predictions = {
        aries: {
            personal: 'Energi Anda sedang tinggi hari ini. Gunakan untuk memulai proyek baru atau menyelesaikan tugas yang tertunda. Keberanian alami Anda akan membawa kesuksesan.',
            love: 'Romantisme sedang bersemi. Ungkapkan perasaan Anda dengan tulus kepada orang yang Anda sayangi.',
            profession: 'Peluang karir terbuka lebar. Ambil inisiatif dan tunjukkan kemampuan kepemimpinan Anda.',
            health: 'Kondisi fisik prima. Tetap aktif dan jangan lupa istirahat yang cukup.'
        },
        taurus: {
            personal: 'Hari yang stabil dan produktif menanti Anda. Fokus pada hal-hal yang memberikan keamanan dan kenyamanan.',
            love: 'Hubungan membutuhkan perhatian ekstra. Tunjukkan kasih sayang melalui tindakan nyata.',
            profession: 'Keuangan dalam kondisi baik. Ini waktu yang tepat untuk investasi jangka panjang.',
            health: 'Perhatikan pola makan Anda. Pilih makanan yang bergizi untuk menjaga energi.'
        },
        gemini: {
            personal: 'Pikiran Anda penuh dengan ide-ide cemerlang. Komunikasikan gagasan Anda kepada orang lain.',
            love: 'Komunikasi adalah kunci. Bicarakan apa yang ada di hati Anda dengan pasangan.',
            profession: 'Networking membawa keberuntungan. Jalin koneksi baru yang bermanfaat untuk karir.',
            health: 'Jaga kesehatan mental dengan aktivitas yang menyenangkan.'
        },
        cancer: {
            personal: 'Intuisi Anda sangat kuat hari ini. Percayalah pada perasaan dan naluri Anda.',
            love: 'Keluarga dan rumah tangga menjadi prioritas. Ciptakan momen kebersamaan yang bermakna.',
            profession: 'Kreativitas Anda dihargai di tempat kerja. Jangan ragu untuk berbagi ide.',
            health: 'Emosi mempengaruhi kesehatan. Luangkan waktu untuk relaksasi.'
        },
        leo: {
            personal: 'Karisma Anda bersinar terang. Jadilah pemimpin yang menginspirasi orang lain.',
            love: 'Romansa penuh gairah menanti. Buat momen spesial untuk orang tersayang.',
            profession: 'Pengakuan atas kerja keras Anda akan datang. Tetap percaya diri.',
            health: 'Energi melimpah. Salurkan melalui olahraga atau aktivitas kreatif.'
        },
        virgo: {
            personal: 'Detail menjadi kekuatan Anda. Gunakan ketelitian untuk menyempurnakan pekerjaan.',
            love: 'Tunjukkan perhatian melalui hal-hal kecil. Pasangan menghargai ketulusan Anda.',
            profession: 'Organisasi dan perencanaan membawa kesuksesan. Tetap fokus pada target.',
            health: 'Kesehatan membaik dengan rutinitas teratur. Jaga pola tidur.'
        },
        libra: {
            personal: 'Harmoni dan keseimbangan menjadi tema hari ini. Cari titik tengah dalam setiap situasi.',
            love: 'Hubungan berkembang positif. Kesetaraan dan saling menghargai memperkuat ikatan.',
            profession: 'Kolaborasi membawa hasil terbaik. Bekerja sama dengan tim.',
            health: 'Keseimbangan fisik dan mental penting. Coba yoga atau meditasi.'
        },
        scorpio: {
            personal: 'Transformasi positif sedang terjadi. Lepaskan yang lama, sambut yang baru.',
            love: 'Kedalaman emosi memperkuat hubungan. Berbagi rahasia membangun kepercayaan.',
            profession: 'Intuisi bisnis tajam. Percaya pada insting Anda dalam pengambilan keputusan.',
            health: 'Pemulihan dan regenerasi. Tubuh Anda membutuhkan waktu untuk memulihkan energi.'
        },
        sagittarius: {
            personal: 'Petualangan dan eksplorasi mewarnai hari Anda. Tetap optimis menghadapi tantangan.',
            love: 'Kebebasan dalam hubungan penting. Hormati ruang pribadi masing-masing.',
            profession: 'Peluang dari luar negeri atau pendidikan muncul. Kembangkan wawasan.',
            health: 'Aktivitas outdoor menyegarkan. Nikmati alam dan udara segar.'
        },
        capricorn: {
            personal: 'Ambisi dan kerja keras membuahkan hasil. Tetap tekun menuju tujuan.',
            love: 'Komitmen menjadi fondasi kuat. Bangun masa depan bersama dengan perencanaan matang.',
            profession: 'Karir meningkat stabil. Tanggung jawab baru menunjukkan kepercayaan atasan.',
            health: 'Jangan abaikan kesehatan demi pekerjaan. Seimbangkan kerja dan istirahat.'
        },
        aquarius: {
            personal: 'Inovasi dan originalitas menjadi kekuatan. Berani berbeda dan unik.',
            love: 'Persahabatan berkembang menjadi lebih. Hubungan dibangun atas dasar pertemanan.',
            profession: 'Teknologi dan ide baru membawa kemajuan. Eksperimen dengan cara kerja baru.',
            health: 'Kesehatan mental perlu perhatian. Bergabung dengan komunitas yang positif.'
        },
        pisces: {
            personal: 'Imajinasi dan kreativitas mengalir deras. Wujudkan mimpi menjadi kenyataan.',
            love: 'Romantisme penuh puisi. Ungkapkan cinta dengan cara yang artistik.',
            profession: 'Karir seni dan kreatif berkembang. Intuisi membimbing keputusan bisnis.',
            health: 'Koneksi spiritual memperkuat kesehatan. Meditasi dan doa membawa ketenangan.'
        }
    };

    const luckyNumbers = ['3, 7, 12', '5, 9, 21', '2, 8, 16', '4, 11, 22', '1, 6, 18', '7, 14, 28'];
    const luckyColors = ['Biru', 'Emas', 'Hijau', 'Merah', 'Ungu', 'Perak'];
    const luckyTimes = ['09:00 - 11:00', '14:00 - 16:00', '18:00 - 20:00', '10:00 - 12:00'];

    const randomIndex = Math.floor(Math.random() * luckyNumbers.length);
    const prediction = predictions[sign.toLowerCase()] || predictions.aries;

    return {
        data: {
            prediction: prediction,
            lucky_number: luckyNumbers[randomIndex],
            lucky_color: luckyColors[randomIndex],
            lucky_time: luckyTimes[randomIndex]
        }
    };
}

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Zodiakku server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});

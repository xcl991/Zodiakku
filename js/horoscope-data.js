/**
 * Zodiakku - Horoscope Data (Fallback)
 * Data ramalan harian lokal untuk mode offline
 */

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

// Export untuk digunakan di file lain
window.HOROSCOPE_PREDICTIONS = HOROSCOPE_PREDICTIONS;

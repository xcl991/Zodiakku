/**
 * Zodiakku - Zodiac Data (Fallback)
 * Data zodiak lokal untuk mode offline
 */

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

// Export untuk digunakan di file lain
window.ZODIAC_DATA = ZODIAC_DATA;

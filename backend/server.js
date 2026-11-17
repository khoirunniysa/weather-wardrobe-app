const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Membaca file .env
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

// Endpoint untuk mengambil cuaca dan memberikan rekomendasi outfit
app.get('/api/weather', async (req, res) => {
    const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
    if (!city) {
        return res.status(400).json({ message: 'Nama kota harus diisi' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'Konfigurasi API cuaca belum tersedia di server' });
    }

    const params = new URLSearchParams({ q: city, units: 'metric', appid: apiKey, lang: 'id' });
    const url = `https://api.openweathermap.org/data/2.5/weather?${params}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || Number(data.cod) !== 200) {
            const statusCode = response.status >= 400 && response.status < 600 ? response.status : 502;
            const message = data.message || 'Gagal mengambil data cuaca dari penyedia';
            return res.status(statusCode).json({ message });
        }

        if (!data.main || !Array.isArray(data.weather) || !data.weather[0]) {
            return res.status(502).json({ message: 'Data cuaca dari penyedia tidak lengkap' });
        }

        const condition = data.weather[0];
        const weatherId = condition.id;
        const weatherStatus = condition.main.toLowerCase();
        const temp = data.main.temp;
        let outfitRecommendation;

        if ((weatherId >= 200 && weatherId < 600) || weatherStatus.includes('rain') || weatherStatus.includes('drizzle')) {
            outfitRecommendation = "Cuaca basah atau berpotensi hujan. Gunakan jaket tahan air yang ringan, celana nyaman, dan alas kaki dengan daya cengkeram baik. Bawa payung untuk berjaga-jaga.";
        } else if (weatherId >= 600 && weatherId < 700) {
            outfitRecommendation = "Ada kemungkinan salju. Kenakan pakaian berlapis yang hangat, jaket tebal, serta sepatu tertutup yang nyaman.";
        } else if (temp < 18) {
            outfitRecommendation = "Udara cukup dingin. Pilih sweater atau jaket hangat, celana panjang, dan sepatu tertutup agar tetap nyaman.";
        } else if (temp < 25) {
            outfitRecommendation = "Udara terasa sejuk. Kaos dengan outer ringan atau crewneck, celana panjang, dan sneakers cocok untuk kondisi ini.";
        } else if (temp < 30) {
            outfitRecommendation = "Cuaca hangat. Pilih atasan berbahan ringan dan menyerap keringat dengan celana yang nyaman untuk aktivitasmu.";
        } else {
            outfitRecommendation = "Cuaca cukup panas. Kenakan pakaian longgar berbahan ringan, pilih warna yang nyaman, dan pertimbangkan topi atau pelindung matahari.";
        }

        return res.json({
            city: data.name,
            temp: temp,
            status: condition.main,
            description: condition.description,
            outfit: outfitRecommendation
        });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
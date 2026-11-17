import { useEffect, useState } from 'react';

const cityList = [
  { name: 'Jakarta', query: 'Jakarta,ID' },
  { name: 'Bandung', query: 'Bandung,ID' },
  { name: 'Surabaya', query: 'Surabaya,ID' },
  { name: 'Yogyakarta', query: 'Yogyakarta,ID' },
  { name: 'Denpasar', query: 'Denpasar,ID' },
  { name: 'Medan', query: 'Medan,ID' },
];
const WEATHER_API_URL = import.meta.env.VITE_WEATHER_API_URL || 'http://localhost:5001/api/weather';
const outfitImages = {
  jacket: ['photo-1576995853123-5a10305d93c0', 'photo-1551028719-00167b16eac5', 'photo-1556821840-3a63f95609a7'],
  hoodie: ['photo-1556821840-3a63f95609a7', 'photo-1576995853123-5a10305d93c0', 'photo-1551028719-00167b16eac5'],
  pants: ['photo-1624378439575-d8705ad7ae80', 'photo-1591195853828-11db59a44f6b', 'photo-1542272604-787c3835535d'],
  scarf: ['photo-1520903920243-00d872a2d1c9', 'photo-1551028719-00167b16eac5', 'photo-1576995853123-5a10305d93c0'],
  shoes: ['photo-1549298916-b41d501d3772', 'photo-1542291026-7eec264c27ff', 'photo-1600185365483-26d7a4cc7519'],
  shirt: ['photo-1521572163474-6864f9cf17ab', 'photo-1503342217505-b0a15ec3261c', 'photo-1529139574466-a303027c1d8b'],
};
const pages = [
  { id: 'weather', label: 'Cari cuaca' },
  { id: 'outfits', label: 'Outfit kota' },
  { id: 'guide', label: 'Panduan' },
];

async function getWeather(city, signal) {
  const params = new URLSearchParams({ city });
  const response = await fetch(`${WEATHER_API_URL}?${params}`, { signal });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Gagal mengambil cuaca untuk ${city}`);
  }

  const temperature = Number(data.temp);
  if (!Number.isFinite(temperature)) {
    throw new Error(`Data cuaca untuk ${city} tidak valid. Pastikan backend terbaru berjalan di port 5001.`);
  }

  if (!data.city || !data.status) {
    throw new Error(`Respons cuaca untuk ${city} tidak dikenali. Pastikan backend terbaru berjalan di port 5001.`);
  }

  const status = data.status;
  const description = data.description || status;
  const isRainy = /rain|drizzle|thunder|storm|hujan/i.test(`${status} ${description}`);
  const isSnowy = /snow|salju/i.test(`${status} ${description}`);
  const requestedCity = city.split(',')[0].trim().toLowerCase();
  const cityVariants = { jakarta: 0, bandung: 1, surabaya: 2, yogyakarta: 0, denpasar: 1, medan: 2 };
  const cityVariant = cityVariants[requestedCity] ?? [...requestedCity].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 3;
  const image = (type) => `https://images.unsplash.com/${outfitImages[type][cityVariant]}?auto=format&fit=crop&w=600&q=80`;
  let wardrobe;

  if (isRainy) {
    wardrobe = [
      { title: 'Jaket tahan air', description: 'Lapisan luar untuk hujan dan angin.', icon: '🧥', image: image('jacket') },
      { title: 'Celana panjang', description: 'Pilih bahan yang nyaman dan cepat kering.', icon: '👖', image: image('pants') },
      { title: 'Sepatu tertutup', description: 'Pilih sol yang tidak licin di jalan basah.', icon: '👟', image: image('shoes') },
    ];
  } else if (isSnowy || temperature < 18) {
    wardrobe = [
      { title: 'Jaket hangat', description: 'Lapisan utama untuk menjaga tubuh tetap hangat.', icon: '🧥', image: image('jacket') },
      { title: 'Sweater rajut', description: 'Lapisan dalam yang nyaman dan hangat.', icon: '🧶', image: image('hoodie') },
      { title: 'Celana panjang', description: 'Padukan dengan bahan yang cukup tebal.', icon: '👖', image: image('pants') },
      { title: 'Syal dan sepatu tertutup', description: 'Pelengkap untuk udara dingin.', icon: '🧣', image: image('scarf') },
    ];
  } else if (temperature < 27) {
    wardrobe = [
      { title: 'Kaos katun', description: 'Nyaman sebagai lapisan dasar.', icon: '👕', image: image('shirt') },
      { title: 'Hoodie atau outer ringan', description: 'Tambahkan lapisan saat udara terasa sejuk.', icon: '🧥', image: image('hoodie') },
      { title: 'Celana panjang santai', description: 'Cocok untuk kegiatan harian.', icon: '👖', image: image('pants') },
      { title: 'Sneakers', description: 'Alas kaki nyaman untuk berjalan.', icon: '👟', image: image('shoes') },
    ];
  } else {
    wardrobe = [
      { title: 'Kaos ringan', description: 'Pilih bahan yang menyerap keringat.', icon: '👕', image: image('shirt') },
      { title: 'Celana santai', description: 'Pilih potongan longgar agar tidak gerah.', icon: '👖', image: image('pants') },
      { title: 'Sneakers ringan', description: 'Nyaman dipakai untuk aktivitas harian.', icon: '👟', image: image('shoes') },
    ];
  }

  return {
    city: data.city,
    temp: temperature,
    status,
    description,
    outfit: data.outfit,
    wardrobe,
  };
}

function WeatherCard({ weather }) {
  return (
    <article className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-lg shadow-slate-950/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">{weather.city}</h3>
          <p className="mt-1 text-sm capitalize text-slate-400">{weather.description}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-indigo-300">{Math.round(weather.temp)}°C</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{weather.status}</p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-indigo-400/20 bg-indigo-400/10 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-indigo-300">Outfit yang bisa dipakai</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {weather.wardrobe.map((item, index) => (
            <div key={`${item.title}-${index}`} className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900/80">
              {item.image
                ? <img src={item.image} alt={item.title} loading="lazy" className="h-28 w-full object-cover" />
                : <div aria-hidden="true" className="flex h-28 items-center justify-center bg-slate-800 text-5xl">{item.icon}</div>}
              <div className="p-3">
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                {item.description && <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
        {weather.outfit && <p className="mt-3 text-sm leading-relaxed text-slate-300">{weather.outfit}</p>}
      </div>
    </article>
  );
}

function App() {
  const [page, setPage] = useState('weather');
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cityWeather, setCityWeather] = useState([]);
  const [cityErrors, setCityErrors] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  useEffect(() => {
    if (page !== 'outfits') return undefined;

    const controller = new AbortController();

    Promise.allSettled(cityList.map((city) => getWeather(city.query, controller.signal)))
      .then((results) => {
        if (controller.signal.aborted) return;
        const successfulCities = [];
        const failedCities = [];

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            successfulCities.push(result.value);
          } else if (result.reason.name !== 'AbortError') {
            failedCities.push(`${cityList[index].name}: ${result.reason.message}`);
          }
        });

        setCityWeather(successfulCities);
        setCityErrors(failedCities);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCitiesLoading(false);
      });

    return () => controller.abort();
  }, [page]);

  const fetchWeather = async (event) => {
    event.preventDefault();
    const searchedCity = city.trim();
    if (!searchedCity || loading) return;

    setLoading(true);
    setError('');
    setWeatherData(null);

    try {
      setWeatherData(await getWeather(searchedCity));
    } catch (requestError) {
      setError(requestError.message || 'Tidak bisa mengambil data cuaca. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (nextPage) => {
    if (nextPage === 'outfits') {
      setCitiesLoading(true);
      setCityErrors([]);
    }
    setPage(nextPage);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">Weather &amp; Wardrobe</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Cuaca hari ini, outfit yang pas.</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Cari cuaca kotamu dan temukan inspirasi berpakaian berdasarkan kondisi aktual.
          </p>
        </header>

        <nav aria-label="Navigasi utama" className="mb-8 flex flex-wrap justify-center gap-2">
          {pages.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              aria-current={page === item.id ? 'page' : undefined}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                page === item.id
                  ? 'border-indigo-400 bg-indigo-500 text-white'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-indigo-400/60 hover:text-white'
              }`}
            >
              <span className="mr-2 text-xs opacity-70">0{index + 1}</span>{item.label}
            </button>
          ))}
        </nav>

        {page === 'weather' && (
          <section className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/20 sm:p-8">
            <h2 className="text-xl font-bold text-white">Cari cuaca kota</h2>
            <p className="mt-1 text-sm text-slate-400">Masukkan nama kota, misalnya Tuban atau Bandung.</p>
            <form onSubmit={fetchWeather} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="city-search">Nama kota</label>
              <input
                id="city-search"
                type="search"
                placeholder="Masukkan nama kota..."
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
              <button
                type="submit"
                disabled={loading || !city.trim()}
                className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Mencari...' : 'Cari cuaca'}
              </button>
            </form>

            {loading && <p role="status" className="mt-5 text-center text-sm text-indigo-300">Memuat cuaca untuk {city.trim()}...</p>}
            {error && <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            {weatherData && (
              <div className="mt-6">
                <WeatherCard weather={weatherData} />
              </div>
            )}
          </section>
        )}

        {page === 'outfits' && (
          <section>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white">Inspirasi outfit berbagai kota</h2>
              <p className="mt-2 text-sm text-slate-400">Setiap rekomendasi mengikuti suhu dan kondisi cuaca terkini di kota tersebut.</p>
            </div>
            {citiesLoading && <p role="status" className="py-8 text-center text-sm text-indigo-300">Memuat cuaca berbagai kota...</p>}
            {cityErrors.length > 0 && (
              <div role="alert" className="mb-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
                <p className="font-semibold">Sebagian data cuaca gagal dimuat:</p>
                <ul className="mt-2 list-inside list-disc">{cityErrors.map((message) => <li key={message}>{message}</li>)}</ul>
              </div>
            )}
            {!citiesLoading && cityWeather.length === 0 && cityErrors.length > 0 && (
              <p className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center text-slate-300">Belum ada data kota yang bisa ditampilkan. Silakan coba lagi nanti.</p>
            )}
            {cityWeather.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {cityWeather.map((weather) => <WeatherCard key={weather.city} weather={weather} />)}
              </div>
            )}
          </section>
        )}

        {page === 'guide' && (
          <section className="mx-auto max-w-3xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white">Panduan simpel pilih outfit</h2>
              <p className="mt-2 text-sm text-slate-400">Jadikan cuaca sebagai panduan, lalu sesuaikan dengan agenda dan kenyamananmu.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <span className="text-2xl" aria-hidden="true">☀️</span>
                <h3 className="mt-3 font-bold text-white">Panas atau cerah</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">Pilih bahan ringan dan menyerap keringat. Topi atau kacamata hitam membantu saat banyak beraktivitas di luar.</p>
              </article>
              <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <span className="text-2xl" aria-hidden="true">🌧️</span>
                <h3 className="mt-3 font-bold text-white">Hujan atau berangin</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">Bawa jaket tahan air dan pilih alas kaki yang tidak mudah licin. Simpan payung lipat untuk berjaga-jaga.</p>
              </article>
              <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <span className="text-2xl" aria-hidden="true">🌥️</span>
                <h3 className="mt-3 font-bold text-white">Sejuk atau berubah-ubah</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">Gunakan pakaian berlapis agar mudah menyesuaikan diri ketika suhu berubah sepanjang hari.</p>
              </article>
              <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <span className="text-2xl" aria-hidden="true">🧴</span>
                <h3 className="mt-3 font-bold text-white">Tetap nyaman</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">Periksa prakiraan sebelum berangkat, bawa perlengkapan seperlunya, dan utamakan pakaian yang nyaman dipakai.</p>
              </article>
            </div>
          </section>
        )}

        <footer className="mt-10 text-center text-xs text-slate-500">
          Data cuaca diperbarui saat pencarian dilakukan. Tetap cek kondisi lokal sebelum bepergian.
        </footer>
      </div>
    </main>
  );
}

export default App;

'use client';

import { useState, useEffect } from 'react';
import WeatherCard from '@/components/weather/WeatherCard';
import ForecastCard from '@/components/weather/ForecastCard';
import WeatherBackground from '@/components/weather/WeatherBackground';
import InspirationQuote from '@/components/weather/InspirationQuote';
import ActivitySuggestions from '@/components/weather/ActivitySuggestions';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  sunrise: number;
  sunset: number;
  city: string;
  country: string;
  icon: string;
}

interface ForecastDay {
  date: string;
  temp: {
    min: number;
    max: number;
  };
  condition: string;
  icon: string;
  precipitation: number;
}

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    getCurrentLocationWeather();
  }, []);

  const getCurrentLocationWeather = () => {
    setLoading(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Fallback to Paris if geolocation fails
          fetchWeatherByCity('Paris');
        }
      );
    } else {
      fetchWeatherByCity('Paris');
    }
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `/api/weather?lat=${lat}&lon=${lon}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setWeather(data.current);
      setForecast(data.forecast);
      setCity(data.current.city);
      setLoading(false);
    } catch (err) {
      setError('Impossible de récupérer les données météo');
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (cityName: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setWeather(data.current);
      setForecast(data.forecast);
      setCity(data.current.city);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Ville introuvable');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchWeatherByCity(searchCity);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <WeatherBackground condition={weather?.condition || 'Clear'} />

      <div className="relative z-10 min-h-screen p-4 md:p-8">
        {/* Header with search */}
        <header className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl">
              ☀️ Météo Inspirante
            </h1>

            <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Rechercher une ville..."
                className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 w-full md:w-64"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white font-semibold hover:bg-white/40 transition-all duration-300 hover:scale-105"
              >
                🔍
              </button>
              <button
                type="button"
                onClick={getCurrentLocationWeather}
                className="px-6 py-3 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white font-semibold hover:bg-white/40 transition-all duration-300 hover:scale-105"
                title="Ma position"
              >
                📍
              </button>
            </form>
          </div>
        </header>

        {loading && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-xl font-medium">Chargement de la météo...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 text-center">
              <p className="text-white text-lg">❌ {error}</p>
            </div>
          </div>
        )}

        {!loading && !error && weather && (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Inspiration Quote */}
            <InspirationQuote condition={weather.condition} />

            {/* Main Weather Card */}
            <WeatherCard weather={weather} />

            {/* Activity Suggestions */}
            <ActivitySuggestions condition={weather.condition} temperature={weather.temperature} />

            {/* Forecast */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                Prévisions sur 5 jours
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {forecast.map((day, index) => (
                  <ForecastCard key={index} forecast={day} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

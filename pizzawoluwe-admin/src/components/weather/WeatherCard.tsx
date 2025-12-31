'use client';

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

interface WeatherCardProps {
  weather: WeatherData;
}

export default function WeatherCard({ weather }: WeatherCardProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWeatherEmoji = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear') || conditionLower.includes('sun')) return '☀️';
    if (conditionLower.includes('cloud')) return '☁️';
    if (conditionLower.includes('rain')) return '🌧️';
    if (conditionLower.includes('storm') || conditionLower.includes('thunder')) return '⛈️';
    if (conditionLower.includes('snow')) return '❄️';
    if (conditionLower.includes('mist') || conditionLower.includes('fog')) return '🌫️';
    return '🌤️';
  };

  return (
    <div className="bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/30 transform hover:scale-[1.02] transition-all duration-500">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left side - Main info */}
        <div className="space-y-6">
          <div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-2">
              {weather.city}, {weather.country}
            </h2>
            <p className="text-white/80 text-xl capitalize">{weather.description}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-8xl">{getWeatherEmoji(weather.condition)}</div>
            <div>
              <div className="text-7xl md:text-8xl font-bold text-white">
                {Math.round(weather.temperature)}°
              </div>
              <p className="text-2xl text-white/80">
                Ressenti {Math.round(weather.feelsLike)}°
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="text-4xl mb-2">💧</div>
            <div className="text-white/70 text-sm">Humidité</div>
            <div className="text-2xl font-bold text-white">{weather.humidity}%</div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="text-4xl mb-2">💨</div>
            <div className="text-white/70 text-sm">Vent</div>
            <div className="text-2xl font-bold text-white">{Math.round(weather.windSpeed)} km/h</div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="text-4xl mb-2">🌅</div>
            <div className="text-white/70 text-sm">Lever du soleil</div>
            <div className="text-2xl font-bold text-white">{formatTime(weather.sunrise)}</div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="text-4xl mb-2">🌇</div>
            <div className="text-white/70 text-sm">Coucher du soleil</div>
            <div className="text-2xl font-bold text-white">{formatTime(weather.sunset)}</div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-white/70 text-sm">Pression</div>
            <div className="text-2xl font-bold text-white">{weather.pressure} hPa</div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="text-4xl mb-2">👁️</div>
            <div className="text-white/70 text-sm">Visibilité</div>
            <div className="text-2xl font-bold text-white">{(weather.visibility / 1000).toFixed(1)} km</div>
          </div>
        </div>
      </div>
    </div>
  );
}

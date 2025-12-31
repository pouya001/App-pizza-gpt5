'use client';

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

interface ForecastCardProps {
  forecast: ForecastDay;
}

export default function ForecastCard({ forecast }: ForecastCardProps) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl hover:scale-105 transition-all duration-300 hover:shadow-2xl">
      <div className="text-center space-y-3">
        <p className="text-white/90 font-semibold text-lg capitalize">
          {formatDate(forecast.date)}
        </p>

        <div className="text-6xl my-4">
          {getWeatherEmoji(forecast.condition)}
        </div>

        <p className="text-white/80 text-sm capitalize">{forecast.condition}</p>

        <div className="flex justify-center items-center gap-3 text-white">
          <span className="text-2xl font-bold">{Math.round(forecast.temp.max)}°</span>
          <span className="text-xl text-white/60">{Math.round(forecast.temp.min)}°</span>
        </div>

        {forecast.precipitation > 0 && (
          <div className="flex items-center justify-center gap-2 text-blue-200">
            <span>💧</span>
            <span className="text-sm">{forecast.precipitation}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Volume2,
  VolumeX,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudSun,
  CloudFog,
  CloudRainWind,
  Snowflake,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Thermometer,
  X,
} from 'lucide-react';
import {
  WeatherData,
  WeatherCondition,
  weatherThemes,
  timeThemes,
  defaultWeatherData,
  getWeatherData,
  getAvailableCities,
} from '../src/data/weatherData';

// Weather icon component mapping
const WeatherIcon: React.FC<{ condition: WeatherCondition; size?: number; className?: string }> = ({
  condition,
  size = 24,
  className = '',
}) => {
  const iconProps = { size, className };

  const icons: Record<WeatherCondition, React.ReactNode> = {
    clear: <Sun {...iconProps} />,
    'partly-cloudy': <CloudSun {...iconProps} />,
    cloudy: <Cloud {...iconProps} />,
    rain: <CloudRain {...iconProps} />,
    'heavy-rain': <CloudRainWind {...iconProps} />,
    storm: <CloudLightning {...iconProps} />,
    snow: <Snowflake {...iconProps} />,
    fog: <CloudFog {...iconProps} />,
  };

  return <>{icons[condition]}</>;
};

// Animated weather background
const WeatherBackground: React.FC<{ condition: WeatherCondition }> = ({ condition }) => {
  const renderRainDrops = () => {
    return Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="rain-drop"
        style={{
          left: `${Math.random() * 100}%`,
          '--duration': `${0.5 + Math.random() * 0.5}s`,
          '--delay': `${Math.random() * 2}s`,
        } as React.CSSProperties}
      />
    ));
  };

  const renderSnowFlakes = () => {
    return Array.from({ length: 40 }).map((_, i) => (
      <div
        key={i}
        className="snow-flake"
        style={{
          left: `${Math.random() * 100}%`,
          '--duration': `${2 + Math.random() * 3}s`,
          '--delay': `${Math.random() * 5}s`,
        } as React.CSSProperties}
      />
    ));
  };

  const renderClouds = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <motion.div
        key={i}
        className="cloud"
        initial={{ x: '-100%' }}
        animate={{ x: '100vw' }}
        transition={{
          duration: 20 + i * 10,
          repeat: Infinity,
          ease: 'linear',
          delay: i * 4,
        }}
        style={{
          top: `${10 + i * 15}%`,
          width: `${100 + i * 50}px`,
          height: `${60 + i * 30}px`,
          opacity: 0.1 + i * 0.05,
        }}
      />
    ));
  };

  const renderSunGlow = () => (
    <motion.div
      className="sun-glow"
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        top: '10%',
        right: '10%',
      }}
    />
  );

  const renderLightning = () => (
    <motion.div
      className="absolute inset-0 bg-purple-500/10"
      animate={{
        opacity: [0, 0, 0.3, 0, 0.2, 0, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatDelay: 2,
      }}
    />
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-nimbus-darker via-nimbus-dark to-nimbus-dark" />

      {/* Weather-specific effects */}
      {condition === 'clear' && renderSunGlow()}
      {(condition === 'cloudy' || condition === 'partly-cloudy') && renderClouds()}
      {(condition === 'rain' || condition === 'heavy-rain') && (
        <>
          {renderClouds()}
          {renderRainDrops()}
        </>
      )}
      {condition === 'storm' && (
        <>
          {renderClouds()}
          {renderRainDrops()}
          {renderLightning()}
        </>
      )}
      {condition === 'snow' && (
        <>
          {renderClouds()}
          {renderSnowFlakes()}
        </>
      )}

      {/* Ambient glow at bottom */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-[60%] opacity-20"
        style={{
          background: `radial-gradient(ellipse at bottom, var(--glow-primary) 0%, transparent 70%)`,
        }}
      />
    </div>
  );
};

// Header component
const Header: React.FC<{
  onSearch: (city: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}> = ({ onSearch, soundEnabled, onToggleSound }) => {
  const [searchValue, setSearchValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const availableCities = useMemo(() => getAvailableCities(), []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.length > 0) {
      const filtered = availableCities.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue.split(',')[0].trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (city: string) => {
    const cityName = city.split(',')[0].trim();
    setSearchValue(city);
    onSearch(cityName);
    setShowSuggestions(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-card mx-4 mt-4 md:mx-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0"
          >
            <h1 className="text-xl md:text-2xl font-bold text-glow-cyan neon-text-subtle">
              NimbusFlow
            </h1>
          </motion.div>

          {/* Search */}
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={searchValue}
                  onChange={handleInputChange}
                  placeholder="Rechercher une ville..."
                  className="search-input rounded-xl"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 glass-card p-2 max-h-60 overflow-y-auto"
                >
                  {suggestions.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(city)}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                    >
                      {city}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sound toggle */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onToggleSound}
            className={`toggle-btn ${soundEnabled ? 'active' : ''}`}
            title={soundEnabled ? 'Desactiver le son' : 'Activer le son'}
          >
            {soundEnabled ? (
              <Volume2 size={20} className="text-glow-cyan" />
            ) : (
              <VolumeX size={20} className="text-white/50" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
};

// Main weather display
const MainWeatherDisplay: React.FC<{ data: WeatherData }> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass-glow p-8 md:p-12 text-center"
    >
      {/* City and Country */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl md:text-4xl font-light text-white/90">
          {data.city}
        </h2>
        <p className="text-sm md:text-base text-white/50 mt-1">{data.country}</p>
      </motion.div>

      {/* Weather Icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        className="weather-icon-wrapper my-6 md:my-8"
      >
        <WeatherIcon
          condition={data.condition}
          size={100}
          className="text-glow-cyan drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]"
        />
      </motion.div>

      {/* Temperature */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="temp-display">{data.currentTemp}°</span>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xl md:text-2xl text-white/70 mt-2"
      >
        {data.description}
      </motion.p>

      {/* Feels Like */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-sm md:text-base text-white/40 mt-4 flex items-center justify-center gap-2"
      >
        <Thermometer size={16} />
        Ressenti : {data.feelsLike}°C
      </motion.p>

      {/* Weather Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
      >
        <div className="glass p-4 rounded-xl">
          <Droplets size={20} className="text-glow-cyan mx-auto mb-2" />
          <p className="text-white/50 text-xs">Humidite</p>
          <p className="text-white font-medium">{data.humidity}%</p>
        </div>
        <div className="glass p-4 rounded-xl">
          <Wind size={20} className="text-glow-cyan mx-auto mb-2" />
          <p className="text-white/50 text-xs">Vent</p>
          <p className="text-white font-medium">{data.windSpeed} km/h</p>
        </div>
        <div className="glass p-4 rounded-xl">
          <Eye size={20} className="text-glow-cyan mx-auto mb-2" />
          <p className="text-white/50 text-xs">Visibilite</p>
          <p className="text-white font-medium">{data.visibility} km</p>
        </div>
        <div className="glass p-4 rounded-xl">
          <Gauge size={20} className="text-glow-cyan mx-auto mb-2" />
          <p className="text-white/50 text-xs">Pression</p>
          <p className="text-white font-medium">{data.pressure} hPa</p>
        </div>
      </motion.div>

      {/* Sunrise/Sunset */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex justify-center gap-8 mt-6 text-white/50"
      >
        <div className="flex items-center gap-2">
          <Sunrise size={16} className="text-orange-400" />
          <span className="text-sm">{data.sunrise}</span>
        </div>
        <div className="flex items-center gap-2">
          <Sunset size={16} className="text-pink-400" />
          <span className="text-sm">{data.sunset}</span>
        </div>
      </motion.div>

      {/* Human Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-8 p-4 glass rounded-xl border-l-4 border-glow-cyan/50"
      >
        <p className="text-sm md:text-base text-white/70 italic">
          "{data.humanTip}"
        </p>
      </motion.div>
    </motion.div>
  );
};

// Hourly forecast component
const HourlyForecast: React.FC<{ data: WeatherData }> = ({ data }) => {
  const currentHour = new Date().getHours();
  const dayProgress = (currentHour / 24) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-card relative overflow-visible"
    >
      <h3 className="text-lg font-medium text-white/80 mb-4">
        Previsions horaires
      </h3>

      <div className="hourly-scroll relative">
        {data.hourlyForecast.map((hour, index) => (
          <motion.div
            key={hour.hour}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.03 }}
            className={`flex-shrink-0 glass p-4 rounded-xl text-center min-w-[80px] ${
              index === 0 ? 'border border-glow-cyan/30' : ''
            }`}
          >
            <p className="text-xs text-white/50 mb-2">{hour.hour}</p>
            <WeatherIcon
              condition={hour.condition}
              size={24}
              className="text-glow-cyan mx-auto mb-2"
            />
            <p className="text-white font-medium">{hour.temp}°</p>
          </motion.div>
        ))}
      </div>

      {/* Day progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${dayProgress}%` }}
          transition={{ duration: 1, delay: 0.8 }}
          className="day-progress"
        />
      </div>
    </motion.div>
  );
};

// Daily forecast component
const DailyForecast: React.FC<{ data: WeatherData }> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <h3 className="text-lg font-medium text-white/80 mb-4">
        Previsions sur 5 jours
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {data.dailyForecast.map((day, index) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.7 + index * 0.1,
              type: 'spring',
              stiffness: 200,
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 30px rgba(34, 211, 238, 0.2)',
            }}
            className="glass-card text-center cursor-pointer group"
          >
            <p className="text-white font-medium">{day.day}</p>
            <p className="text-xs text-white/40 mb-3">{day.date}</p>

            <div className="weather-icon-wrapper my-4">
              <WeatherIcon
                condition={day.condition}
                size={40}
                className="text-glow-cyan group-hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all duration-300"
              />
            </div>

            <div className="flex justify-center gap-2 text-sm">
              <span className="text-white font-medium">{day.tempMax}°</span>
              <span className="text-white/40">{day.tempMin}°</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Main App Component
export default function NimbusFlow() {
  const [weatherData, setWeatherData] = useState<WeatherData>(defaultWeatherData);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update CSS variables based on weather
  useEffect(() => {
    const theme = weatherThemes[weatherData.condition];
    const timeTheme = timeThemes[weatherData.timeOfDay];

    document.documentElement.style.setProperty('--glow-primary', theme.primary);
    document.documentElement.style.setProperty('--glow-primary-rgb', theme.glow);
    document.documentElement.style.setProperty('--glow-secondary', theme.secondary);
    document.documentElement.style.setProperty('--weather-accent', timeTheme.primary);
  }, [weatherData]);

  const handleSearch = useCallback((cityName: string) => {
    setIsLoading(true);
    setError(null);

    // Simulate API call delay
    setTimeout(() => {
      const data = getWeatherData(cityName);
      if (data) {
        setWeatherData(data);
      } else {
        setError(`Ville "${cityName}" non trouvee. Essayez: Paris, Londres, Tokyo, New York...`);
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Animated background */}
      <WeatherBackground condition={weatherData.condition} />

      {/* Header */}
      <Header
        onSearch={handleSearch}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main content */}
      <main className="relative z-10 pt-32 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card mb-6 p-4 border-l-4 border-red-500/50 flex items-center justify-between"
            >
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-8 text-center mb-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <Sun size={40} className="text-glow-cyan" />
            </motion.div>
            <p className="text-white/50 mt-4">Chargement des donnees meteo...</p>
          </motion.div>
        )}

        {/* Weather content */}
        {!isLoading && (
          <div className="space-y-6">
            {/* Main display */}
            <MainWeatherDisplay data={weatherData} />

            {/* Hourly forecast */}
            <HourlyForecast data={weatherData} />

            {/* Daily forecast */}
            <DailyForecast data={weatherData} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-white/30 text-sm">
        <p>NimbusFlow - Une experience meteo immersive</p>
      </footer>
    </div>
  );
}

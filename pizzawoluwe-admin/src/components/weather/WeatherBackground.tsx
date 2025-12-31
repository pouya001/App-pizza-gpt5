'use client';

import { useEffect, useState } from 'react';

interface WeatherBackgroundProps {
  condition: string;
}

export default function WeatherBackground({ condition }: WeatherBackgroundProps) {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const conditionLower = condition.toLowerCase();

    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      // Create rain drops
      const drops = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 0.5 + Math.random() * 0.5,
      }));
      setParticles(drops);
    } else if (conditionLower.includes('snow')) {
      // Create snowflakes
      const flakes = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 5,
      }));
      setParticles(flakes);
    } else {
      setParticles([]);
    }
  }, [condition]);

  const getBackgroundGradient = () => {
    const conditionLower = condition.toLowerCase();

    if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
      return 'from-blue-400 via-blue-300 to-yellow-200';
    } else if (conditionLower.includes('cloud')) {
      return 'from-gray-400 via-gray-300 to-gray-200';
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return 'from-gray-600 via-gray-500 to-blue-400';
    } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
      return 'from-gray-800 via-gray-700 to-purple-900';
    } else if (conditionLower.includes('snow')) {
      return 'from-blue-200 via-white to-blue-100';
    } else if (conditionLower.includes('mist') || conditionLower.includes('fog')) {
      return 'from-gray-300 via-gray-200 to-white';
    }

    return 'from-blue-500 via-purple-500 to-pink-500';
  };

  const isRain = condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('drizzle');
  const isSnow = condition.toLowerCase().includes('snow');

  return (
    <>
      {/* Animated gradient background */}
      <div className={`fixed inset-0 bg-gradient-to-br ${getBackgroundGradient()} animate-gradient-shift`} />

      {/* Overlay for better text readability */}
      <div className="fixed inset-0 bg-black/10" />

      {/* Particles (rain or snow) */}
      {particles.length > 0 && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className={isRain ? 'rain-drop' : 'snow-flake'}
              style={{
                left: `${particle.left}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            >
              {isSnow ? '❄' : ''}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

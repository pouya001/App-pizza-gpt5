// NimbusFlow - Mock Weather Data
// This file simulates weather API responses for development

export interface HourlyForecast {
  hour: string;
  temp: number;
  condition: WeatherCondition;
  icon: string;
}

export interface DailyForecast {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  condition: WeatherCondition;
  icon: string;
}

export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'heavy-rain'
  | 'storm'
  | 'snow'
  | 'fog';

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

export interface WeatherData {
  city: string;
  country: string;
  currentTemp: number;
  feelsLike: number;
  condition: WeatherCondition;
  description: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  sunrise: string;
  sunset: string;
  timeOfDay: TimeOfDay;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  humanTip: string;
}

// Weather condition to icon mapping
export const weatherIcons: Record<WeatherCondition, string> = {
  clear: 'sun',
  'partly-cloudy': 'cloud-sun',
  cloudy: 'cloud',
  rain: 'cloud-rain',
  'heavy-rain': 'cloud-rain-wind',
  storm: 'cloud-lightning',
  snow: 'snowflake',
  fog: 'cloud-fog',
};

// Dynamic color themes based on weather and time
export const weatherThemes: Record<WeatherCondition, { primary: string; secondary: string; glow: string }> = {
  clear: { primary: '#38bdf8', secondary: '#0ea5e9', glow: '56, 189, 248' },
  'partly-cloudy': { primary: '#60a5fa', secondary: '#3b82f6', glow: '96, 165, 250' },
  cloudy: { primary: '#94a3b8', secondary: '#64748b', glow: '148, 163, 184' },
  rain: { primary: '#64748b', secondary: '#475569', glow: '100, 116, 139' },
  'heavy-rain': { primary: '#6366f1', secondary: '#4f46e5', glow: '99, 102, 241' },
  storm: { primary: '#a855f7', secondary: '#9333ea', glow: '168, 85, 247' },
  snow: { primary: '#e2e8f0', secondary: '#cbd5e1', glow: '226, 232, 240' },
  fog: { primary: '#9ca3af', secondary: '#6b7280', glow: '156, 163, 175' },
};

export const timeThemes: Record<TimeOfDay, { primary: string; secondary: string; glow: string }> = {
  morning: { primary: '#fb923c', secondary: '#f97316', glow: '251, 146, 60' },
  day: { primary: '#38bdf8', secondary: '#0ea5e9', glow: '56, 189, 248' },
  evening: { primary: '#f472b6', secondary: '#ec4899', glow: '244, 114, 182' },
  night: { primary: '#6366f1', secondary: '#4f46e5', glow: '99, 102, 241' },
};

// Human-readable weather tips
export const weatherTips: Record<WeatherCondition, string[]> = {
  clear: [
    "Journee parfaite pour une promenade en plein air. N'oubliez pas votre creme solaire !",
    "Ideal pour un pique-nique ou une activite en exterieur. Profitez du beau temps !",
    "Le ciel est degage, parfait pour observer les etoiles ce soir.",
  ],
  'partly-cloudy': [
    "Quelques nuages mais rien de mechant. Ideal pour une balade sans trop de soleil direct.",
    "Temps agreable avec des eclaircies. Prevoyez quand meme une petite veste au cas ou.",
    "Les nuages filtrent le soleil, parfait pour les activites en exterieur prolongees.",
  ],
  cloudy: [
    "Ciel couvert aujourd'hui. Bon moment pour des activites interieures ou une session cinema.",
    "Temps gris mais sec. Ideal pour une visite de musee ou un cafe en terrasse couverte.",
    "Les nuages dominent, mais pas de pluie en vue. Profitez-en pour jardiner !",
  ],
  rain: [
    "Pluie prevue, gardez votre parapluie a portee de main et restez au sec !",
    "Temps pluvieux ideal pour un bon livre et une tasse de the chaud.",
    "N'oubliez pas vos chaussures impermeables si vous sortez aujourd'hui.",
  ],
  'heavy-rain': [
    "Fortes averses attendues. Limitez vos deplacements si possible.",
    "Pluie intense prevue. Verifiez que vos fenetres sont bien fermees !",
    "Temps tres pluvieux, parfait pour un marathon de series a la maison.",
  ],
  storm: [
    "Orage en approche ! Restez a l'abri et evitez les zones exposees.",
    "Conditions orageuses prevues. Debranchez vos appareils sensibles par precaution.",
    "Tempete annoncee, reportez vos activites exterieures a demain.",
  ],
  snow: [
    "Il neige ! Habillez-vous chaudement et attention aux routes glissantes.",
    "Journee enneigee, parfaite pour construire un bonhomme de neige ou une bataille de boules !",
    "Neige prevue, prevoyez plus de temps pour vos deplacements.",
  ],
  fog: [
    "Brouillard epais ce matin. Conduisez prudemment et allumez vos feux.",
    "Visibilite reduite due au brouillard. Soyez vigilant sur la route.",
    "Le brouillard devrait se lever en cours de matinee.",
  ],
};

// Generate hourly forecast for the next 24 hours
function generateHourlyForecast(baseTemp: number, condition: WeatherCondition): HourlyForecast[] {
  const hours: HourlyForecast[] = [];
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hourNum = hour.getHours();

    // Temperature varies throughout the day
    let tempVariation = 0;
    if (hourNum >= 6 && hourNum < 12) tempVariation = i * 0.3;
    else if (hourNum >= 12 && hourNum < 18) tempVariation = 3 - (i - 6) * 0.2;
    else if (hourNum >= 18 && hourNum < 22) tempVariation = -i * 0.2;
    else tempVariation = -2;

    const temp = Math.round(baseTemp + tempVariation + (Math.random() - 0.5) * 2);

    // Occasionally change condition
    let hourCondition = condition;
    if (Math.random() > 0.8) {
      const conditions: WeatherCondition[] = ['clear', 'partly-cloudy', 'cloudy'];
      hourCondition = conditions[Math.floor(Math.random() * conditions.length)];
    }

    hours.push({
      hour: `${hourNum.toString().padStart(2, '0')}:00`,
      temp,
      condition: hourCondition,
      icon: weatherIcons[hourCondition],
    });
  }

  return hours;
}

// Generate 5-day forecast
function generateDailyForecast(baseTemp: number): DailyForecast[] {
  const days: DailyForecast[] = [];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const conditions: WeatherCondition[] = ['clear', 'partly-cloudy', 'cloudy', 'rain', 'partly-cloudy'];

  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    const tempVariation = (Math.random() - 0.5) * 6;
    const condition = conditions[i];

    days.push({
      day: i === 0 ? "Auj." : dayNames[date.getDay()],
      date: `${date.getDate()}/${date.getMonth() + 1}`,
      tempMax: Math.round(baseTemp + 3 + tempVariation),
      tempMin: Math.round(baseTemp - 4 + tempVariation),
      condition,
      icon: weatherIcons[condition],
    });
  }

  return days;
}

// Get time of day
function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 18) return 'day';
  if (hour >= 18 && hour < 21) return 'evening';
  return 'night';
}

// Get random tip for weather condition
function getRandomTip(condition: WeatherCondition): string {
  const tips = weatherTips[condition];
  return tips[Math.floor(Math.random() * tips.length)];
}

// Mock cities data
export const cities: Record<string, WeatherData> = {
  paris: {
    city: 'Paris',
    country: 'France',
    currentTemp: 18,
    feelsLike: 16,
    condition: 'partly-cloudy',
    description: 'Partiellement nuageux',
    humidity: 65,
    windSpeed: 12,
    uvIndex: 5,
    visibility: 10,
    pressure: 1015,
    sunrise: '07:42',
    sunset: '19:28',
    timeOfDay: getTimeOfDay(),
    hourlyForecast: generateHourlyForecast(18, 'partly-cloudy'),
    dailyForecast: generateDailyForecast(18),
    humanTip: getRandomTip('partly-cloudy'),
  },
  london: {
    city: 'Londres',
    country: 'Royaume-Uni',
    currentTemp: 14,
    feelsLike: 12,
    condition: 'rain',
    description: 'Pluie legere',
    humidity: 82,
    windSpeed: 18,
    uvIndex: 2,
    visibility: 6,
    pressure: 1008,
    sunrise: '07:15',
    sunset: '19:45',
    timeOfDay: getTimeOfDay(),
    hourlyForecast: generateHourlyForecast(14, 'rain'),
    dailyForecast: generateDailyForecast(14),
    humanTip: getRandomTip('rain'),
  },
  tokyo: {
    city: 'Tokyo',
    country: 'Japon',
    currentTemp: 24,
    feelsLike: 26,
    condition: 'clear',
    description: 'Ensoleille',
    humidity: 55,
    windSpeed: 8,
    uvIndex: 8,
    visibility: 15,
    pressure: 1020,
    sunrise: '05:30',
    sunset: '18:15',
    timeOfDay: getTimeOfDay(),
    hourlyForecast: generateHourlyForecast(24, 'clear'),
    dailyForecast: generateDailyForecast(24),
    humanTip: getRandomTip('clear'),
  },
  newyork: {
    city: 'New York',
    country: 'Etats-Unis',
    currentTemp: 22,
    feelsLike: 24,
    condition: 'partly-cloudy',
    description: 'Eclaircies',
    humidity: 58,
    windSpeed: 15,
    uvIndex: 6,
    visibility: 12,
    pressure: 1012,
    sunrise: '06:45',
    sunset: '19:55',
    timeOfDay: getTimeOfDay(),
    hourlyForecast: generateHourlyForecast(22, 'partly-cloudy'),
    dailyForecast: generateDailyForecast(22),
    humanTip: getRandomTip('partly-cloudy'),
  },
  sydney: {
    city: 'Sydney',
    country: 'Australie',
    currentTemp: 19,
    feelsLike: 18,
    condition: 'cloudy',
    description: 'Nuageux',
    humidity: 70,
    windSpeed: 20,
    uvIndex: 4,
    visibility: 8,
    pressure: 1018,
    sunrise: '06:20',
    sunset: '17:50',
    timeOfDay: getTimeOfDay(),
    hourlyForecast: generateHourlyForecast(19, 'cloudy'),
    dailyForecast: generateDailyForecast(19),
    humanTip: getRandomTip('cloudy'),
  },
  reykjavik: {
    city: 'Reykjavik',
    country: 'Islande',
    currentTemp: 4,
    feelsLike: 0,
    condition: 'snow',
    description: 'Neige legere',
    humidity: 88,
    windSpeed: 25,
    uvIndex: 1,
    visibility: 3,
    pressure: 1005,
    sunrise: '09:15',
    sunset: '17:30',
    timeOfDay: getTimeOfDay(),
    hourlyForecast: generateHourlyForecast(4, 'snow'),
    dailyForecast: generateDailyForecast(4),
    humanTip: getRandomTip('snow'),
  },
  miami: {
    city: 'Miami',
    country: 'Etats-Unis',
    currentTemp: 29,
    feelsLike: 33,
    condition: 'storm',
    description: 'Orage tropical',
    humidity: 85,
    windSpeed: 30,
    uvIndex: 9,
    visibility: 5,
    pressure: 1002,
    sunrise: '06:30',
    sunset: '20:10',
    timeOfDay: getTimeOfDay(),
    hourlyForecast: generateHourlyForecast(29, 'storm'),
    dailyForecast: generateDailyForecast(29),
    humanTip: getRandomTip('storm'),
  },
  bruxelles: {
    city: 'Bruxelles',
    country: 'Belgique',
    currentTemp: 15,
    feelsLike: 13,
    condition: 'rain',
    description: 'Averses',
    humidity: 78,
    windSpeed: 14,
    uvIndex: 3,
    visibility: 7,
    pressure: 1010,
    sunrise: '07:35',
    sunset: '19:40',
    timeOfDay: getTimeOfDay(),
    hourlyForecast: generateHourlyForecast(15, 'rain'),
    dailyForecast: generateDailyForecast(15),
    humanTip: getRandomTip('rain'),
  },
};

// Get weather data for a city
export function getWeatherData(cityName: string): WeatherData | null {
  const normalizedCity = cityName.toLowerCase().replace(/\s+/g, '');
  return cities[normalizedCity] || null;
}

// Get list of available cities for autocomplete
export function getAvailableCities(): string[] {
  return Object.values(cities).map((city) => `${city.city}, ${city.country}`);
}

// Default weather data
export const defaultWeatherData: WeatherData = cities.paris;

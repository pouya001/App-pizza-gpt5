import { NextRequest, NextResponse } from 'next/server';

// OpenWeatherMap API - You can use a free API key from https://openweathermap.org/api
// For demo purposes, we'll use mock data. Replace with real API calls in production.
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const city = searchParams.get('city');

  try {
    let weatherData;
    let forecastData;

    if (OPENWEATHER_API_KEY === 'demo') {
      // Demo mode with mock data
      weatherData = getMockWeatherData(city || 'Paris');
      forecastData = getMockForecastData();
    } else {
      // Real API calls
      if (lat && lon) {
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${OPENWEATHER_API_KEY}`
        );
        weatherData = await weatherRes.json();

        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${OPENWEATHER_API_KEY}`
        );
        forecastData = await forecastRes.json();
      } else if (city) {
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=fr&appid=${OPENWEATHER_API_KEY}`
        );
        weatherData = await weatherRes.json();

        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=fr&appid=${OPENWEATHER_API_KEY}`
        );
        forecastData = await forecastRes.json();
      } else {
        return NextResponse.json(
          { error: 'Veuillez fournir des coordonnées ou un nom de ville' },
          { status: 400 }
        );
      }

      if (weatherData.cod !== 200) {
        return NextResponse.json(
          { error: 'Ville introuvable' },
          { status: 404 }
        );
      }
    }

    const response = {
      current: parseWeatherData(weatherData),
      forecast: parseForecastData(forecastData),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données météo' },
      { status: 500 }
    );
  }
}

function parseWeatherData(data: any) {
  return {
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    condition: data.weather[0].main,
    description: data.weather[0].description,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed * 3.6, // Convert m/s to km/h
    pressure: data.main.pressure,
    visibility: data.visibility,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    city: data.name,
    country: data.sys.country,
    icon: data.weather[0].icon,
  };
}

function parseForecastData(data: any) {
  if (!data.list) return [];

  // Group forecasts by day and get one forecast per day (at noon)
  const dailyForecasts: any[] = [];
  const processedDates = new Set();

  data.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000);
    const dateString = date.toISOString().split('T')[0];

    if (!processedDates.has(dateString) && dailyForecasts.length < 5) {
      processedDates.add(dateString);
      dailyForecasts.push({
        date: dateString,
        temp: {
          min: item.main.temp_min,
          max: item.main.temp_max,
        },
        condition: item.weather[0].description,
        icon: item.weather[0].icon,
        precipitation: item.pop ? Math.round(item.pop * 100) : 0,
      });
    }
  });

  return dailyForecasts;
}

// Mock data for demo purposes
function getMockWeatherData(cityName: string) {
  const cities: Record<string, any> = {
    Paris: {
      main: { temp: 22, feels_like: 21, humidity: 65, pressure: 1013 },
      weather: [{ main: 'Clear', description: 'ciel dégagé', icon: '01d' }],
      wind: { speed: 3.5 },
      visibility: 10000,
      sys: { sunrise: Math.floor(Date.now() / 1000) - 3600 * 6, sunset: Math.floor(Date.now() / 1000) + 3600 * 6, country: 'FR' },
      name: 'Paris',
      cod: 200,
    },
    London: {
      main: { temp: 18, feels_like: 17, humidity: 75, pressure: 1010 },
      weather: [{ main: 'Clouds', description: 'nuageux', icon: '03d' }],
      wind: { speed: 4.2 },
      visibility: 8000,
      sys: { sunrise: Math.floor(Date.now() / 1000) - 3600 * 6, sunset: Math.floor(Date.now() / 1000) + 3600 * 6, country: 'GB' },
      name: 'London',
      cod: 200,
    },
    Tokyo: {
      main: { temp: 25, feels_like: 26, humidity: 70, pressure: 1015 },
      weather: [{ main: 'Rain', description: 'pluie légère', icon: '10d' }],
      wind: { speed: 2.8 },
      visibility: 7000,
      sys: { sunrise: Math.floor(Date.now() / 1000) - 3600 * 6, sunset: Math.floor(Date.now() / 1000) + 3600 * 6, country: 'JP' },
      name: 'Tokyo',
      cod: 200,
    },
  };

  return cities[cityName] || cities.Paris;
}

function getMockForecastData() {
  const forecasts = [];
  const now = Date.now() / 1000;

  for (let i = 1; i <= 5; i++) {
    forecasts.push({
      dt: now + i * 86400,
      main: { temp_min: 15 + Math.random() * 5, temp_max: 20 + Math.random() * 8 },
      weather: [{
        main: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
        description: ['ciel dégagé', 'nuageux', 'pluie légère'][Math.floor(Math.random() * 3)],
        icon: '01d'
      }],
      pop: Math.random() * 0.5,
    });
  }

  return { list: forecasts };
}

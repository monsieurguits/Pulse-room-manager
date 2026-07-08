type GeocodingResult = {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
};

type GeocodingResponse = {
  results?: GeocodingResult[];
};

type ForecastResponse = {
  current?: {
    temperature_2m?: number;
  };
};

export type DashboardWeather = {
  city: string;
  temperature: number;
  action: 'réchauffer vos fans' | 'mouiller vos fans';
};

export async function getDashboardWeather(city: string | null | undefined): Promise<DashboardWeather | null> {
  const normalizedCity = city?.trim();
  if (!normalizedCity) return null;

  try {
    const searchParams = new URLSearchParams({
      name: normalizedCity,
      count: '1',
      language: 'fr',
      format: 'json',
    });

    const geocodingResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${searchParams}`, {
      next: { revalidate: 900 },
    });

    if (!geocodingResponse.ok) return null;

    const geocoding = (await geocodingResponse.json()) as GeocodingResponse;
    const place = geocoding.results?.[0];
    if (!place) return null;

    const forecastParams = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      current: 'temperature_2m',
      timezone: 'auto',
    });

    const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${forecastParams}`, {
      next: { revalidate: 900 },
    });

    if (!forecastResponse.ok) return null;

    const forecast = (await forecastResponse.json()) as ForecastResponse;
    const temperature = forecast.current?.temperature_2m;
    if (typeof temperature !== 'number') return null;

    return {
      city: place.country ? `${place.name}, ${place.country}` : place.name,
      temperature,
      action: temperature >= 21 ? 'mouiller vos fans' : 'réchauffer vos fans',
    };
  } catch {
    return null;
  }
}

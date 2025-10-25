export interface WeatherSearch {
  id: string
  location: string
  location_type: "city" | "zip" | "coordinates" | "landmark"
  start_date: string
  end_date: string
  temperature_data: WeatherData | null
  created_at: string
  updated_at: string
}

export interface WeatherData {
  current?: CurrentWeather
  forecast?: ForecastDay[]
  location?: LocationInfo
}

export interface CurrentWeather {
  temp_c: number
  temp_f: number
  condition: {
    text: string
    icon: string
  }
  humidity: number
  wind_kph: number
  wind_mph: number
  feelslike_c: number
  feelslike_f: number
}

export interface ForecastDay {
  date: string
  day: {
    maxtemp_c: number
    maxtemp_f: number
    mintemp_c: number
    mintemp_f: number
    condition: {
      text: string
      icon: string
    }
  }
}

export interface LocationInfo {
  name: string
  region: string
  country: string
  lat: number
  lon: number
}

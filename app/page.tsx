"use client"

import { useState, useEffect } from "react"
import { WeatherSearch } from "@/components/weather-search"
import { WeatherDisplay } from "@/components/weather-display"
import { WeatherHistory } from "@/components/weather-history"
import { LocationMap } from "@/components/location-map"
import { YouTubeVideos } from "@/components/youtube-videos"
import { DatabaseSetup } from "@/components/database-setup"
import { WeatherBackground } from "@/components/weather-background"

import type { WeatherData, WeatherSearch as WeatherSearchType } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"

export const dynamic = "force-dynamic"

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [currentLocation, setCurrentLocation] = useState<string>("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isDatabaseReady, setIsDatabaseReady] = useState<boolean | null>(null)
  const [backgroundCondition, setBackgroundCondition] = useState<string | undefined>(undefined)

  const supabase = createClient()

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const { error } = await supabase.from("weather_searches").select("id").limit(1)

        setIsDatabaseReady(!error)
      } catch (err) {
        setIsDatabaseReady(false)
      }
    }

    checkDatabase()
  }, [])

  const handleForecastDayClick = (condition: string) => {
    setBackgroundCondition(condition)
  }

  const handleWeatherFetched = async (
    location: string,
    locationType: string,
    startDate: Date,
    endDate: Date,
    data: WeatherData,
  ) => {
    setWeatherData(data)
    setCurrentLocation(location)
    setBackgroundCondition(data.current?.condition?.text)

    try {
      const { error } = await supabase.from("weather_searches").insert({
        location,
        location_type: locationType,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        temperature_data: data,
      })

      if (error) {
        console.error("[v0] Error saving search:", error)
      } else {
        setRefreshTrigger((prev) => prev + 1)
      }
    } catch (err) {
      console.error("[v0] Error saving search:", err)
    }
  }

  const handleViewWeather = (search: WeatherSearchType) => {
    if (search.temperature_data) {
      setWeatherData(search.temperature_data)
      setCurrentLocation(search.location)
    }
  }

  if (isDatabaseReady === false) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <WeatherBackground />
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-balance text-foreground drop-shadow-lg">Weather App</h1>
            <p className="text-foreground/90 drop-shadow">By AkashKrishna Bhukya</p>
          </div>

          <DatabaseSetup />
        </div>
      </div>
    )
  }

  if (isDatabaseReady === null) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <WeatherBackground />
        <p className="text-foreground/70 drop-shadow">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <WeatherBackground condition={backgroundCondition} />
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-balance text-foreground drop-shadow-lg">Weather App</h1>
          <p className="text-foreground/90 drop-shadow">By AkashKrishna Bhukya</p>
        </div>

        {/* Search Section */}
        <WeatherSearch onWeatherFetched={handleWeatherFetched} />

        {/* Weather Display */}
        {weatherData && (
          <>
            <WeatherDisplay
              weatherData={weatherData}
              location={currentLocation}
              onForecastDayClick={handleForecastDayClick}
            />

            {weatherData.location && (
              <div className="grid gap-4 md:grid-cols-2">
                <LocationMap location={weatherData.location} />
                <YouTubeVideos location={currentLocation} />
              </div>
            )}
          </>
        )}

        {/* History Section */}
        <WeatherHistory onViewWeather={handleViewWeather} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}

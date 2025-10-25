"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format, isToday } from "date-fns"
import type { WeatherData } from "@/lib/types"
import Image from "next/image"
import { useState } from "react"

interface WeatherDisplayProps {
  weatherData: WeatherData
  location: string
  onForecastDayClick?: (condition: string) => void
}

export function WeatherDisplay({ weatherData, location, onForecastDayClick }: WeatherDisplayProps) {
  const [unit, setUnit] = useState<"C" | "F">("F")
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const { current, forecast, location: locationInfo } = weatherData

  if (!current || !forecast) {
    return null
  }

  const getTemp = (tempC: number, tempF: number) => {
    return unit === "C" ? `${tempC}°C` : `${tempF}°F`
  }

  const handleDayClick = (date: string, condition: string) => {
    setSelectedDay(date)
    if (onForecastDayClick) {
      onForecastDayClick(condition)
    }
  }

  return (
    <div className="space-y-4">
      {/* Apple-style frosted glass card */}
      <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Current Weather (Real-Time)</CardTitle>
              <CardDescription className="text-foreground/80">
                {locationInfo?.name}, {locationInfo?.region}, {locationInfo?.country}
              </CardDescription>
            </div>
            <div className="flex gap-1 border border-white/30 rounded-lg bg-white/20 backdrop-blur-sm p-0.5">
              <Button
                variant={unit === "C" ? "default" : "ghost"}
                size="sm"
                onClick={() => setUnit("C")}
                className="rounded-r-none"
              >
                °C
              </Button>
              <Button
                variant={unit === "F" ? "default" : "ghost"}
                size="sm"
                onClick={() => setUnit("F")}
                className="rounded-l-none"
              >
                °F
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Image src={`https:${current.condition.icon}`} alt={current.condition.text} width={64} height={64} />
            <div>
              <p className="text-4xl font-bold">{getTemp(current.temp_c, current.temp_f)}</p>
              <p className="text-muted-foreground">{current.condition.text}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-foreground/70">Feels Like</p>
              <p className="font-medium text-foreground">{getTemp(current.feelslike_c, current.feelslike_f)}</p>
            </div>
            <div>
              <p className="text-foreground/70">Humidity</p>
              <p className="font-medium text-foreground">{current.humidity}%</p>
            </div>
            <div>
              <p className="text-foreground/70">Wind Speed</p>
              <p className="font-medium text-foreground">
                {unit === "C" ? `${current.wind_kph} km/h` : `${current.wind_mph} mph`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apple-style frosted glass card for forecast */}
      <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-foreground">5-Day Forecast</CardTitle>
          <div className="mt-2 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-amber-400/20 rounded-lg animate-pulse blur-sm" />
            <CardDescription className="relative bg-gradient-to-r from-amber-50/90 to-orange-50/90 backdrop-blur-sm border-2 border-amber-400/50 rounded-lg px-4 py-3 text-amber-900 font-medium shadow-lg animate-[slideIn_0.5s_ease-out]">
              <span className="inline-flex items-center gap-2">
                <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Daily high/low temperature predictions (may differ from current conditions)
              </span>
            </CardDescription>
          </div>
          <p className="text-sm text-foreground/70 mt-2">Click on any day to see its weather background</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {forecast.map((day) => {
              const isTodayForecast = isToday(new Date(day.date))
              const isSelected = selectedDay === day.date
              return (
                <div
                  key={day.date}
                  onClick={() => handleDayClick(day.date, day.day.condition.text)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 shadow-lg transition-all cursor-pointer transform hover:scale-105 hover:shadow-2xl ${
                    isSelected
                      ? "border-green-400/70 bg-green-50/90 backdrop-blur-lg ring-4 ring-green-400/50"
                      : isTodayForecast
                        ? "border-blue-400/50 bg-blue-50/80 backdrop-blur-lg ring-2 ring-blue-400/30"
                        : "border-white/30 bg-white/60 backdrop-blur-lg hover:bg-white/70"
                  }`}
                >
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{format(new Date(day.date), "EEE, MMM d")}</p>
                    {isTodayForecast && (
                      <p className="text-xs font-semibold text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full mt-1">
                        Today
                      </p>
                    )}
                    {isSelected && (
                      <p className="text-xs font-semibold text-green-600 bg-green-100/80 px-2 py-0.5 rounded-full mt-1">
                        Selected
                      </p>
                    )}
                  </div>
                  <Image src={`https:${day.day.condition.icon}`} alt={day.day.condition.text} width={48} height={48} />
                  <p className="text-xs text-foreground/70 text-center">{day.day.condition.text}</p>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      {getTemp(day.day.maxtemp_c, day.day.maxtemp_f)}
                    </p>
                    <p className="text-xs text-foreground/70">{getTemp(day.day.mintemp_c, day.day.mintemp_f)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

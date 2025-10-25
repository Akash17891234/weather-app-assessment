"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WeatherData } from "@/lib/types"

interface WeatherSearchProps {
  onWeatherFetched: (
    location: string,
    locationType: string,
    startDate: Date,
    endDate: Date,
    weatherData: WeatherData,
  ) => void
}

interface LocationSuggestion {
  id: number
  name: string
  region: string
  country: string
  lat: number
  lon: number
  displayName: string
}

export function WeatherSearch({ onWeatherFetched }: WeatherSearchProps) {
  const [location, setLocation] = useState("")
  const [locationType, setLocationType] = useState<"city" | "zip" | "coordinates" | "landmark">("city")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (location.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/location-search?q=${encodeURIComponent(location)}`)

        // Check if response is JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error("[v0] Location search returned non-JSON response")
          setSuggestions([])
          setShowSuggestions(false)
          setIsSearching(false)
          return
        }

        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setShowSuggestions(data.suggestions && data.suggestions.length > 0)
      } catch (err) {
        console.error("[v0] Location search error:", err)
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [location])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setLocation(suggestion.displayName)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!location.trim()) {
      setError("Please enter a location")
      return
    }

    if (!startDate || !endDate) {
      setError("Please select both start and end dates")
      return
    }

    if (endDate < startDate) {
      setError("End date must be after start date")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}&days=5`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch weather data")
      }

      onWeatherFetched(location, locationType, startDate, endDate, data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCurrentLocation = () => {
    setIsGettingLocation(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const response = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`)
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch weather data")
          }

          setLocation(`${data.location.name}, ${data.location.country}`)
          setLocationType("coordinates")

          if (startDate && endDate) {
            onWeatherFetched(`${data.location.name}, ${data.location.country}`, "coordinates", startDate, endDate, data)
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch weather data")
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        setError("Unable to retrieve your location")
        setIsGettingLocation(false)
      },
    )
  }

  return (
    <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-foreground">Search Weather</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter a location and date range to get weather information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2 relative">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter city, zip code, or coordinates"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-white/80 backdrop-blur-xl border border-white/30 rounded-lg shadow-2xl max-h-60 overflow-auto"
                >
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <div className="font-medium">{suggestion.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {suggestion.region}, {suggestion.country}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {isSearching && location.length >= 2 && (
                <p className="text-xs text-muted-foreground mt-1">Searching locations...</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-type">Type</Label>
              <Select value={locationType} onValueChange={(value: any) => setLocationType(value)}>
                <SelectTrigger id="location-type" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="city">City</SelectItem>
                  <SelectItem value="zip">Zip Code</SelectItem>
                  <SelectItem value="coordinates">Coordinates</SelectItem>
                  <SelectItem value="landmark">Landmark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search Weather"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleCurrentLocation} disabled={isGettingLocation}>
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Current Location
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

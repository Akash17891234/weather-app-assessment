import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const apiKey = process.env.WEATHER_API_KEY

    if (!apiKey) {
      console.error("[v0] WEATHER_API_KEY is not set")
      return NextResponse.json({ suggestions: [], error: "API key not configured" }, { status: 500 })
    }

    const response = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(query)}`,
    )

    if (!response.ok) {
      console.error("[v0] WeatherAPI search failed:", response.status, response.statusText)
      return NextResponse.json({ suggestions: [] })
    }

    const data = await response.json()

    const suggestions = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      region: item.region,
      country: item.country,
      lat: item.lat,
      lon: item.lon,
      displayName: `${item.name}, ${item.region}, ${item.country}`,
    }))

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("[v0] Location search error:", error)
    return NextResponse.json({ suggestions: [], error: "Search failed" }, { status: 500 })
  }
}

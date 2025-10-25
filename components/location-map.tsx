"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, MapPin } from "lucide-react"
import type { LocationInfo } from "@/lib/types"

interface LocationMapProps {
  location: LocationInfo
}

export function LocationMap({ location }: LocationMapProps) {
  const { name, region, country, lat, lon } = location

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=12`

  return (
    <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-foreground">Location</CardTitle>
        <CardDescription className="text-muted-foreground">
          {name}, {region}, {country}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Coordinates: {lat.toFixed(4)}, {lon.toFixed(4)}
          </span>
        </div>

        <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted border border-white/30">
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.1},${lat - 0.1},${lon + 0.1},${lat + 0.1}&layer=mapnik&marker=${lat},${lon}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in Google Maps
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
            <a href={openStreetMapUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              OpenStreetMap
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

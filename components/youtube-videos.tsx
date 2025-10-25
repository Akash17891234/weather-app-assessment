"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface YouTubeVideosProps {
  location: string
}

interface Video {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
}

export function YouTubeVideos({ location }: YouTubeVideosProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true)
      setMessage(null)

      try {
        const response = await fetch(`/api/youtube?location=${encodeURIComponent(location)}`)
        const data = await response.json()

        if (!response.ok) {
          setMessage(data.error || "Failed to fetch videos")
          setVideos([])
        } else {
          setVideos(data.videos || [])
          setMessage(data.message || null)
        }
      } catch (err) {
        setMessage("Failed to load videos")
        setVideos([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideos()
  }, [location])

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-2xl">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (message) {
    return (
      <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-foreground">Videos About {location}</CardTitle>
          <CardDescription className="text-muted-foreground">Travel and tourism videos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{message}</p>
          {message.includes("not configured") && (
            <p className="mt-2 text-xs text-muted-foreground">
              Add YOUTUBE_API_KEY environment variable to enable this feature.
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-foreground">Videos About {location}</CardTitle>
        <CardDescription className="text-muted-foreground">Travel and tourism videos</CardDescription>
      </CardHeader>
      <CardContent>
        {videos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No videos found for this location.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-lg border border-white/30 bg-white/60 backdrop-blur-lg transition-all hover:border-white/50 hover:bg-white/70 shadow-lg"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-medium text-foreground">{video.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{video.channelTitle}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

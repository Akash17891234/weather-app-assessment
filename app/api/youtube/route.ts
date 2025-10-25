import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const location = searchParams.get("location")

  if (!location) {
    return NextResponse.json({ error: "Location is required" }, { status: 400 })
  }

  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      {
        videos: [],
        message: "YouTube API key not configured",
      },
      { status: 200 },
    )
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(location + " travel tourism")}&type=video&maxResults=6&key=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch YouTube videos")
    }

    const data = await response.json()

    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
    }))

    return NextResponse.json({ videos })
  } catch (error) {
    return NextResponse.json(
      {
        videos: [],
        message: "Failed to fetch videos",
      },
      { status: 200 },
    )
  }
}

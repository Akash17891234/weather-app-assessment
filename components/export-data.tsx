"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { WeatherSearch } from "@/lib/types"

export function ExportData() {
  const [isExporting, setIsExporting] = useState(false)
  const supabase = createClient()

  const fetchAllData = async (): Promise<WeatherSearch[]> => {
    const { data, error } = await supabase
      .from("weather_searches")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  const exportAsJSON = async () => {
    setIsExporting(true)
    try {
      const data = await fetchAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      downloadFile(blob, "weather-searches.json")
    } catch (error) {
      console.error("[v0] Export error:", error)
      alert("Failed to export data")
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsCSV = async () => {
    setIsExporting(true)
    try {
      const data = await fetchAllData()

      if (data.length === 0) {
        alert("No data to export")
        return
      }

      const headers = ["ID", "Location", "Location Type", "Start Date", "End Date", "Created At"]
      const rows = data.map((item) => [
        item.id,
        item.location,
        item.location_type,
        item.start_date,
        item.end_date,
        item.created_at,
      ])

      const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      downloadFile(blob, "weather-searches.csv")
    } catch (error) {
      console.error("[v0] Export error:", error)
      alert("Failed to export data")
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsXML = async () => {
    setIsExporting(true)
    try {
      const data = await fetchAllData()

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<weather_searches>
${data
  .map(
    (item) => `  <search>
    <id>${item.id}</id>
    <location>${escapeXml(item.location)}</location>
    <location_type>${item.location_type}</location_type>
    <start_date>${item.start_date}</start_date>
    <end_date>${item.end_date}</end_date>
    <created_at>${item.created_at}</created_at>
  </search>`,
  )
  .join("\n")}
</weather_searches>`

      const blob = new Blob([xml], { type: "application/xml" })
      downloadFile(blob, "weather-searches.xml")
    } catch (error) {
      console.error("[v0] Export error:", error)
      alert("Failed to export data")
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsMarkdown = async () => {
    setIsExporting(true)
    try {
      const data = await fetchAllData()

      const markdown = `# Weather Searches

| ID | Location | Type | Start Date | End Date | Created At |
|---|---|---|---|---|---|
${data
  .map(
    (item) =>
      `| ${item.id} | ${item.location} | ${item.location_type} | ${item.start_date} | ${item.end_date} | ${item.created_at} |`,
  )
  .join("\n")}
`

      const blob = new Blob([markdown], { type: "text/markdown" })
      downloadFile(blob, "weather-searches.md")
    } catch (error) {
      console.error("[v0] Export error:", error)
      alert("Failed to export data")
    } finally {
      setIsExporting(false)
    }
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const escapeXml = (str: string) => {
    return str.replace(/[<>&'"]/g, (char) => {
      switch (char) {
        case "<":
          return "&lt;"
        case ">":
          return "&gt;"
        case "&":
          return "&amp;"
        case "'":
          return "&apos;"
        case '"':
          return "&quot;"
        default:
          return char
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isExporting}
          className="bg-white/70 backdrop-blur-xl border-white/30 shadow-2xl hover:bg-white/80"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white border-2 border-gray-200 shadow-2xl">
        <DropdownMenuItem onClick={exportAsJSON}>Export as JSON</DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsCSV}>Export as CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsXML}>Export as XML</DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsMarkdown}>Export as Markdown</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

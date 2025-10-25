"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export function DatabaseSetup() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const setupDatabase = async () => {
    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/setup-db", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message)
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to setup database")
      }
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "Failed to setup database")
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-900">Database Setup Required</CardTitle>
        <CardDescription className="text-orange-700">
          The weather_searches table needs to be created before you can use the app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-orange-800">
            Click the button below to automatically create the database table, or follow the manual steps:
          </p>
          <ol className="list-decimal list-inside text-sm text-orange-800 space-y-1 ml-2">
            <li>Go to your Supabase Dashboard</li>
            <li>Click on "SQL Editor" in the left menu</li>
            <li>
              Copy the SQL from{" "}
              <code className="bg-orange-100 px-1 rounded">scripts/001_create_weather_searches.sql</code>
            </li>
            <li>Paste and run it in the SQL Editor</li>
          </ol>
        </div>

        <Button onClick={setupDatabase} disabled={status === "loading" || status === "success"} className="w-full">
          {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {status === "success" && <CheckCircle2 className="mr-2 h-4 w-4" />}
          {status === "idle" && "Setup Database Automatically"}
          {status === "loading" && "Setting up..."}
          {status === "success" && "Database Ready!"}
          {status === "error" && "Try Manual Setup"}
        </Button>

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {message} Refresh the page to start using the app.
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert className="bg-red-50 border-red-200">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { CalendarIcon, Pencil, Trash2, Eye, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WeatherSearch } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface WeatherHistoryProps {
  onViewWeather: (search: WeatherSearch) => void
  refreshTrigger?: number
}

export function WeatherHistory({ onViewWeather, refreshTrigger }: WeatherHistoryProps) {
  const [searches, setSearches] = useState<WeatherSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingSearch, setEditingSearch] = useState<WeatherSearch | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showClearAllDialog, setShowClearAllDialog] = useState(false)
  const [isClearingAll, setIsClearingAll] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editLocation, setEditLocation] = useState("")
  const [editLocationType, setEditLocationType] = useState("")
  const [editStartDate, setEditStartDate] = useState<Date | null>(null)
  const [editEndDate, setEditEndDate] = useState<Date | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const supabase = createClient()

  const fetchSearches = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("weather_searches")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setSearches(data || [])
    } catch (err) {
      console.error("[v0] Error fetching searches:", err)
      setError("Failed to load weather history")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSearches()
  }, [refreshTrigger])

  const handleEdit = (search: WeatherSearch) => {
    setEditingSearch(search)
    setEditLocation(search.location)
    setEditLocationType(search.location_type)
    setEditStartDate(new Date(search.start_date))
    setEditEndDate(new Date(search.end_date))
  }

  const handleUpdate = async () => {
    if (!editingSearch || !editStartDate || !editEndDate) return

    if (editEndDate < editStartDate) {
      setError("End date must be after start date")
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("weather_searches")
        .update({
          location: editLocation,
          location_type: editLocationType,
          start_date: format(editStartDate, "yyyy-MM-dd"),
          end_date: format(editEndDate, "yyyy-MM-dd"),
        })
        .eq("id", editingSearch.id)

      if (error) throw error

      await fetchSearches()
      setEditingSearch(null)
    } catch (err) {
      console.error("[v0] Error updating search:", err)
      setError("Failed to update search")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("weather_searches").delete().eq("id", id)

      if (error) throw error

      await fetchSearches()
      setDeletingId(null)
    } catch (err) {
      console.error("[v0] Error deleting search:", err)
      setError("Failed to delete search")
    }
  }

  const handleClearAll = async () => {
    setIsClearingAll(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("weather_searches")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")

      if (error) throw error

      await fetchSearches()
      setShowClearAllDialog(false)
    } catch (err) {
      console.error("[v0] Error clearing all searches:", err)
      setError("Failed to clear all searches")
    } finally {
      setIsClearingAll(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-2xl">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-2xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-foreground">Weather Search History</CardTitle>
              <CardDescription className="text-foreground/80">
                View, edit, or delete your previous weather searches
              </CardDescription>
            </div>
            {searches.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowClearAllDialog(true)}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg border-2 border-red-700 font-semibold"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All History
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          {searches.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No weather searches yet. Start by searching for a location above.
            </p>
          ) : (
            <div className="space-y-4">
              {searches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between rounded-lg border border-white/30 bg-white/60 backdrop-blur-lg p-4 shadow-lg hover:bg-white/70 transition-all"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{search.location}</p>
                    <p className="text-sm text-foreground/70">
                      {format(new Date(search.start_date), "MMM d, yyyy")} -{" "}
                      {format(new Date(search.end_date), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-foreground/60 capitalize">Type: {search.location_type}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onViewWeather(search)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(search)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeletingId(search.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingSearch} onOpenChange={(open) => !open && setEditingSearch(null)}>
        <DialogContent className="bg-white border-2 border-gray-300 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Edit Weather Search</DialogTitle>
            <DialogDescription className="text-gray-700">
              Update the location or date range for this weather search
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="Enter location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location-type">Type</Label>
                <Select value={editLocationType} onValueChange={(value: any) => setEditLocationType(value)}>
                  <SelectTrigger id="edit-location-type" className="w-32">
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
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editStartDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editStartDate ? format(editStartDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={editStartDate} onSelect={setEditStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editEndDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editEndDate ? format(editEndDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={editEndDate} onSelect={setEditEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingSearch(null)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="bg-white border-2 border-gray-300 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700">
              This action cannot be undone. This will permanently delete this weather search from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <AlertDialogContent className="bg-white border-2 border-gray-300 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Clear All History?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700">
              This action cannot be undone. This will permanently delete all {searches.length} weather search
              {searches.length !== 1 ? "es" : ""} from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isClearingAll}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              disabled={isClearingAll}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isClearingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                "Clear All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

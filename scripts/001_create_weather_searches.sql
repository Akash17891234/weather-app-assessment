-- Create weather_searches table to store user weather queries and results
CREATE TABLE IF NOT EXISTS public.weather_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  location_type TEXT NOT NULL CHECK (location_type IN ('city', 'zip', 'coordinates', 'landmark')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  temperature_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Enable Row Level Security
ALTER TABLE public.weather_searches ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required per assessment requirements)
-- Users can view all weather searches
CREATE POLICY "weather_searches_select_all" ON public.weather_searches FOR SELECT USING (true);

-- Users can insert weather searches
CREATE POLICY "weather_searches_insert_all" ON public.weather_searches FOR INSERT WITH CHECK (true);

-- Users can update weather searches
CREATE POLICY "weather_searches_update_all" ON public.weather_searches FOR UPDATE USING (true);

-- Users can delete weather searches
CREATE POLICY "weather_searches_delete_all" ON public.weather_searches FOR DELETE USING (true);

-- Create index for faster location searches
CREATE INDEX IF NOT EXISTS weather_searches_location_idx ON public.weather_searches(location);
CREATE INDEX IF NOT EXISTS weather_searches_created_at_idx ON public.weather_searches(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger to update updated_at on row updates
DROP TRIGGER IF EXISTS set_updated_at ON public.weather_searches;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.weather_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

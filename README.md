# Weather App - Technical Assessment

A full-stack weather application built with Next.js 16, featuring real-time weather data, CRUD operations, and multiple API integrations.

**Sole Developer:** AkashKrishna Bhukya

## 👨‍💻 Author & Contributor

This project was **independently developed by AkashKrishna Bhukya** as a technical assessment. All code, design decisions, architecture, and implementation were done solely by me.

**No other contributors or collaborators were involved in this project.**

## Overview

This weather application allows users to search for weather information by location, view 5-day forecasts, and manage their search history with full CRUD functionality. The app integrates multiple APIs and features an interactive UI with dynamic weather-based backgrounds.

## Features

### Core Functionality
- **Location Search**: Search by city name, zip code, coordinates, or landmarks with autocomplete suggestions
- **Current Weather**: Real-time weather data including temperature, humidity, wind speed, and conditions
- **5-Day Forecast**: Extended forecast with daily high/low temperatures and weather conditions
- **Current Location**: Automatic weather detection using GPS coordinates
- **Interactive Backgrounds**: Dynamic animated backgrounds that change based on weather conditions

### CRUD Operations
- **Create**: Save weather searches with location and date range to database
- **Read**: View complete search history with all weather details
- **Update**: Edit existing weather search records
- **Delete**: Remove individual searches or clear entire history

### API Integrations
- **WeatherAPI.com**: Real-time weather data and forecasts
- **YouTube API**: Location-based video suggestions
- **OpenStreetMap**: Interactive location mapping

### Additional Features
- Temperature unit toggle (Celsius/Fahrenheit)
- Date range validation
- Location validation with fuzzy matching
- Responsive design with glassmorphism UI
- Click-to-change forecast backgrounds

## Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19.2
- TypeScript
- Tailwind CSS v4
- shadcn/ui components

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL database)
- Server Actions

**APIs:**
- WeatherAPI.com
- YouTube Data API v3
- OpenStreetMap

## Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- A Supabase account
- WeatherAPI.com API key
- YouTube API key (optional)

## Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/weather-app-assessment.git
cd weather-app-assessment
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
# or
pnpm install
# or
yarn install
\`\`\`

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

\`\`\`env
# Weather API
WEATHER_API_KEY=your_weatherapi_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# YouTube API (Optional)
YOUTUBE_API_KEY=your_youtube_api_key_here
\`\`\`

## Getting API Keys

### WeatherAPI.com
1. Sign up at [weatherapi.com](https://www.weatherapi.com/)
2. Get your free API key from the dashboard
3. Add to `.env.local` as `WEATHER_API_KEY`

### Supabase
1. Create a project at [supabase.com](https://supabase.com/)
2. Go to Project Settings → API
3. Copy the Project URL and anon/service_role keys
4. Add to `.env.local`

### YouTube API (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add to `.env.local` as `YOUTUBE_API_KEY`

## Database Setup

1. **Run the SQL script in Supabase**

Go to your Supabase project → SQL Editor and run:

\`\`\`sql
-- Create weather_searches table
CREATE TABLE IF NOT EXISTS weather_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  current_weather JSONB,
  forecast JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_weather_searches_created_at 
ON weather_searches(created_at DESC);

-- Enable Row Level Security (optional)
ALTER TABLE weather_searches ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your needs)
CREATE POLICY "Allow all operations" ON weather_searches
FOR ALL USING (true) WITH CHECK (true);
\`\`\`

2. **Verify the table was created**

Check the Table Editor in Supabase to confirm `weather_searches` table exists.

## Running the Project

1. **Development mode**
\`\`\`bash
npm run dev
# or
pnpm dev
# or
yarn dev
\`\`\`

2. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

3. **Build for production**
\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
weather-app-assessment/
├── app/
│   ├── api/
│   │   ├── geocode/          # Location geocoding
│   │   ├── location-search/  # Location autocomplete
│   │   ├── setup-db/         # Database setup
│   │   ├── weather/          # Weather data fetching
│   │   └── youtube/          # YouTube video search
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── export-data.tsx       # Data export functionality
│   ├── location-map.tsx      # OpenStreetMap integration
│   ├── weather-background.tsx # Dynamic backgrounds
│   ├── weather-display.tsx   # Weather information display
│   ├── weather-history.tsx   # CRUD operations UI
│   ├── weather-search.tsx    # Search interface
│   └── youtube-videos.tsx    # YouTube integration
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser Supabase client
│   │   └── server.ts         # Server Supabase client
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utility functions
├── scripts/
│   └── 001_create_weather_searches.sql  # Database schema
└── README.md
\`\`\`

## Usage

### Searching for Weather

1. Enter a location in the search box (city, zip code, coordinates, or landmark)
2. Select from autocomplete suggestions
3. Choose start and end dates for the forecast range
4. Click "Search Weather" or use "Use Current Location"

### Managing Search History

- **View**: All searches are automatically saved and displayed in the history section
- **Edit**: Click the edit icon on any search to modify location or dates
- **Delete**: Click the trash icon to remove a search
- **Clear All**: Use the "Clear All History" button to remove all searches

### Interactive Features

- Click on any forecast day card to change the background animation
- Toggle between Celsius and Fahrenheit using the unit selector
- View location on the map
- Watch related YouTube videos about the location

## Development Decisions

### Why Next.js 16?
I chose Next.js 16 for its App Router, Server Actions, and improved performance with Turbopack. The framework provides excellent developer experience and production-ready features out of the box.

### Why Supabase?
Supabase offers a complete PostgreSQL database with real-time capabilities, authentication, and a great developer experience. The Row Level Security features ensure data protection.

### Why Tailwind CSS v4?
Tailwind CSS v4 provides utility-first styling with excellent performance. The new configuration system and improved IntelliSense make development faster.

### Design Approach
I implemented an Apple-style glassmorphism design with dynamic weather-based backgrounds to create an engaging, modern user experience while maintaining excellent readability.

## Challenges & Solutions

**Challenge 1: Weather API Rate Limits**
- Solution: Implemented caching and stored weather data in the database to reduce API calls

**Challenge 2: Date Range Validation**
- Solution: Added comprehensive validation to ensure end dates are after start dates and within API limits

**Challenge 3: Location Ambiguity**
- Solution: Implemented autocomplete with fuzzy matching to help users select the correct location

**Challenge 4: Dynamic Backgrounds Performance**
- Solution: Used CSS animations instead of JavaScript for smooth, performant weather animations

## Future Improvements

- [ ] Add user authentication for personalized search history
- [ ] Implement weather alerts and notifications
- [ ] Add more weather data visualizations (charts, graphs)
- [ ] Support for multiple languages
- [ ] Weather comparison between multiple locations
- [ ] Historical weather data analysis
- [ ] Mobile app version using React Native

## Deployment

This app is deployed on Vercel at: [weatherappakb.vercel.app](https://weatherappakb.vercel.app)

To deploy your own instance:

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

## License

This project was created as a technical assessment.

## Contact
**AkashKrishna Bhukya** - Sole Developer
- GitHub: [@Akash17891234](https://github.com/Akash17891234)
- Project Repository: [weather-app-assessment](https://github.com/Akash17891234/weather-app-assessment)

---

**© 2025 AkashKrishna Bhukya. All rights reserved.**

Independently developed and designed by AkashKrishna Bhukya for technical assessment purposes.

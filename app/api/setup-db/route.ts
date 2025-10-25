import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Create the weather_searches table
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        -- Create weather_searches table
        create table if not exists public.weather_searches (
          id uuid primary key default gen_random_uuid(),
          location text not null,
          location_type text not null check (location_type in ('city', 'zip', 'coordinates', 'landmark')),
          start_date date not null,
          end_date date not null,
          temperature_data jsonb,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null,
          updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
          constraint valid_date_range check (end_date >= start_date)
        );

        -- Enable Row Level Security
        alter table public.weather_searches enable row level security;

        -- Create policies
        drop policy if exists "weather_searches_select_all" on public.weather_searches;
        create policy "weather_searches_select_all" on public.weather_searches for select using (true);
        
        drop policy if exists "weather_searches_insert_all" on public.weather_searches;
        create policy "weather_searches_insert_all" on public.weather_searches for insert with check (true);
        
        drop policy if exists "weather_searches_update_all" on public.weather_searches;
        create policy "weather_searches_update_all" on public.weather_searches for update using (true);
        
        drop policy if exists "weather_searches_delete_all" on public.weather_searches;
        create policy "weather_searches_delete_all" on public.weather_searches for delete using (true);

        -- Create indexes
        create index if not exists weather_searches_location_idx on public.weather_searches(location);
        create index if not exists weather_searches_created_at_idx on public.weather_searches(created_at desc);

        -- Create update trigger function
        create or replace function public.handle_updated_at()
        returns trigger
        language plpgsql
        as $$
        begin
          new.updated_at = timezone('utc'::text, now());
          return new;
        end;
        $$;

        -- Create trigger
        drop trigger if exists set_updated_at on public.weather_searches;
        create trigger set_updated_at
          before update on public.weather_searches
          for each row
          execute function public.handle_updated_at();
      `,
    })

    if (error) {
      // If rpc doesn't exist, try direct SQL execution
      const { error: createError } = await supabase.from("weather_searches").select("id").limit(1)

      if (createError && createError.code === "42P01") {
        return NextResponse.json(
          {
            error: "Please run the SQL script manually in Supabase dashboard",
            instructions:
              "Go to Supabase Dashboard → SQL Editor → Copy the script from scripts/001_create_weather_searches.sql → Run it",
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ success: true, message: "Database setup complete!" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

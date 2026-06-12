-- Run this in Supabase SQL editor (Dashboard → SQL Editor → New query)

-- Lists table (one per shared group)
CREATE TABLE IF NOT EXISTS lists (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        TEXT        UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id     UUID        NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    text        TEXT        NOT NULL,
    checked     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trips table (saved shopping lists / "turer", one snapshot per trip)
CREATE TABLE IF NOT EXISTS trips (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id     UUID        NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    name        TEXT,
    items       JSONB       NOT NULL DEFAULT '[]'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Meals table (saved custom meals / "Meals", reusable ingredient lists)
CREATE TABLE IF NOT EXISTS meals (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id     UUID        NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    ingredients JSONB       NOT NULL DEFAULT '[]'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS items_list_id_idx ON items(list_id);
CREATE INDEX IF NOT EXISTS lists_code_idx    ON lists(code);
CREATE INDEX IF NOT EXISTS trips_list_id_idx ON trips(list_id);
CREATE INDEX IF NOT EXISTS meals_list_id_idx ON meals(list_id);

-- RLS: the join code is the only access control
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_lists" ON lists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_items" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_trips" ON trips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_meals" ON meals FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE lists;
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE trips;
ALTER PUBLICATION supabase_realtime ADD TABLE meals;

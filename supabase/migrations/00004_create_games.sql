create table public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  min_players int not null default 2,
  created_at timestamptz not null default now()
);

alter table public.games enable row level security;

create policy "Games are viewable by authenticated users"
  on public.games for select
  to authenticated
  using (true);

-- Seed initial games
insert into public.games (name, description) values
  ('Rock-Paper-Scissors', 'Classic hand game. Best of 3 rounds — loser does the chore.'),
  ('Coin Flip', 'Call it in the air. Wrong call loses.'),
  ('Thumb War', 'Lock hands, thumbs up. First to pin the other''s thumb for 3 seconds loses.'),
  ('Staring Contest', 'Look each other in the eyes. First to blink or laugh loses.'),
  ('Dice Roll', 'Everyone rolls a die. Lowest number loses. Re-roll ties.');

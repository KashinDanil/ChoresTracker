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
  ('Rock-Paper-Scissors', 'Classic hand game. Best of 3 rounds — the chosen one does the chore.'),
  ('Coin Flip', 'Call it in the air. Wrong call loses.'),
  ('Thumb War', 'Lock hands, thumbs up. First to pin the other''s thumb for 3 seconds loses.'),
  ('Staring Contest', 'Look each other in the eyes. First to blink or laugh loses.'),
  ('Dice Roll', 'Everyone rolls a die. Lowest number loses. Re-roll ties.'),
  ('Nose Goes', 'Last person to touch their nose is the chosen one. Ready? Go!'),
  ('Odds or Evens', 'Both players throw fingers (1-5). One calls odds, one calls evens. The sum decides.'),
  ('Chopsticks', 'The finger-counting game. Tap hands to add fingers. First to lose both hands does the chore.'),
  ('Hot Hands', 'One person holds palms down, the other tries to slap them. Three rounds — most slaps received does the chore.'),
  ('Guess the Number', 'One person thinks of a number 1-10. Others guess. Closest without going over wins. Furthest does the chore.'),
  ('Jinx', 'Everyone says a word at the same time. If two people say the same word, they do the chore. If nobody jinxes, go again.'),
  ('Balloon Pop', 'Pass an imaginary balloon around. Each person "inflates" it with a clap. Whoever "pops" it (group votes) does the chore.'),
  ('Last One Standing', 'Everyone holds one foot off the ground. Last person still balancing wins. First to put their foot down does the chore.'),
  ('Tongue Twister', 'Everyone tries to say "She sells seashells by the seashore" fast 3 times. Worst attempt does the chore.'),
  ('Paper Airplane', 'Everyone makes a paper airplane and throws it. Shortest distance does the chore.');

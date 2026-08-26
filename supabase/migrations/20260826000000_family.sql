-- Family Schedules: weekly school schedule, member identified by hardcoded name
create table if not exists family_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  member_name text not null,           -- 'Embun' | 'Langit' | 'Senja'
  day_of_week int not null check (day_of_week between 1 and 6), -- 1=Mon..6=Sat
  subject text not null,
  start_time text not null,            -- 'HH:MM'
  end_time text not null,
  note text,
  created_at timestamptz default now()
);

alter table family_schedules enable row level security;

create policy "Users manage own schedules" on family_schedules
  for all using (auth.uid() = user_id);

create index family_schedules_user_member on family_schedules(user_id, member_name, day_of_week);

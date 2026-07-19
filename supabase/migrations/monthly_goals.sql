create table if not exists monthly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  narrative text,
  deadline date,
  created_at timestamptz default now()
);
alter table monthly_goals enable row level security;
create policy "Users manage own monthly goals" on monthly_goals
  for all using (auth.uid() = user_id);

create table if not exists goal_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  goal_id uuid references monthly_goals(id) on delete cascade not null,
  task text not null,
  week smallint not null check (week between 1 and 4),
  done boolean not null default false,
  created_at timestamptz default now()
);
alter table goal_tasks enable row level security;
create policy "Users manage own goal tasks" on goal_tasks
  for all using (auth.uid() = user_id);

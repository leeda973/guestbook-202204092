create table reactions (
  kudo_id integer not null references kudos (id) on delete cascade,
  emoji text not null check (emoji in ('fire', 'clap', 'heart', 'bulb')),
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  -- 같은 Visitor가 같은 Kudo에 같은 이모지를 두 번 누를 수 없다.
  primary key (kudo_id, emoji, visitor_id)
);

-- 1분 고정 윈도 요청 횟수. key는 "행위:IP" 형태다.
create table rate_limits (
  key text not null,
  window_start timestamptz not null,
  count integer not null default 1,
  primary key (key, window_start)
);

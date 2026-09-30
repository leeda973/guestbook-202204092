create table kudos (
  id integer generated always as identity primary key,
  author text not null default '익명' check (char_length(author) between 1 and 20),
  recipient text check (char_length(recipient) between 1 and 20),
  category text not null check (category in ('cheer', 'feedback', 'thanks', 'praise')),
  -- 200자 제한은 보이는 글자(grapheme) 기준으로 앱에서 검증한다. 여기는 코드 포인트 기준 안전망이다.
  message text not null check (char_length(message) between 1 and 1000),
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

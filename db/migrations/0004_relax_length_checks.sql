-- 글자 수 제한(작성자·받는 사람 20자, 메시지 200자)은 앱이 "보이는 글자(grapheme)" 기준으로 검증한다.
-- char_length는 코드 포인트를 세므로(❤️ = 2, 👨‍👩‍👧‍👦 = 7) 같은 한도를 DB에 두면 앱 검증을 통과한 입력이 500으로 실패한다.
-- 그래서 DB 제약은 이모지로만 꽉 채운 최대 입력도 들어가는 넉넉한 안전망으로 둔다.
alter table kudos drop constraint kudos_author_check;
alter table kudos drop constraint kudos_recipient_check;
alter table kudos drop constraint kudos_message_check;
alter table kudos add constraint kudos_author_check check (char_length(author) between 1 and 400);
alter table kudos add constraint kudos_recipient_check check (char_length(recipient) between 1 and 400);
alter table kudos add constraint kudos_message_check check (char_length(message) between 1 and 4000);

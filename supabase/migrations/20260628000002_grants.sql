-- service_role (バックエンドが使う API ロール) に対するテーブル権限付与
-- 「Automatically expose new tables」を無効化しているため、RLS ポリシーとは別に
-- 明示的な GRANT が必要になる。

grant usage on schema public to service_role;
grant select, insert, update, delete on members, daily_summaries, events, articles to service_role;

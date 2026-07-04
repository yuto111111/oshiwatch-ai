-- 「今日のまとめ」を参考アプリ (oshiai-app) のように箇条書き + 出典リンク付きにするための拡張
alter table daily_summaries add column bullets jsonb not null default '[]'::jsonb;
alter table daily_summaries add column sources jsonb not null default '[]'::jsonb;

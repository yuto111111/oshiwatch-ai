-- クロールした記事にタイトル・公開日時を保存できるようにする
alter table articles add column title text;
alter table articles add column published_at timestamptz;

-- OshiWatch AI 初期スキーマ
-- Snow Man メンバー情報・日次サマリー・イベント・RAG用記事

-- pgvector 拡張 (RAG チャット用)
create extension if not exists vector;

-- メンバーマスタ（固定9名）
create table members (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,         -- 例: "渡辺翔太"
  name_en    text not null unique,  -- 例: "shota-watanabe" (URLスラッグ)
  image_url  text,
  birth_date date,
  color      text,                  -- テーマカラー (hex)
  created_at timestamptz default now()
);

-- 日次サマリー（グループ全体 + メンバー個別）
-- member_id IS NULL → グループ全体サマリー
create table daily_summaries (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid references members(id) on delete cascade,
  summary    text not null,
  date       date not null,
  created_at timestamptz default now(),
  unique (member_id, date)
);

-- 予定・イベント
create table events (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid references members(id) on delete cascade,
  title       text not null,
  event_date  date not null,
  description text,
  source_url  text,
  created_at  timestamptz default now()
);

-- RAGチャット用 記事（クロール済みコンテンツ）
create table articles (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid references members(id) on delete cascade,
  content     text not null,
  source_url  text,
  embedding   vector(768),
  crawled_at  timestamptz default now()
);

-- embedding 検索用インデックス
create index on articles using hnsw (embedding vector_cosine_ops);

-- Snow Man メンバー 初期データ
insert into members (name, name_en, color) values
  ('岩本照',   'hikaru-iwamoto',   '#E53E3E'),
  ('深澤辰哉', 'tatsuya-fukazawa', '#ED8936'),
  ('渡辺翔太', 'shota-watanabe',   '#ECC94B'),
  ('向井康二', 'koji-mukai',       '#48BB78'),
  ('阿部亮平', 'ryohei-abe',       '#4299E1'),
  ('宮舘涼太', 'ryota-miyadate',   '#667EEA'),
  ('佐久間大介','daisuke-sakuma',   '#ED64A6'),
  ('目黒蓮',   'ren-meguro',       '#38B2AC'),
  ('ラウール',  'raul',             '#9F7AEA');
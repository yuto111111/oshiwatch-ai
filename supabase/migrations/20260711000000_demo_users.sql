-- サンプルユーザー: ログイン不要でパーソナライズ体験を提供するため
-- ダッシュボード /dashboard/[user_id] からアクセスされる想定
--
-- 3 パターンのペルソナで RAG エージェントのユーザー文脈注入を実演する:
--   demo_uta : 単推し + 準推し (向井康二 + 目黒蓮) — 現代的な "推し変" 型
--   demo_ren : 箱推し (全 9 名) — 箱推し型
--   demo_sho : 単推し (岩本照) — 集中型
create table if not exists demo_users (
  id text primary key,
  display_name text not null,
  followed_member_ids uuid[] not null default '{}',
  interests text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table demo_users enable row level security;

drop policy if exists "public read demo_users" on demo_users;
create policy "public read demo_users" on demo_users for select using (true);

-- PostgREST 経由でアクセスするために各ロールに SELECT を明示的に付与
-- (RLS ポリシーとは別に、テーブルレベルの GRANT が必要)
grant select on demo_users to anon, authenticated, service_role;

-- サンプルユーザ 3 名を seed
-- members.name_en は "koji-mukai", "ren-meguro", "hikaru-iwamoto" 等の
-- "first-last" フルネーム形式 (initial_schema seed 参照)
insert into demo_users (id, display_name, followed_member_ids, interests) values
  (
    'demo_uta',
    'Uta さん',
    array(select id from members where name_en in ('koji-mukai', 'ren-meguro')),
    array['live', 'drama']
  ),
  (
    'demo_ren',
    'Ren さん (箱推し)',
    array(select id from members),
    array['variety', 'live', 'drama']
  ),
  (
    'demo_sho',
    'Sho さん',
    array(select id from members where name_en = 'hikaru-iwamoto'),
    array['live']
  )
on conflict (id) do update set
  display_name = excluded.display_name,
  followed_member_ids = excluded.followed_member_ids,
  interests = excluded.interests;

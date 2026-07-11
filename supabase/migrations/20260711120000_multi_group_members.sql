-- 多グループ対応: members に group_name を追加し、
-- SixTONES / なにわ男子 / 乃木坂46 / SEVENTEEN のメンバーを seed する。
--
-- crawl.py の Google News クエリを "{group_name} {member.name}" に変えることで
-- 同姓同名の別人記事を混入させにくくする。

alter table members
  add column if not exists group_name text;

-- 既存 Snow Man メンバーには "Snow Man" を明示的にセット
update members set group_name = 'Snow Man' where group_name is null;

-- 新規メンバー seed
-- name_en は URL slug 用 (kebab-case)、name は日本語表示用、color は既存カラーテーマに準拠
insert into members (name, name_en, color, group_name) values
  -- SixTONES (6 名)
  ('ジェシー',     'jesse',             '#E53E3E', 'SixTONES'),
  ('京本大我',     'taiga-kyomoto',     '#805AD5', 'SixTONES'),
  ('松村北斗',     'hokuto-matsumura',  '#2D3748', 'SixTONES'),
  ('髙地優吾',     'yugo-kochi',        '#3182CE', 'SixTONES'),
  ('森本慎太郎',   'shintaro-morimoto', '#D69E2E', 'SixTONES'),
  ('田中樹',       'juri-tanaka',       '#38A169', 'SixTONES'),

  -- なにわ男子 (7 名)
  ('西畑大吾',     'daigo-nishihata',   '#C53030', 'なにわ男子'),
  ('大西流星',     'ryusei-onishi',     '#D69E2E', 'なにわ男子'),
  ('道枝駿佑',     'shunsuke-michieda', '#D53F8C', 'なにわ男子'),
  ('高橋恭平',     'kyohei-takahashi',  '#38B2AC', 'なにわ男子'),
  ('長尾謙杜',     'kento-nagao',       '#38A169', 'なにわ男子'),
  ('藤原丈一郎',   'joichiro-fujiwara', '#DD6B20', 'なにわ男子'),
  ('大橋和也',     'kazuya-ohashi',     '#805AD5', 'なにわ男子'),

  -- 乃木坂46 (5 名)
  ('山下美月',     'mizuki-yamashita',  '#805AD5', '乃木坂46'),
  ('遠藤さくら',   'sakura-endo',       '#D53F8C', '乃木坂46'),
  ('与田祐希',     'yuki-yoda',         '#3182CE', '乃木坂46'),
  ('賀喜遥香',     'haruka-kaki',       '#B794F4', '乃木坂46'),
  ('井上和',       'nagi-inoue',        '#F687B3', '乃木坂46'),

  -- SEVENTEEN (5 名、日本での知名度上位)
  ('MINGYU',       'mingyu',            '#2C5282', 'SEVENTEEN'),
  ('VERNON',       'vernon',            '#48BB78', 'SEVENTEEN'),
  ('JEONGHAN',     'jeonghan',          '#0EA5E9', 'SEVENTEEN'),
  ('WOOZI',        'woozi',             '#805AD5', 'SEVENTEEN'),
  ('DK',           'dk',                '#D69E2E', 'SEVENTEEN')
on conflict do nothing;

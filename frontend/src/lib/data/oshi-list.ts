/**
 * 対応中の推し (グループ + メンバー) の静的マスタ。
 * バックエンド Supabase members テーブルと同期して手動更新。
 */

export type Oshi = {
  name_en: string;
  name: string;
  color: string;
  group: string;
};

export type OshiGroup = {
  id: string;
  name: string;
  color: string;
  description?: string;
};

export const OSHI_GROUPS: OshiGroup[] = [
  {
    id: "snow-man",
    name: "Snow Man",
    color: "#0EA5E9",
    description: "STARTO ENTERTAINMENT / 9 名",
  },
  {
    id: "sixtones",
    name: "SixTONES",
    color: "#E53E3E",
    description: "STARTO ENTERTAINMENT / 6 名",
  },
  {
    id: "naniwa-danshi",
    name: "なにわ男子",
    color: "#D53F8C",
    description: "STARTO ENTERTAINMENT / 7 名",
  },
  {
    id: "nogizaka46",
    name: "乃木坂46",
    color: "#805AD5",
    description: "坂道シリーズ / 5 名",
  },
  {
    id: "seventeen",
    name: "SEVENTEEN",
    color: "#48BB78",
    description: "K-POP · PLEDIS / 5 名",
  },
];

export const OSHI_LIST: Oshi[] = [
  // Snow Man
  { name_en: "hikaru-iwamoto",    name: "岩本照",     color: "#C53030", group: "Snow Man" },
  { name_en: "tatsuya-fukazawa",  name: "深澤辰哉",   color: "#DD6B20", group: "Snow Man" },
  { name_en: "shota-watanabe",    name: "渡辺翔太",   color: "#D69E2E", group: "Snow Man" },
  { name_en: "ryohei-abe",        name: "阿部亮平",   color: "#38A169", group: "Snow Man" },
  { name_en: "koji-mukai",        name: "向井康二",   color: "#48BB78", group: "Snow Man" },
  { name_en: "ren-meguro",        name: "目黒蓮",     color: "#38B2AC", group: "Snow Man" },
  { name_en: "ryota-miyadate",    name: "宮舘涼太",   color: "#3182CE", group: "Snow Man" },
  { name_en: "daisuke-sakuma",    name: "佐久間大介", color: "#805AD5", group: "Snow Man" },
  { name_en: "raul",              name: "ラウール",   color: "#D53F8C", group: "Snow Man" },

  // SixTONES
  { name_en: "jesse",             name: "ジェシー",   color: "#E53E3E", group: "SixTONES" },
  { name_en: "taiga-kyomoto",     name: "京本大我",   color: "#805AD5", group: "SixTONES" },
  { name_en: "hokuto-matsumura",  name: "松村北斗",   color: "#2D3748", group: "SixTONES" },
  { name_en: "yugo-kochi",        name: "髙地優吾",   color: "#3182CE", group: "SixTONES" },
  { name_en: "shintaro-morimoto", name: "森本慎太郎", color: "#D69E2E", group: "SixTONES" },
  { name_en: "juri-tanaka",       name: "田中樹",     color: "#38A169", group: "SixTONES" },

  // なにわ男子
  { name_en: "daigo-nishihata",   name: "西畑大吾",   color: "#C53030", group: "なにわ男子" },
  { name_en: "ryusei-onishi",     name: "大西流星",   color: "#D69E2E", group: "なにわ男子" },
  { name_en: "shunsuke-michieda", name: "道枝駿佑",   color: "#D53F8C", group: "なにわ男子" },
  { name_en: "kyohei-takahashi",  name: "高橋恭平",   color: "#38B2AC", group: "なにわ男子" },
  { name_en: "kento-nagao",       name: "長尾謙杜",   color: "#38A169", group: "なにわ男子" },
  { name_en: "joichiro-fujiwara", name: "藤原丈一郎", color: "#DD6B20", group: "なにわ男子" },
  { name_en: "kazuya-ohashi",     name: "大橋和也",   color: "#805AD5", group: "なにわ男子" },

  // 乃木坂46
  { name_en: "mizuki-yamashita",  name: "山下美月",   color: "#805AD5", group: "乃木坂46" },
  { name_en: "sakura-endo",       name: "遠藤さくら", color: "#D53F8C", group: "乃木坂46" },
  { name_en: "yuki-yoda",         name: "与田祐希",   color: "#3182CE", group: "乃木坂46" },
  { name_en: "haruka-kaki",       name: "賀喜遥香",   color: "#B794F4", group: "乃木坂46" },
  { name_en: "nagi-inoue",        name: "井上和",     color: "#F687B3", group: "乃木坂46" },

  // SEVENTEEN
  { name_en: "mingyu",            name: "MINGYU",     color: "#2C5282", group: "SEVENTEEN" },
  { name_en: "vernon",            name: "VERNON",     color: "#48BB78", group: "SEVENTEEN" },
  { name_en: "jeonghan",          name: "JEONGHAN",   color: "#0EA5E9", group: "SEVENTEEN" },
  { name_en: "woozi",             name: "WOOZI",      color: "#805AD5", group: "SEVENTEEN" },
  { name_en: "dk",                name: "DK",         color: "#D69E2E", group: "SEVENTEEN" },
];

export function findOshi(name_en: string): Oshi | undefined {
  return OSHI_LIST.find((o) => o.name_en === name_en);
}

export function findGroup(id: string): OshiGroup | undefined {
  return OSHI_GROUPS.find((g) => g.id === id);
}

export function membersOfGroup(groupName: string): Oshi[] {
  return OSHI_LIST.filter((o) => o.group === groupName);
}

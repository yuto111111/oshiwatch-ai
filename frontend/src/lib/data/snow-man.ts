/**
 * Snow Man メンバー 9 名の静的マスタ (name_en を id として使う)。
 * バックエンドの Supabase members テーブルと同期して手動更新。
 * URL: /entities/[name_en] で参照される。
 */

export type SnowManMember = {
  name_en: string;
  name: string;
  color: string;
  birth_date?: string;
};

export const SNOW_MAN_MEMBERS: SnowManMember[] = [
  { name_en: "hikaru-iwamoto", name: "岩本照", color: "#C53030" },
  { name_en: "tatsuya-fukazawa", name: "深澤辰哉", color: "#DD6B20" },
  { name_en: "shota-watanabe", name: "渡辺翔太", color: "#D69E2E" },
  { name_en: "ryohei-abe", name: "阿部亮平", color: "#38A169" },
  { name_en: "koji-mukai", name: "向井康二", color: "#48BB78" },
  { name_en: "ren-meguro", name: "目黒蓮", color: "#38B2AC" },
  { name_en: "ryota-miyadate", name: "宮舘涼太", color: "#3182CE" },
  { name_en: "daisuke-sakuma", name: "佐久間大介", color: "#805AD5" },
  { name_en: "raul", name: "ラウール", color: "#D53F8C" },
];

export const SNOW_MAN_GROUP = {
  id: "snow-man",
  name: "Snow Man",
  color: "#0EA5E9",
};

export function findMember(name_en: string): SnowManMember | undefined {
  return SNOW_MAN_MEMBERS.find((m) => m.name_en === name_en);
}

/**
 * UI 文言メッセージカタログ（最小スコープ：ヘッダー / 共通ボタン）。
 *
 * このフェーズでは全画面の i18n 化はせず、言語切替の土台として
 * ヘッダーと共通の少数ラベルのみ翻訳する。残りのページは別 PR で対応する。
 */

import type { Locale } from "./locales";

export type MessageKey =
  | "nav.home"
  | "nav.search"
  | "nav.community"
  | "nav.dashboard"
  | "nav.my"
  | "auth.login"
  | "auth.signup"
  | "auth.logout"
  | "settings.title"
  | "language.label"
  | "language.short"
  | "app.title";

type Catalog = Record<MessageKey, string>;

const ja: Catalog = {
  "nav.home": "ホーム",
  "nav.search": "推しを探す",
  "nav.community": "コミュニティ",
  "nav.dashboard": "マイダッシュボード",
  "nav.my": "マイ",
  "auth.login": "ログイン",
  "auth.signup": "新規登録",
  "auth.logout": "ログアウト",
  "settings.title": "設定",
  "language.label": "言語",
  "language.short": "言語",
  "app.title": "推し活AI",
};

const en: Catalog = {
  "nav.home": "Home",
  "nav.search": "Search",
  "nav.community": "Community",
  "nav.dashboard": "Dashboard",
  "nav.my": "My",
  "auth.login": "Log in",
  "auth.signup": "Sign up",
  "auth.logout": "Log out",
  "settings.title": "Settings",
  "language.label": "Language",
  "language.short": "Lang",
  "app.title": "Oshi-Katsu-AI",
};

const ko: Catalog = {
  "nav.home": "홈",
  "nav.search": "검색",
  "nav.community": "커뮤니티",
  "nav.dashboard": "대시보드",
  "nav.my": "MY",
  "auth.login": "로그인",
  "auth.signup": "회원가입",
  "auth.logout": "로그아웃",
  "settings.title": "설정",
  "language.label": "언어",
  "language.short": "언어",
  "app.title": "Oshi-Katsu-AI",
};

const zhHans: Catalog = {
  "nav.home": "首页",
  "nav.search": "搜索",
  "nav.community": "社区",
  "nav.dashboard": "我的仪表盘",
  "nav.my": "我的",
  "auth.login": "登录",
  "auth.signup": "注册",
  "auth.logout": "退出登录",
  "settings.title": "设置",
  "language.label": "语言",
  "language.short": "语言",
  "app.title": "Oshi-Katsu-AI",
};

const zhHant: Catalog = {
  "nav.home": "首頁",
  "nav.search": "搜尋",
  "nav.community": "社群",
  "nav.dashboard": "我的儀表板",
  "nav.my": "我的",
  "auth.login": "登入",
  "auth.signup": "註冊",
  "auth.logout": "登出",
  "settings.title": "設定",
  "language.label": "語言",
  "language.short": "語言",
  "app.title": "Oshi-Katsu-AI",
};

export const MESSAGES: Record<Locale, Catalog> = {
  ja,
  en,
  ko,
  "zh-Hans": zhHans,
  "zh-Hant": zhHant,
};

export function translate(locale: Locale, key: MessageKey): string {
  return MESSAGES[locale]?.[key] ?? MESSAGES.ja[key] ?? key;
}

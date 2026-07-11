"use client";

// Phase 3: design/home-preview ベースの写真ファースト Hero。
// 旧版は frontend/src/app/_legacy/HeroSection-v1.tsx に退避。

import { useEffect, useState } from "react";
import type { Entity } from "@/types";
import { formatNumber } from "@/lib/utils/format";
import { safeUrl } from "@/lib/utils/safe-url";
import { Heart, Share2 } from "lucide-react";

type EntityImage = { url: string; source: string };

interface HeroSectionProps {
  entity: Entity;
  // 右側に並べる任意スロット (グループ詳細ではメンバー一覧)
  sideSlot?: React.ReactNode;
}

// 認証機能が無いため、フォロー状態はブラウザの localStorage に保存する
// （ログイン不要・この端末のこのブラウザだけで有効）
function followStorageKey(entityId: string): string {
  return `oshiwatch:follow:${entityId}`;
}

function classifyLink(label: string | undefined, url: string): { name: string; emoji: string } {
  const u = url.toLowerCase();
  if (/youtube\.com|youtu\.be/.test(u)) return { name: "YouTube", emoji: "▶" };
  if (/twitter\.com|x\.com/.test(u)) return { name: "X", emoji: "𝕏" };
  if (/instagram\.com/.test(u)) return { name: "Instagram", emoji: "📷" };
  if (/tiktok\.com/.test(u)) return { name: "TikTok", emoji: "♪" };
  if (/spotify\.com/.test(u)) return { name: "Spotify", emoji: "♫" };
  if (/apple\.com\/music|music\.apple\.com/.test(u)) return { name: "Apple Music", emoji: "🍎" };
  if (label && label.trim() && label.trim().toLowerCase() !== "link") {
    return { name: label.trim(), emoji: "🔗" };
  }
  return { name: "公式サイト", emoji: "🔗" };
}

const DEFAULT_ACCENT = "#0EA5E9";

export default function HeroSection({
  entity,
  sideSlot,
}: HeroSectionProps) {
  const accent = entity.member_color || DEFAULT_ACCENT;

  // ハッカソン用: 画像取得は行わない (entity.icon のみ使用)
  const [remoteImage] = useState<EntityImage | null>(null);

  // ログイン不要のフォロー機能。初回マウント時に localStorage から復元する
  const [isFollowing, setIsFollowing] = useState(false);
  useEffect(() => {
    setIsFollowing(localStorage.getItem(followStorageKey(entity.id)) === "1");
  }, [entity.id]);

  const handleFollowToggle = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    localStorage.setItem(followStorageKey(entity.id), next ? "1" : "0");
  };

  const iconLooksLikeUrl =
    entity.icon && (entity.icon.startsWith("http://") || entity.icon.startsWith("https://"));
  const displayImageUrl: string | null = remoteImage?.url || (iconLooksLikeUrl ? entity.icon : null);
  const showSpotifyAttribution = remoteImage?.source === "spotify";

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: entity.canonical_name,
          text: `${entity.canonical_name} の推し情報を見る`,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="bg-white">
      {/* Photo banner (写真ファースト) */}
      <div className="relative w-full" style={{ paddingBottom: "32%", minHeight: 240 }}>
        {displayImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayImageUrl}
            alt={entity.canonical_name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center top" }}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}aa)`,
            }}
          >
            <span className="text-white text-9xl font-bold opacity-50">
              {entity.canonical_name.charAt(0)}
            </span>
          </div>
        )}
        {/* グラデ (名前の可読性) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 50%)",
          }}
        />
        {/* Spotify 帰属バッジは撤去 (ハッカソン用) */}
        {/* タイプ バッジ */}
        {entity.entity_type && (
          <div
            className="absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-sm"
            style={{
              background:
                entity.entity_type === "group"
                  ? "rgba(107, 70, 193, 0.85)"
                  : entity.entity_type === "individual"
                    ? "rgba(236, 72, 153, 0.85)"
                    : "rgba(14, 165, 233, 0.85)",
              color: "#fff",
            }}
          >
            {entity.entity_type === "group"
              ? "グループ"
              : entity.entity_type === "individual"
                ? "ソロ"
                : "メンバー"}
          </div>
        )}
        {/* 名前 + メタ */}
        <div className="absolute bottom-4 left-6 right-6 text-white">
          <h1
            className="text-3xl sm:text-4xl font-bold leading-tight drop-shadow-lg"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
          >
            {entity.canonical_name}
          </h1>
          {entity.names_jsonb.en && (
            <p
              className="text-sm sm:text-base opacity-90 mt-0.5"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
            >
              {entity.names_jsonb.en}
            </p>
          )}
          <div
            className="flex items-center gap-3 mt-2 text-xs sm:text-sm"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
          >
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: `${accent}dd`, color: "#fff" }}
            >
              {entity.genre}
            </span>
            <span>{entity.country}</span>
            <span>{formatNumber(entity.follower_count)} フォロワー</span>
          </div>
        </div>
      </div>

      {/* Action bar (写真直下) */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 flex flex-wrap items-center gap-3 border-b border-gray-100">
        <button
          onClick={handleFollowToggle}
          className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold transition-all"
          style={
            isFollowing
              ? { background: "#fff", color: accent, border: `1.5px solid ${accent}` }
              : {
                  background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  color: "#fff",
                  boxShadow: `0 4px 12px ${accent}66`,
                }
          }
        >
          <Heart
            size={15}
            fill={isFollowing ? accent : "transparent"}
            stroke={isFollowing ? accent : "#fff"}
          />
          {isFollowing ? "フォロー中" : "フォローする"}
        </button>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
          aria-label="共有"
        >
          <Share2 size={15} />
          共有
        </button>

        {/* 公式リンク群 */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {entity.official_links.map((link) => {
            const meta = classifyLink(link.label, link.url);
            return (
              <a
                key={link.url}
                href={safeUrl(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${entity.canonical_name} の ${meta.name} を新しいタブで開く`}
                className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 hover:underline"
              >
                <span aria-hidden>{meta.emoji}</span>
                <span>{meta.name}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Side slot (グループのメンバーカラム) */}
      {sideSlot && (
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 border-b border-gray-100">
          {sideSlot}
        </div>
      )}
    </div>
  );
}

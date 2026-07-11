type Props = {
  level?: "confirmed" | "unconfirmed" | "rumor" | string | null;
};

const BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  confirmed: { label: "確定", className: "bg-blue-100 text-blue-700" },
  unconfirmed: { label: "未確認", className: "bg-yellow-100 text-yellow-700" },
  rumor: { label: "噂", className: "bg-red-100 text-red-700" },
};

export default function ConfidenceBadge({ level }: Props) {
  if (!level) return null;

  const config = BADGE_CONFIG[level];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

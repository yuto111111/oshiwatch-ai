"use client";

import Link from "next/link";
import type { ParentEntityRef } from "@/types";

export default function ParentGroupLink({ parent }: { parent: ParentEntityRef }) {
  const href = `/entities/${parent.slug || parent.id}`;
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
    >
      <span aria-hidden>←</span>
      所属グループ: {parent.canonical_name}
    </Link>
  );
}

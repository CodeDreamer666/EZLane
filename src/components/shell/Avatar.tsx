"use client";

import { useState } from "react";
import initials from "./initials";

/** Palette for the initials fallback — picked deterministically from the name
 * so a given person always gets the same colour. */
const COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#3b82f6",
];

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return COLORS[Math.abs(h) % COLORS.length]!;
}

export default function Avatar({
  name,
  image,
  size = 24,
  className = "",
}: {
  name: string;
  image?: string | null;
  size?: number;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const px = `${size}px`;

  if (image && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        width={size}
        height={size}
        onError={() => setBroken(true)}
        className={`flex-none rounded-full object-cover ${className}`}
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <div
      className={`font-heading grid flex-none place-items-center rounded-full text-white ${className}`}
      style={{
        width: px,
        height: px,
        fontSize: `${Math.round(size * 0.42)}px`,
        background: colorFor(name || "?"),
      }}
      aria-hidden="true"
    >
      {initials(name) || "?"}
    </div>
  );
}

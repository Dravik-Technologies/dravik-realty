"use client";

import { useSyncExternalStore } from "react";
import { timeAgo } from "@dravik/shared";

// useSyncExternalStore lets us return an empty string from the server
// snapshot (so static HTML contains no clock-dependent text) while the
// client snapshot provides the real relative time after hydration.
const emptySubscribe = () => () => {};

interface RelativeTimeProps {
  dateStr: string;
  className?: string;
}

export default function RelativeTime({ dateStr, className }: RelativeTimeProps) {
  const label = useSyncExternalStore(
    emptySubscribe,
    () => timeAgo(dateStr),
    () => ""
  );

  return <span className={className}>{label}</span>;
}

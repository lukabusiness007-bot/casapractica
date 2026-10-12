"use client";
import Link from "./localized-link";
import { track } from "@/lib/analytics-client";
import type { eventNames } from "@/lib/growth";
export function TrackedLink({
  href,
  event,
  context,
  className,
  children,
}: {
  href: string;
  event: (typeof eventNames)[number];
  context: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => track(event, context)}
    >
      {children}
    </Link>
  );
}

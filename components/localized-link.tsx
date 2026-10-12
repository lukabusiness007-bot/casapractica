"use client";
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "./locale-provider";
import { localePath } from "@/lib/i18n/routing";
export default function Link({
  href,
  ...props
}: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  return (
    <NextLink
      {...props}
      href={typeof href === "string" ? localePath(href, locale) : href}
    />
  );
}

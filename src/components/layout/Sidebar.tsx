"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { activitiesInGroup, PRACTICE_HUB, type Activity } from "@/lib/activities";

const INPUT_ITEMS = activitiesInGroup("input");
const PRACTICE_ITEMS = activitiesInGroup("practice");
const TRACK_ITEMS = activitiesInGroup("track");

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 px-3 text-xs font-semibold text-muted">{children}</div>;
}

function NavLink({ item, active }: { item: Activity; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={clsx(
        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition",
        active ? "bg-primary-soft font-semibold text-primary-dark" : "text-foreground hover:bg-muted-soft"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden w-64 shrink-0 flex-col gap-1 border-l border-border bg-card p-4 lg:flex">
      <Link href="/" className="mb-4 px-3 text-lg font-bold text-primary-dark">
        שחתה
      </Link>

      <SectionLabel>הוספת תוכן</SectionLabel>
      {INPUT_ITEMS.map((item) => (
        <NavLink key={item.href} item={item} active={pathname === item.href} />
      ))}

      <Link
        href={PRACTICE_HUB.href}
        className={clsx(
          "mt-3 px-3 text-xs font-semibold transition",
          pathname === PRACTICE_HUB.href
            ? "text-primary-dark"
            : "text-muted hover:text-foreground hover:underline"
        )}
      >
        {PRACTICE_HUB.label}
      </Link>
      {PRACTICE_ITEMS.map((item) => (
        <NavLink key={item.href} item={item} active={pathname === item.href} />
      ))}

      <SectionLabel>ניהול ומעקב</SectionLabel>
      {TRACK_ITEMS.map((item) => (
        <NavLink key={item.href} item={item} active={pathname === item.href} />
      ))}
    </nav>
  );
}

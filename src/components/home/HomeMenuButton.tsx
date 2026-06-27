import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";

type MenuTone = "primary" | "secondary" | "accent" | "success";

const toneClasses: Record<MenuTone, string> = {
  primary: "bg-primary-soft text-primary",
  secondary: "bg-secondary-soft text-secondary",
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
};

export function HomeMenuButton({
  href,
  icon: Icon,
  title,
  description,
  tone = "primary",
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: MenuTone;
}) {
  return (
    <Link href={href} className="flex">
      <Card className="flex h-full items-center gap-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:scale-[0.99]">
        <div className={`rounded-full p-3 ${toneClasses[tone]}`}>
          <Icon className="size-6" />
        </div>
        <div className="flex flex-1 flex-col">
          <span className="font-semibold">{title}</span>
          <span className="text-sm text-muted">{description}</span>
        </div>
        <ChevronLeft className="size-5 text-muted" />
      </Card>
    </Link>
  );
}

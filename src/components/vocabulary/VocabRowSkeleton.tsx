import { Card } from "@/components/ui/Card";

export function VocabRowSkeleton() {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="h-4 w-32 animate-pulse rounded bg-muted-soft" />
        <div className="h-3 w-20 animate-pulse rounded bg-muted-soft" />
      </div>
      <div className="flex shrink-0 gap-1">
        <div className="size-8 animate-pulse rounded-full bg-muted-soft" />
        <div className="size-8 animate-pulse rounded-full bg-muted-soft" />
      </div>
    </Card>
  );
}

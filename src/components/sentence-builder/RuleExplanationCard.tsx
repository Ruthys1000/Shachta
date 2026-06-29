import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function RuleExplanationCard({
  title,
  ruleExplanation,
}: {
  title: string;
  ruleExplanation: string;
}) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Lightbulb className="size-5 text-secondary" />
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <p className="text-sm leading-relaxed text-foreground">{ruleExplanation}</p>
    </Card>
  );
}

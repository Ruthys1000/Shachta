import { Card } from "@/components/ui/Card";
import { TranslateReveal } from "@/components/story/TranslateReveal";
import type { SentenceLessonExample } from "@/types";

export function ExampleBreakdownCard({ example }: { example: SentenceLessonExample }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 text-center">
        <p className="text-lg font-semibold" dir="ltr">
          {example.arabicTranslit}
        </p>
        <TranslateReveal hebrew={example.hebrewMeaning} />
      </div>

      <div className="flex flex-wrap justify-center gap-2" dir="ltr">
        {example.words.map((word, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center gap-1 rounded-xl border border-border bg-muted-soft px-3 py-2 text-center"
          >
            <span className="text-sm font-medium">{word.arabicTranslit}</span>
            <span className="text-xs text-muted">{word.hebrewMeaning}</span>
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium text-primary-dark">
              {word.role}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

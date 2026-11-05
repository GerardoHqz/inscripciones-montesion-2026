import { Check } from "lucide-react";

interface StepBarProps {
  current: number;
  steps: readonly { id: number; label: string; icon: React.ElementType }[];
}

export function StepBar({ current, steps }: StepBarProps) {
  return (
    <div className="flex items-center justify-between mb-6 px-1">
      {steps.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                done
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : active
                  ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              }`}>
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`hidden sm:block text-[10px] font-semibold tracking-wider ${active ? "text-primary" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 rounded transition-colors ${done ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

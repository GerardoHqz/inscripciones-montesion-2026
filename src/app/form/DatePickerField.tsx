import { useState, useEffect } from "react";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { cn } from "../components/ui/utils";

interface DatePickerFieldProps {
  label: string;
  name: string;
  value: string; // DD-MM-YYYY
  onChange: (k: any, v: string) => void;
  required?: boolean;
  error?: string;
}

export function DatePickerField({
  label, name, value, onChange, required = false, error
}: DatePickerFieldProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (value && /^\d{2}-\d{2}-\d{4}$/.test(value)) {
      const parsedDate = parse(value, "dd-MM-yyyy", new Date());
      if (isValid(parsedDate)) {
        setDate(parsedDate);
        return;
      }
    }
    setDate(undefined);
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const formatted = format(selectedDate, "dd-MM-yyyy");
      onChange(name, formatted);
      setIsOpen(false);
    } else {
      onChange(name, "");
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-full px-3 py-2.5 rounded-lg border text-left text-sm flex items-center justify-between transition-all bg-input-background text-foreground cursor-pointer focus:outline-none focus:ring-2",
              !value && "text-muted-foreground/50",
              error
                ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
                : "border-border focus:ring-primary/40 focus:border-primary"
            )}
          >
            <span>{value || "DD-MM-YYYY"}</span>
            <CalendarIcon className="w-4 h-4 text-muted-foreground/60" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border border-border rounded-xl shadow-lg" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            locale={es}
            captionLayout="dropdown-buttons"
            fromYear={1920}
            toYear={new Date().getFullYear()}
            className="rounded-xl border-0"
          />
        </PopoverContent>
      </Popover>
      {error && (
        <span className="text-destructive text-[11px] font-semibold flex items-center gap-1 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </span>
      )}
    </div>
  );
}

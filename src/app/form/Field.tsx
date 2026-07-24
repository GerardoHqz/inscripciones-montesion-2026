import { AlertCircle } from "lucide-react";

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string;
  autoComplete?: string;
  id?: string;
}

export function Field({
  label, name, value, onChange,
  type = "text", placeholder = "", required = false, className = "", error, autoComplete, id,
}: FieldProps) {
  const inputId = id || name;
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full px-3 py-2.5 rounded-lg border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-muted-foreground/50 ${
          error
            ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
            : "border-border focus:ring-primary/40 focus:border-primary"
        }`}
      />
      {error && (
        <span className="text-destructive text-[11px] font-semibold flex items-center gap-1 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </span>
      )}
    </div>
  );
}

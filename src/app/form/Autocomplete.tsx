import { useState, useRef, useEffect } from "react";
import { AlertCircle } from "lucide-react";

interface AutocompleteProps {
  label: string;
  name: string;
  value: string;
  onChange: (k: any, v: string) => void;
  options: string[];
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export function Autocomplete({
  label, name, value, onChange, options, required = false, error, placeholder = ""
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filteredOptions = query.trim() === ""
    ? options.slice(0, 10)
    : options.filter((opt) =>
        opt.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        const match = options.find(opt => opt.toLowerCase() === query.trim().toLowerCase());
        if (match) {
          onChange(name, match);
          setQuery(match);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query, options, name, onChange]);

  const handleSelect = (option: string) => {
    onChange(name, option);
    setQuery(option);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-1 relative w-full">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(name, e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
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
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-56 overflow-y-auto bg-white border border-border rounded-xl shadow-lg divide-y divide-[#f3f4f6] animate-in fade-in slide-in-from-top-2 duration-150">
          {filteredOptions.map((opt) => (
            <li
              key={opt}
              onClick={() => handleSelect(opt)}
              className="px-3.5 py-2.5 text-sm text-foreground hover:bg-muted/50 cursor-pointer transition-colors font-medium"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RiCheckLine, RiCloseLine, RiPencilLine } from "@remixicon/react";
import { cn } from "cn";

interface EditableFieldProps {
  label: string;
  value: string;
  displayValue?: React.ReactNode;
  onSave: (value: string) => boolean | void;
  type?: "text" | "select";
  options?: { label: string; value: string }[];
  placeholder?: string;
  isWarning?: boolean;
  error?: string;
  onErrorChange?: (error?: string) => void;
  validate?: (value: string) => string | undefined | null;
}

export function EditableField({
  label,
  value,
  displayValue,
  onSave,
  type = "text",
  options = [],
  placeholder,
  isWarning = false,
  error,
  onErrorChange,
  validate,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [localError, setLocalError] = useState<string | undefined>();

  const activeError = error !== undefined ? error : localError;

  const clearError = () => {
    setLocalError(undefined);
    onErrorChange?.(undefined);
  };

  const handleSave = () => {
    if (validate) {
      const valErr = validate(currentValue);
      if (valErr) {
        setLocalError(valErr);
        onErrorChange?.(valErr);
        return;
      }
    }
    const result = onSave(currentValue);
    if (result === false) return;
    clearError();
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    clearError();
    setIsEditing(false);
  };

  const inputId = `editable-field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const errorId = `${inputId}-error`;

  // ── Display mode ──────────────────────────────────────────
  if (!isEditing) {
    return (
      <div className="group flex items-start justify-between gap-2 min-h-[26px]">
        <span
          className={cn(
            "text-[14px] leading-snug transition-colors duration-100",
            isWarning
              ? "text-[var(--tl-amber)] font-medium"
              : "text-foreground"
          )}
        >
          {displayValue !== undefined ? displayValue : value || "Not specified"}
        </span>

        {/* Edit affordance — appears on group hover */}
        <button
          type="button"
          aria-label={`Edit ${label}`}
          onClick={() => {
            setCurrentValue(value);
            clearError();
            setIsEditing(true);
          }}
          className={cn(
            "shrink-0 mt-0.5",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-150",
            "p-1 rounded",
            "text-muted-foreground/50 hover:text-muted-foreground",
            "hover:bg-muted/60",
          )}
        >
          <RiPencilLine className="w-3 h-3" aria-hidden="true" />
        </button>
      </div>
    );
  }

  // ── Edit mode ─────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
      <div className="flex items-center gap-2">
        {type === "select" ? (
          <Select
            value={currentValue}
            onValueChange={(val) => setCurrentValue(val || "")}
          >
            <SelectTrigger className="h-8 text-sm w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <input
            id={inputId}
            type="text"
            value={currentValue}
            onChange={(e) => {
              setCurrentValue(e.target.value);
              if (activeError) clearError();
            }}
            placeholder={placeholder}
            className={cn(
              "flex-1 h-8 text-sm px-2.5",
              "bg-background text-foreground",
              "border border-border rounded-md",
              "outline-none transition-all duration-150",
              "focus:border-[var(--tl-accent-border)] focus:ring-1 focus:ring-[var(--tl-accent-muted)]",
              activeError &&
                "border-destructive focus:border-destructive focus:ring-destructive/20"
            )}
            aria-invalid={Boolean(activeError)}
            aria-describedby={activeError ? errorId : undefined}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
        )}

        {/* Save / Cancel */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            aria-label="Save"
            onClick={handleSave}
            className="flex items-center justify-center w-7 h-7 rounded text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors duration-100"
          >
            <RiCheckLine className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Cancel"
            onClick={handleCancel}
            className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50 transition-colors duration-100"
          >
            <RiCloseLine className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Validation error */}
      {activeError && (
        <p
          id={errorId}
          role="alert"
          className="text-[11px] text-destructive font-medium"
        >
          {activeError}
        </p>
      )}
    </div>
  );
}

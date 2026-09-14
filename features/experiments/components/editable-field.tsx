import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RiCheckLine, RiCloseLine } from "@remixicon/react";
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
  validate
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
    if (result === false) {
      return;
    }
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

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-1 group relative">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          {label}
          <button 
            type="button"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800"
            onClick={() => {
              setCurrentValue(value);
              clearError();
              setIsEditing(true);
            }}
          >
            Edit
          </button>
        </span>
        <div className="flex items-center min-h-[24px]">
          <span className={`text-base ${isWarning ? "text-amber-600 dark:text-amber-500 font-medium" : "text-zinc-900 dark:text-zinc-100"}`}>
            {displayValue !== undefined ? displayValue : (value || "Not specified")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {type === "select" ? (
          <Select value={currentValue} onValueChange={(val) => setCurrentValue(val || "")}>
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
          <Input 
            id={inputId}
            value={currentValue} 
            onChange={(e) => {
              setCurrentValue(e.target.value);
              if (activeError) {
                clearError();
              }
            }} 
            placeholder={placeholder}
            className={cn(
              "h-8 text-sm",
              activeError && "border-red-500 focus-visible:ring-red-500 dark:border-red-500"
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
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={handleSave}>
            <RiCheckLine className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600" onClick={handleCancel}>
            <RiCloseLine className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {activeError && (
        <span
          id={errorId}
          role="alert"
          className="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5"
        >
          {activeError}
        </span>
      )}
    </div>
  );
}

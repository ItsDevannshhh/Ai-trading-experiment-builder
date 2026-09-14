import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RiCheckLine, RiCloseLine } from "@remixicon/react";

interface EditableFieldProps {
  label: string;
  value: string;
  displayValue?: React.ReactNode;
  onSave: (value: string) => void;
  type?: "text" | "select";
  options?: { label: string; value: string }[];
  placeholder?: string;
  isWarning?: boolean;
}

export function EditableField({ 
  label, 
  value, 
  displayValue, 
  onSave, 
  type = "text", 
  options = [],
  placeholder,
  isWarning = false
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

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
            value={currentValue} 
            onChange={(e) => setCurrentValue(e.target.value)} 
            placeholder={placeholder}
            className="h-8 text-sm"
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
    </div>
  );
}

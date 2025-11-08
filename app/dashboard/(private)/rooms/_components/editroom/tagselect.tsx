
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty, CommandGroup } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type Option = { value: string; label: string };

export function TagMultiSelect({ options, value, onChange, placeholder }: { options: Option[]; value: Option[]; onChange: (v: Option[]) => void; placeholder?: string }) {
  const [open, setOpen] = React.useState(false);
  const selected = new Set(value.map((v) => v.value));

  function toggle(option: Option) {
    if (selected.has(option.value)) {
      onChange(value.filter((v) => v.value !== option.value));
    } else {
      onChange([...value, option]);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value.length ? `${value.length} selected` : (placeholder || "Select...")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search tag..." />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSel = selected.has(opt.value);
                return (
                  <CommandItem key={opt.value} onSelect={() => toggle(opt)}>
                    <Check className={cn("mr-2 h-4 w-4", isSel ? "opacity-100" : "opacity-0")} />
                    {opt.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

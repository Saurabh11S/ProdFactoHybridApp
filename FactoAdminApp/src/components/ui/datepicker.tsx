"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = {
  body?: string;
  disabled?: boolean;  // Added the disabled prop
};

export function DatePicker({ body = "Select Date", disabled = false }: DatePickerProps) {
  const [date, setDate] = React.useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full md:w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            disabled && "cursor-not-allowed opacity-50"  // Apply styles for disabled state
          )}
          disabled={disabled}  // Disable the button when the disabled prop is true
        >
          <CalendarIcon className="mr-2 shrink-0" />
          {date ? format(date, "PPP") : <span>{body}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full md:w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          disabled={disabled}  // Disable the calendar when the disabled prop is true
        />
      </PopoverContent>
    </Popover>
  );
}

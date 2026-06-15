"use client";

import React, { useMemo, useState } from "react";
import { 
  endOfMonth, 
  endOfWeek, 
  getLocalTimeZone, 
  startOfMonth, 
  startOfWeek, 
  today, 
  toCalendarDateTime,
  DateValue 
} from "@internationalized/date";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "react-aria";
import {
  Button as AriaButton,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DateInput,
  DateSegment,
  Heading,
  RangeCalendar as AriaRangeCalendar,
  DateField,
} from "react-aria-components";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function CustomDateRangePicker() {
  const { locale } = useLocale();
  const tz = getLocalTimeZone();
  const currentToday = today(tz);
  const now = useMemo(() => toCalendarDateTime(currentToday), [currentToday]);
  
  const [value, setValue] = useState<{ start: DateValue; end: DateValue } | null>({
    start: currentToday.subtract({ days: 7 }),
    end: currentToday,
  });

  const [tempValue, setTempValue] = useState<{ start: DateValue; end: DateValue } | null>(value);
  const [isOpen, setIsOpen] = useState(false);

  const presets = useMemo(() => ({
    today: { label: "Today", value: { start: currentToday, end: currentToday } },
    yesterday: { label: "Yesterday", value: { start: currentToday.subtract({ days: 1 }), end: currentToday.subtract({ days: 1 }) } },
    thisWeek: { label: "This week", value: { start: startOfWeek(currentToday, locale), end: endOfWeek(currentToday, locale) } },
    lastWeek: { label: "Last week", value: { start: startOfWeek(currentToday, locale).subtract({ weeks: 1 }), end: endOfWeek(currentToday, locale).subtract({ weeks: 1 }) } },
    thisMonth: { label: "This month", value: { start: startOfMonth(currentToday), end: endOfMonth(currentToday) } },
    lastMonth: { label: "Last month", value: { start: startOfMonth(currentToday).subtract({ months: 1 }), end: endOfMonth(currentToday).subtract({ months: 1 }) } },
    thisYear: { label: "This year", value: { start: startOfMonth(currentToday.set({ month: 1 })), end: endOfMonth(currentToday.set({ month: 12 })) } },
    lastYear: { label: "Last year", value: { start: startOfMonth(currentToday.set({ month: 1 }).subtract({ years: 1 })), end: endOfMonth(currentToday.set({ month: 12 }).subtract({ years: 1 })) } },
    allTime: { label: "All time", value: { start: currentToday.set({ year: 2000, month: 1, day: 1 }), end: currentToday } },
  }), [locale, currentToday]);

  const handleApply = () => {
    setValue(tempValue);
  };

  return (
    <div className="flex flex-col sm:flex-row bg-transparent overflow-hidden w-full h-full">
      
      {/* Presets Sidebar */}
      <div className="hidden sm:flex flex-col gap-1 border-r border-neutral-100 p-3 bg-neutral-50/50 w-36 shrink-0 overflow-y-auto">
        {Object.values(presets).map((preset) => (
          <button
            key={preset.label}
            onClick={() => setTempValue(preset.value)}
            className="text-left px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-white hover:text-neutral-900 rounded-lg transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Right Content Area */}
      <div className="flex flex-col flex-1 bg-transparent">
        <div className="p-4 flex-1 flex items-center justify-center">
          <AriaRangeCalendar value={tempValue} onChange={setTempValue} className="flex flex-col gap-4 outline-none">
            <header className="flex items-center justify-between px-1">
              <AriaButton slot="previous" className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors">
                <ChevronLeft size={16} />
              </AriaButton>
              <Heading className="text-sm font-semibold text-neutral-800 tracking-tight" level={2} />
              <AriaButton slot="next" className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors">
                <ChevronRight size={16} />
              </AriaButton>
            </header>
            <CalendarGrid className="border-collapse border-spacing-0">
              <CalendarGridHeader>
                {(day) => (
                  <CalendarHeaderCell className="text-[11px] font-medium text-neutral-400 pb-2 w-10 text-center">
                    {day}
                  </CalendarHeaderCell>
                )}
              </CalendarGridHeader>
              <CalendarGridBody>
                {(date) => (
                  <CalendarCell 
                    date={date} 
                    className={({ isSelected, isSelectionStart, isSelectionEnd, isHovered, isOutsideVisibleRange }) => cx(
                      "w-10 h-10 text-sm flex items-center justify-center cursor-pointer transition-colors outline-none",
                      isOutsideVisibleRange ? "text-transparent pointer-events-none" : "text-neutral-700 font-medium",
                      isSelected && !isSelectionStart && !isSelectionEnd && "bg-violet-50 text-violet-800",
                      (isSelectionStart || isSelectionEnd) && "bg-violet-600 text-white font-bold rounded-full shadow-sm hover:bg-violet-700 z-10 relative",
                      isHovered && !isSelected && "bg-neutral-100 rounded-full",
                      isSelectionStart && !isSelectionEnd && "bg-violet-50 rounded-l-full relative before:absolute before:inset-0 before:bg-violet-600 before:rounded-full before:z-10",
                      isSelectionEnd && !isSelectionStart && "bg-violet-50 rounded-r-full relative before:absolute before:inset-0 before:bg-violet-600 before:rounded-full before:z-10",
                    )}
                  >
                    {({ formattedDate, isSelectionStart, isSelectionEnd }) => (
                      <span className={cx((isSelectionStart || isSelectionEnd) && "relative z-20 text-white")}>
                        {formattedDate}
                      </span>
                    )}
                  </CalendarCell>
                )}
              </CalendarGridBody>
            </CalendarGrid>
          </AriaRangeCalendar>
        </div>

        {/* Bottom Footer Area */}
        <div className="border-t border-neutral-100 p-3 flex flex-wrap items-center justify-between gap-3 bg-white mt-auto">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <DateField value={tempValue?.start} onChange={(val) => setTempValue(prev => ({ start: val, end: prev?.end || val }))} aria-label="Start date" className="border border-neutral-200 rounded-lg px-3 py-2 flex items-center bg-white shadow-sm text-sm font-medium text-neutral-700">
              <DateInput className="flex">
                {(segment) => <DateSegment segment={segment} className="focus:bg-violet-100 focus:text-violet-900 focus:outline-none rounded px-0.5" />}
              </DateInput>
            </DateField>
            <span className="text-neutral-300 font-medium">–</span>
            <DateField value={tempValue?.end} onChange={(val) => setTempValue(prev => ({ start: prev?.start || val, end: val }))} aria-label="End date" className="border border-neutral-200 rounded-lg px-3 py-2 flex items-center bg-white shadow-sm text-sm font-medium text-neutral-700">
              <DateInput className="flex">
                {(segment) => <DateSegment segment={segment} className="focus:bg-violet-100 focus:text-violet-900 focus:outline-none rounded px-0.5" />}
              </DateInput>
            </DateField>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setTempValue(value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm outline-none"
            >
              Reset
            </button>
            <button 
              onClick={handleApply}
              className="px-4 py-2 bg-[#8b5cf6] text-white rounded-lg text-sm font-semibold hover:bg-[#7c3aed] transition-colors shadow-sm outline-none"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { useDateFilter, DatePreset } from "@/contexts/date-filter-context"
import { cn } from "@/lib/utils"

const presetOptions: { label: string; value: DatePreset }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "thisWeek" },
  { label: "Last Week", value: "lastWeek" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Quarter", value: "thisQuarter" },
  { label: "Last Quarter", value: "lastQuarter" },
  { label: "This Year", value: "thisYear" },
  { label: "Last Year", value: "lastYear" },
]

export function DateRangePicker() {
  const { startDate, endDate, preset, setDateRange, setPreset, clearDateRange, getFormattedRange } = useDateFilter()
  const [isOpen, setIsOpen] = useState(false)
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(startDate)
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDate)

  const handlePresetClick = (presetValue: DatePreset) => {
    setPreset(presetValue)
    setIsOpen(false)
  }

  const handleApplyCustom = () => {
    if (tempStartDate && tempEndDate) {
      setDateRange(tempStartDate, tempEndDate)
      setIsOpen(false)
    }
  }

  const handleClear = () => {
    clearDateRange()
    setTempStartDate(undefined)
    setTempEndDate(undefined)
    setIsOpen(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setTempStartDate(startDate)
      setTempEndDate(endDate)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !startDate && !endDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getFormattedRange()}
          {(startDate || endDate) && (
            <X
              className="ml-2 h-4 w-4 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Presets */}
          <div className="border-r p-2 space-y-1">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
              Quick Select
            </div>
            {presetOptions.map((option) => (
              <Button
                key={option.value}
                variant={preset === option.value ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => handlePresetClick(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Custom Date Range */}
          <div className="p-3 space-y-3">
            <div className="text-xs font-semibold text-muted-foreground">
              Custom Range
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Start Date</div>
                <Calendar
                  mode="single"
                  selected={tempStartDate}
                  onSelect={setTempStartDate}
                  initialFocus
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">End Date</div>
                <Calendar
                  mode="single"
                  selected={tempEndDate}
                  onSelect={setTempEndDate}
                  disabled={(date) => {
                    if (!tempStartDate) return false
                    return date < tempStartDate
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleApplyCustom}
                disabled={!tempStartDate || !tempEndDate}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

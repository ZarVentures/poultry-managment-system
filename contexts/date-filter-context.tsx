"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type DatePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'lastQuarter' | 'thisYear' | 'lastYear' | 'custom'

interface DateFilterContextType {
  startDate: Date | undefined
  endDate: Date | undefined
  preset: DatePreset
  setDateRange: (startDate: Date | undefined, endDate: Date | undefined) => void
  setPreset: (preset: DatePreset) => void
  clearDateRange: () => void
  getFormattedRange: () => string
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined)

// Helper functions for date presets
function getDatePresetRange(preset: DatePreset): { start: Date; end: Date } | null {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (preset) {
    case 'today':
      return { start: today, end: today }
    
    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return { start: yesterday, end: yesterday }
    }
    
    case 'thisWeek': {
      const start = new Date(today)
      start.setDate(start.getDate() - start.getDay()) // Start of week (Sunday)
      return { start, end: today }
    }
    
    case 'lastWeek': {
      const start = new Date(today)
      start.setDate(start.getDate() - start.getDay() - 7)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      return { start, end }
    }
    
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start, end: today }
    }
    
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start, end }
    }
    
    case 'thisQuarter': {
      const quarter = Math.floor(now.getMonth() / 3)
      const start = new Date(now.getFullYear(), quarter * 3, 1)
      return { start, end: today }
    }
    
    case 'lastQuarter': {
      const quarter = Math.floor(now.getMonth() / 3)
      const start = new Date(now.getFullYear(), (quarter - 1) * 3, 1)
      const end = new Date(now.getFullYear(), quarter * 3, 0)
      return { start, end }
    }
    
    case 'thisYear': {
      const start = new Date(now.getFullYear(), 0, 1)
      return { start, end: today }
    }
    
    case 'lastYear': {
      const start = new Date(now.getFullYear() - 1, 0, 1)
      const end = new Date(now.getFullYear() - 1, 11, 31)
      return { start, end }
    }
    
    default:
      return null
  }
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined)

export function DateFilterProvider({ children }: { children: ReactNode }) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [preset, setPresetState] = useState<DatePreset>('custom')

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStartDate = localStorage.getItem("dateFilterStartDate")
      const savedEndDate = localStorage.getItem("dateFilterEndDate")
      const savedPreset = localStorage.getItem("dateFilterPreset") as DatePreset
      
      if (savedPreset && savedPreset !== 'custom') {
        setPresetState(savedPreset)
        const range = getDatePresetRange(savedPreset)
        if (range) {
          setStartDate(range.start)
          setEndDate(range.end)
        }
      } else if (savedStartDate && savedEndDate) {
        setStartDate(new Date(savedStartDate))
        setEndDate(new Date(savedEndDate))
        setPresetState('custom')
      }
    }
  }, [])

  // Save to localStorage when dates change (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (startDate) {
        localStorage.setItem("dateFilterStartDate", startDate.toISOString())
      } else {
        localStorage.removeItem("dateFilterStartDate")
      }
    }
  }, [startDate])

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (endDate) {
        localStorage.setItem("dateFilterEndDate", endDate.toISOString())
      } else {
        localStorage.removeItem("dateFilterEndDate")
      }
    }
  }, [endDate])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dateFilterPreset", preset)
    }
  }, [preset])

  const setDateRange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start)
    setEndDate(end)
    setPresetState('custom')
  }

  const setPreset = (newPreset: DatePreset) => {
    setPresetState(newPreset)
    if (newPreset === 'custom') {
      return
    }
    const range = getDatePresetRange(newPreset)
    if (range) {
      setStartDate(range.start)
      setEndDate(range.end)
    }
  }

  const clearDateRange = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setPresetState('custom')
    localStorage.removeItem("dateFilterStartDate")
    localStorage.removeItem("dateFilterEndDate")
    localStorage.removeItem("dateFilterPreset")
  }

  const getFormattedRange = (): string => {
    if (!startDate || !endDate) return 'All Time'
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    
    if (startDate.toDateString() === endDate.toDateString()) {
      return formatDate(startDate)
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  return (
    <DateFilterContext.Provider value={{ 
      startDate, 
      endDate, 
      preset,
      setDateRange, 
      setPreset,
      clearDateRange,
      getFormattedRange
    }}>
      {children}
    </DateFilterContext.Provider>
  )
}

export function useDateFilter() {
  const context = useContext(DateFilterContext)
  if (context === undefined) {
    throw new Error("useDateFilter must be used within a DateFilterProvider")
  }
  return context
}


"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface DateFilterContextType {
  startDate: Date | undefined
  endDate: Date | undefined
  setDateRange: (startDate: Date | undefined, endDate: Date | undefined) => void
  clearDateRange: () => void
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined)

export function DateFilterProvider({ children }: { children: ReactNode }) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStartDate = localStorage.getItem("dateFilterStartDate")
      const savedEndDate = localStorage.getItem("dateFilterEndDate")
      if (savedStartDate) {
        setStartDate(new Date(savedStartDate))
      }
      if (savedEndDate) {
        setEndDate(new Date(savedEndDate))
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

  const setDateRange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start)
    setEndDate(end)
  }

  const clearDateRange = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    localStorage.removeItem("dateFilterStartDate")
    localStorage.removeItem("dateFilterEndDate")
  }

  return (
    <DateFilterContext.Provider value={{ startDate, endDate, setDateRange, clearDateRange }}>
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


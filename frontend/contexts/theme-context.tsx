"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark") // Defaulting to dark as in Homepage

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Ensure window is defined (runs only on client)
      if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        setTheme(prefersDark ? "dark" : "light")
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("theme", theme)
    // Ensure document is defined (runs only on client)
    if (typeof document !== 'undefined') {
      if (theme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

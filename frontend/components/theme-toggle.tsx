"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      className="w-9 h-9 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      {(resolvedTheme || theme) === "light" ? (
        <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      ) : (
        <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      )}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { ModeToggle } from "@/components/mode-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserCircle, Menu, Bell, LogOut } from "lucide-react"

export default function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <header className="px-10 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="m19 9-7-7-7 7"></path>
              <path d="M5 15v4h14v-4"></path>
              <path d="M9 21v-7.5"></path>
              <path d="M15 21v-7.5"></path>
            </svg>
            <span className="hidden font-bold sm:inline-block">Sistema de Vacunación</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {isMounted && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Dashboard
                    </Link>
                    
                    {user.role === "Tutor" && (
                      <>
                        <Link
                          href="/children"
                          className={`text-sm font-medium transition-colors hover:text-primary ${
                            pathname === "/children" ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          Niños
                        </Link>
                        <Link
                          href="/history"
                          className={`text-sm font-medium transition-colors hover:text-primary ${
                            pathname === "/history" ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          Historial
                        </Link>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/about"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === "/about" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Acerca de
                    </Link>
                    <Link
                      href="/contact"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === "/contact" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Contacto
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isMounted ? (
            <>
              <ModeToggle />
              {user ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <div className="flex items-center justify-between p-2">
                        <p className="text-sm font-medium">Notificaciones</p>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Marcar todas como leídas
                        </Button>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="max-h-80 overflow-y-auto">
                        <div className="p-4 text-center text-sm text-muted-foreground">No hay notificaciones nuevas</div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <UserCircle className="h-6 w-6" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.role}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Perfil</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">Configuración</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-red-500">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost">
                    <Link href="/login">Iniciar Sesión</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Registrarse</Link>
                  </Button>
                </div>
              )}
            </>
          ) : null}
          {isMounted && (
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle Menu">
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/ui/use-toast"

import { Shield, Eye, EyeOff, ArrowLeft, User, Mail, Phone, Calendar, MapPin, Loader2, Home, KeyRound } from "lucide-react" // Added Home for Direccion, KeyRound for Username (or User again)

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false) // Used for login password visibility
  const [showRegisterPassword, setShowRegisterPassword] = useState(false) // For register form password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false) // For register form confirm password
  
  const [isRegisterLoading, setIsRegisterLoading] = useState(false) 
  const { theme } = useTheme()
  const { toast } = useToast()

  // Login specific states and hooks
  const { login, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loginIdentifier, setLoginIdentifier] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [isAdmin, setIsAdmin] = useState(false) // For potential admin-specific logic

  // Register specific states
  const [registerFormData, setRegisterFormData] = useState({
    Nombres: "",
    Apellidos: "",
    NumeroIdentificacion: "", // Mapped from 'Cédula' in UI
    Telefono: "",
    Direccion: "",
    Email: "",
    Username: "",
    Password: "",
  })
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [registerError, setRegisterError] = useState("")

  useEffect(() => {
    // If the user is already authenticated, redirect them based on their role.
    if (user && !authLoading) {
      if (user.id_Rol === 1) { // Administrador
        setIsAdmin(true); // Set admin state
        // Redirect to the admin role selection page which is at /login
        router.push('/login'); 
      } else if (user.id_Rol === 2) { // 'Médico'
        router.push('/management/medical/select-center');
      } else if (user.id_Rol === 6) { // 'Tutor'
        router.push('/dashboard'); 
      } else {
        router.push('/dashboard'); // Default dashboard for other authenticated users
      }
    }
  }, [user, authLoading, router, setIsAdmin]); // Added setIsAdmin to dependency array

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegisterFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    // Auth context's 'authLoading' will be used for button's disabled state

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ LoginIdentifier: loginIdentifier, Password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }
      login(data.token, data.user); // AuthContext handles user state and redirection
    } catch (err: any) {
      setLoginError(err.message || "An unexpected error occurred.");
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    if (registerFormData.Password !== registerConfirmPassword) {
      setRegisterError("Las contraseñas no coinciden.");
      return;
    }
    setIsRegisterLoading(true);

    try {
      // Add TipoIdentificacion if your backend expects it, defaulting to Cédula
      const payload = {
        ...registerFormData,
        TipoIdentificacion: "Cédula", 
      };

      const response = await fetch("http://localhost:3001/api/tutors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar usuario");
      }

      toast({
        title: "Registro exitoso",
        description: "Su cuenta ha sido creada correctamente. Por favor, inicie sesión.",
      });
      // Optionally, switch to login tab or clear form
      // For now, just clear form and show success, user can then click on login tab
      setRegisterFormData({
        Nombres: "", Apellidos: "", NumeroIdentificacion: "", Telefono: "",
        Direccion: "", Email: "", Username: "", Password: "",
      });
      setRegisterConfirmPassword("");
      // Consider switching tab: document.querySelector('[data-radix-collection-item][value="login"]')?.click();
    } catch (error: any) {
      setRegisterError(error.message || "Ocurrió un error inesperado durante el registro.");
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: error.message || "Error al registrar usuario",
      });
    } finally {
      setIsRegisterLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */} 
      <header className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src={theme === "light" ? "/images/logo-vacunas-rd.jpeg" : "/images/logo-vacunas-rd-dark.jpeg"}
                alt="VACUNAS RD - Logo oficial"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">VACUNAS RD</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Ministerio de Salud Pública</p>
              </div>
            </Link>

            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al inicio</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */} 
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center">
              <Image
                src={theme === "light" ? "/images/logo-vacunas-rd.jpeg" : "/images/logo-vacunas-rd-dark.jpeg"}
                alt="VACUNAS RD - Logo oficial"
                width={80}
                height={80}
                className="rounded-lg mb-4"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Accede a tu cuenta</h2>
            <p className="text-gray-600 dark:text-gray-400">Gestiona tu información de vacunación de forma segura</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300"
              >
                Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300"
              >
                Registrarse
              </TabsTrigger>
            </TabsList>

            {/* Login Form */} 
            <TabsContent value="login">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Iniciar Sesión</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Ingresa tus credenciales para acceder al sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-cedula" className="text-gray-700 dark:text-gray-300">
                        Cédula de Identidad
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-cedula"
                          type="text"
                          placeholder="Cédula o Correo Electrónico"
                          className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-green-500"
                          required
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-700 dark:text-gray-300">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Ingresa tu contraseña"
                          className="pr-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-green-500"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-green-600"
                        />
                        <Label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300">
                          Recordarme
                        </Label>
                      </div>
                      <Link
                        href="/forgot-password" // This route would need to be created if it doesn't exist
                        className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>

                                        {loginError && (
                      <p className="text-sm text-red-600 dark:text-red-400 text-center">{loginError}</p>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={authLoading}
                    >
                      {authLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando sesión...</>
                      ) : (
                        "Iniciar Sesión"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register Form */} 
            <TabsContent value="register">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Crear Cuenta</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Regístrate para acceder a todos los servicios de vacunación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="Nombres" className="text-gray-700 dark:text-gray-300">Nombres</Label>
                        <Input id="Nombres" name="Nombres" placeholder="Tus nombres" value={registerFormData.Nombres} onChange={handleRegisterChange} required className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="Apellidos" className="text-gray-700 dark:text-gray-300">Apellidos</Label>
                        <Input id="Apellidos" name="Apellidos" placeholder="Tus apellidos" value={registerFormData.Apellidos} onChange={handleRegisterChange} required className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="NumeroIdentificacion" className="text-gray-700 dark:text-gray-300">Cédula de Identidad</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="NumeroIdentificacion" name="NumeroIdentificacion" placeholder="000-0000000-0" value={registerFormData.NumeroIdentificacion} onChange={handleRegisterChange} required className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="Email" className="text-gray-700 dark:text-gray-300">Correo Electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="Email" name="Email" type="email" placeholder="tu@email.com" value={registerFormData.Email} onChange={handleRegisterChange} required className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="Telefono" className="text-gray-700 dark:text-gray-300">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="Telefono" name="Telefono" type="tel" placeholder="(809) 000-0000" value={registerFormData.Telefono} onChange={handleRegisterChange} required className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="Direccion" className="text-gray-700 dark:text-gray-300">Dirección</Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="Direccion" name="Direccion" placeholder="Calle, Número, Sector" value={registerFormData.Direccion} onChange={handleRegisterChange} required className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="Username" className="text-gray-700 dark:text-gray-300">Nombre de Usuario</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="Username" name="Username" placeholder="Elige un nombre de usuario" value={registerFormData.Username} onChange={handleRegisterChange} required className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-gray-700 dark:text-gray-300">Contraseña</Label>
                      <div className="relative">
                        <Input id="register-password" name="Password" type={showRegisterPassword ? "text" : "password"} placeholder="Mínimo 8 caracteres" value={registerFormData.Password} onChange={handleRegisterChange} required className="pr-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                        <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-300">Confirmar Contraseña</Label>
                      <div className="relative">
                        <Input id="confirm-password" name="confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder="Repite tu contraseña" value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} required className="pr-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {registerError && (
                      <p className="text-sm text-red-600 dark:text-red-400 text-center">{registerError}</p>
                    )}

                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-green-600 mt-1" required />
                      <Label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
                        Acepto los{" "}
                        <Link href="/terms" className="text-green-600 dark:text-green-400 hover:underline">Términos y Condiciones</Link>
                        {" y la "}
                        <Link href="/privacy" className="text-green-600 dark:text-green-400 hover:underline">Política de Privacidad</Link>.
                      </Label>
                    </div>

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isRegisterLoading}>
                      {isRegisterLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando cuenta...</> : "Crear Cuenta"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿Necesitas ayuda?{" "}
            <Link href="/ayuda" className="text-green-600 dark:text-green-400 hover:underline">
              Visita nuestra sección de ayuda
            </Link>
          </p>
        </div>
      </main>

      {/* Footer (optional, can be simpler or removed for auth pages) */}
      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        © {new Date().getFullYear()} VACUNAS RD. Todos los derechos reservados.
      </footer>
    </div>
  )
}

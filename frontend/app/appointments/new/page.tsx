"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import useApi from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Calendar } from "lucide-react"

interface VaccinationCenter {
  id_CentroVacunacion: number
  Nombre: string
}

interface Vaccine {
  id_Vacuna: number
  Nombre: string
}

interface Child {
  id_Nino: number
  Nombres: string
  Apellidos: string
}

export default function NewAppointmentPage() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const [centers, setCenters] = useState<VaccinationCenter[]>([])
  const [vaccines, setVaccines] = useState<Vaccine[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [formData, setFormData] = useState({
    id_Nino: "",
    id_CentroVacunacion: "",
    id_Vacuna: "",
    FechaCita: "",
    HoraCita: "",
  })
  const [appointmentFor, setAppointmentFor] = useState<"self" | "child">("self")

  const { request: callApi, loading: dataLoading } = useApi()
  const { request: createAppointment, loading: formLoading } = useApi()

  const fetchInitialData = useCallback(async () => {
    if (!token) return
    try {
      const [centersData, vaccinesData] = await Promise.all([
        callApi("/api/vaccination-centers", { method: "GET" }),
        callApi("/api/vaccines", { method: "GET" }),
      ])
      setCenters(centersData || [])
      setVaccines(vaccinesData || [])

      if (user?.id_Rol === 5) {
        // Ajuste de endpoint de niños para tutor actual
        const childrenData = await callApi(`/api/ninos/tutor/${user.id}/detailed`, { method: "GET" })
        setChildren(childrenData || [])
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos para agendar la cita",
      })
    }
  }, [callApi, token, user, toast])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    } else if (user) {
      fetchInitialData().then(() => {
        const childId = searchParams.get('childId');
        const vaccineId = searchParams.get('vaccineId');
        if (childId) {
          setAppointmentFor('child');
          handleChange('id_Nino', childId);
        }
        if (vaccineId) {
          handleChange('id_Vacuna', vaccineId);
        }
      });
    }
  }, [authLoading, user, router, fetchInitialData])

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (appointmentFor === "self" && user?.id_Rol !== 5) {
      toast({
        variant: "destructive",
        title: "Funcionalidad no disponible",
        description: "La programación de citas para adultos está en desarrollo",
      })
      return
    }

    const appointmentData = {
      Fecha: formData.FechaCita,
      Hora: formData.HoraCita,
      id_Nino: appointmentFor === "child" && formData.id_Nino ? Number(formData.id_Nino) : null,
      id_CentroVacunacion: Number(formData.id_CentroVacunacion),
      id_Vacuna: Number(formData.id_Vacuna),
    };

    try {
      await createAppointment("/api/appointments", { method: "POST", body: appointmentData })
      toast({ title: "Cita agendada", description: "Su cita ha sido agendada correctamente" })
      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al agendar cita",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
      })
    }
  }

  if (authLoading || dataLoading) {
    return (
      <div className="container flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl font-bold">Cargando...</div>
          <p className="text-muted-foreground">Por favor espere</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Card className="mt-3 mx-auto block">
        <CardHeader>
          <CardTitle>Agendar Nueva Cita</CardTitle>
          <CardDescription>Complete el formulario para agendar una nueva cita de vacunación</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {user?.id_Rol === 5 && (
              <div className="space-y-2">
                <Label>¿Para quién es la cita?</Label>
                <Select onValueChange={(value) => setAppointmentFor(value as "self" | "child")} value={appointmentFor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Para mí</SelectItem>
                    <SelectItem value="child">Para un niño</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {appointmentFor === "child" && user?.id_Rol === 5 && (
              <div className="space-y-2">
                <Label htmlFor="id_Nino">Niño</Label>
                <Select onValueChange={(value) => handleChange("id_Nino", value)} value={formData.id_Nino} required={appointmentFor === "child"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un niño" />
                  </SelectTrigger>
                  <SelectContent>
                    {children && children.length > 0 ? (
                      children.map((child) => (
                        <SelectItem key={child.id_Nino} value={child.id_Nino.toString()}>
                          {child.Nombres} {child.Apellidos}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-children" disabled>
                        No hay niños registrados
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="id_CentroVacunacion">Centro de Vacunación</Label>
              <Select onValueChange={(value) => handleChange("id_CentroVacunacion", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un centro" />
                </SelectTrigger>
                <SelectContent>
                  {centers?.map((center) => (
                    <SelectItem key={center.id_CentroVacunacion} value={center.id_CentroVacunacion.toString()}>
                      {center.Nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_Vacuna">Vacuna</Label>
              <Select onValueChange={(value) => handleChange("id_Vacuna", value)} value={formData.id_Vacuna} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una vacuna" />
                </SelectTrigger>
                <SelectContent>
                  {vaccines?.map((vaccine) => (
                    <SelectItem key={vaccine.id_Vacuna} value={vaccine.id_Vacuna.toString()}>
                      {vaccine.Nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="FechaCita">Fecha de la Cita</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="FechaCita"
                    type="date"
                    className="pl-10"
                    value={formData.FechaCita}
                    onChange={(e) => handleChange("FechaCita", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="HoraCita">Hora de la Cita</Label>
                <Input
                  id="HoraCita"
                  type="time"
                  value={formData.HoraCita}
                  onChange={(e) => handleChange("HoraCita", e.target.value)}
                  min="07:00"
                  max="17:00"
                  required
                />
              </div>
            </div>


          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agendando cita...
                </>
              ) : (
                "Agendar Cita"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

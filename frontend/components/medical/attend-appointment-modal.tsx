"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import useApi from "@/hooks/use-api"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Syringe, Package, FileText, History } from "lucide-react"
import { formatDateString, formatTimeString } from "@/utils/format-time"
import { PatientHistoryForm } from "./patient-history-form"
import { PatientHistoryView } from "./patient-history-view"
import type { MedicalAppointment } from "@/types/medical"



interface VaccineLot {
  id_LoteVacuna: number
  NumeroLote: string
  NombreVacuna: string
  NombreFabricante: string
  FechaCaducidad: string
  CantidadDisponible: number
}

const attendSchema = z.object({
  id_LoteVacuna: z.string().min(1, "Debe seleccionar un lote de vacuna"),
  dosisNumero: z.coerce.number().min(1, "El número de dosis debe ser mayor a 0"),
  notasAdicionales: z.string().optional(),
  alergias: z.string().optional(),
  requiereProximaDosis: z.boolean().default(false),
  fechaProximaDosis: z.string().optional(),
  agendarProximaCita: z.boolean().default(false),
})

interface AttendAppointmentModalProps {
  appointment: MedicalAppointment
  patientId: number // The ID of the tutor
  centerId?: number // The ID of the selected center
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AttendAppointmentModal({ appointment, patientId, centerId, isOpen, onClose, onSuccess }: AttendAppointmentModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { request: fetchLots, loading: loadingLots } = useApi<VaccineLot[]>()
  const { request: attendAppointment, loading: attending } = useApi()
  const { request: checkHistory } = useApi<any>()

  const [vaccineLots, setVaccineLots] = useState<VaccineLot[]>([])
  const [currentDose, setCurrentDose] = useState(1)
  const [showHistoryForm, setShowHistoryForm] = useState(false)
  const [patientHasHistory, setPatientHasHistory] = useState(false)
  const [activeTab, setActiveTab] = useState("attend")

  const form = useForm<z.infer<typeof attendSchema>>({
    resolver: zodResolver(attendSchema),
    defaultValues: {
      id_LoteVacuna: "",
      dosisNumero: 1,
      notasAdicionales: "",
      alergias: "",
      requiereProximaDosis: false,
      fechaProximaDosis: "",
      agendarProximaCita: false,
    },
  })

  const watchRequiereProximaDosis = form.watch("requiereProximaDosis")

  useEffect(() => {
    if (!isOpen || !appointment) return;

    (async () => {
      await loadVaccineLots();
      let hasHistory = !!appointment.TieneHistorial;
      try {
        const data = await checkHistory("/api/medical/patient-full-history", {
          method: "POST",
          body: {
            id_Usuario: patientId,
            id_Nino: appointment.id_Nino || null,
          },
        });
        // The API returns an object { medicalHistory, vaccinationHistory }.
        // We check if medicalHistory is not null.
        if (data && data.medicalHistory) {
          hasHistory = true;
        } else {
          hasHistory = false;
        }
      } catch {
        // ignore error, use fallback
      }
      setPatientHasHistory(hasHistory);
      setShowHistoryForm(!hasHistory);

      const nextDose = (appointment.DosisAplicadas || 0) + 1;
      setCurrentDose(nextDose);
      form.setValue("dosisNumero", nextDose);

      setActiveTab(hasHistory ? "attend" : "history");
    })();
  }, [isOpen, appointment]);

  const loadVaccineLots = async () => {
    try {
      if (!centerId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se ha seleccionado un centro de vacunación.",
        });
        return;
      }
      const data = await fetchLots(`/api/medical/vaccine-lots/${appointment.id_Vacuna}?id_centro=${centerId}`)
      setVaccineLots(data || [])
    } catch (error) {
      console.error("Error loading vaccine lots:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los lotes de vacuna",
      })
    }
  }

  const handleHistoryCreated = () => {
    setPatientHasHistory(true)
    setShowHistoryForm(false)
    setActiveTab("attend")
    toast({
      title: "Historial Actualizado",
      description: "Ahora puede proceder con la atención médica",
    })
  }

  const onSubmit = async (values: z.infer<typeof attendSchema>) => {
    if (!patientHasHistory) {
      toast({
        variant: "destructive",
        title: "Historial Requerido",
        description: "Debe crear el historial médico del paciente antes de atender la cita",
      })
      setActiveTab("history")
      return
    }

    try {
      const payload = {
        id_Cita: appointment.id_Cita,
        id_LoteVacuna: Number.parseInt(values.id_LoteVacuna),
        dosisNumero: values.dosisNumero,
        notasAdicionales: values.notasAdicionales || "",
        alergias: values.alergias || "",
        requiereProximaDosis: values.requiereProximaDosis,
        fechaProximaDosis: values.fechaProximaDosis || null,
        agendarProximaCita: values.agendarProximaCita,
      }

      await attendAppointment("/api/medical/attend-appointment", {
        method: "POST",
        body: payload,
      })

      toast({
        title: "Cita Atendida",
        description: "La vacuna ha sido aplicada exitosamente",
      })

      onSuccess()
    } catch (error) {
      console.error("Error attending appointment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar la atención de la cita",
      })
    }
  }

  // Calculate minimum date for next dose (usually 21-28 days later)
  const getMinNextDoseDate = () => {
    const today = new Date()
    const minDate = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000) // 21 days from today
    return minDate.toISOString().split("T")[0]
  }

  if (!appointment) return null

  const isLastDose = currentDose >= appointment.DosisLimite

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            Atender Cita Médica
          </DialogTitle>
          <DialogDescription>
            Aplicar vacuna y registrar información médica para <strong>{appointment.NombrePaciente}</strong>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attend" disabled={!patientHasHistory}>
              <Syringe className="h-4 w-4 mr-2" />
              Atender Cita
            </TabsTrigger>
            <TabsTrigger value="history">
              <FileText className="h-4 w-4 mr-2" />
              {patientHasHistory ? "Ver Historial" : "Crear Historial"}
            </TabsTrigger>
            <TabsTrigger value="vaccines">
              <History className="h-4 w-4 mr-2" />
              Historial Vacunas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            {showHistoryForm ? (
              <PatientHistoryForm
                patientId={patientId}
                childId={appointment.id_Nino}
                patientName={appointment.NombrePaciente}
                onSuccess={handleHistoryCreated}
              />
            ) : (
              <PatientHistoryView
                patientId={patientId}
                childId={appointment.id_Nino}
                showVaccinesOnly={false}
              />
            )}
          </TabsContent>

          <TabsContent value="vaccines" className="space-y-4">
            <PatientHistoryView
              patientId={patientId}
              childId={appointment.id_Nino}
              showVaccinesOnly={true}
            />
          </TabsContent>

          <TabsContent value="attend" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Appointment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Información de la Cita
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Paciente</span>
                        <p className="font-semibold">{appointment.NombrePaciente}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Fecha</span>
                        <p>{formatDateString(appointment.Fecha)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Hora</span>
                        <p>{formatTimeString(appointment.Hora)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Vacuna</span>
                        <p className="font-medium text-blue-600">{appointment.NombreVacuna}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vaccination Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Syringe className="h-5 w-5" />
                      Detalles de la Vacunación
                    </CardTitle>
                    <CardDescription>
                      Dosis {currentDose} de {appointment.DosisLimite}
                      {isLastDose && " (Última dosis del esquema)"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="id_LoteVacuna"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Lote de Vacuna *
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar lote de vacuna" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {loadingLots ? (
                                  <div className="flex items-center justify-center p-4">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                  </div>
                                ) : (
                                  vaccineLots.map((lot) => (
                                    <SelectItem key={lot.id_LoteVacuna} value={lot.id_LoteVacuna.toString()}>
                                      <div className="flex flex-col">
                                        <span className="font-medium">Lote: {lot.NumeroLote}</span>
                                        <span className="text-xs text-gray-500">
                                          {lot.NombreFabricante} - Vence: {formatDateString(lot.FechaCaducidad)}
                                        </span>
                                        <span className="text-xs text-green-600">Disponible: {lot.CantidadDisponible}</span>
                                      </div>
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dosisNumero"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Dosis</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max={appointment.DosisLimite}
                                {...field}
                                readOnly
                                className="bg-gray-50"
                              />
                            </FormControl>
                            <p className="text-xs text-gray-500">
                              Dosis calculada automáticamente basada en el historial
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notasAdicionales"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas Médicas</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Observaciones médicas, reacciones, comentarios adicionales..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="alergias"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alergias Detectadas</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Registre cualquier alergia detectada durante esta visita..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Next Dose Scheduling */}
                {!isLastDose && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Calendar className="h-5 w-5" />
                        Programación de Próxima Dosis
                      </CardTitle>
                      <CardDescription className="text-blue-700">
                        Este paciente requiere dosis adicionales para completar el esquema de vacunación
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="requiereProximaDosis"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Programar próxima dosis</FormLabel>
                              <p className="text-sm text-gray-600">
                                Marque esta opción para programar la siguiente dosis
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      {watchRequiereProximaDosis && (
                        <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                          <FormField
                            control={form.control}
                            name="fechaProximaDosis"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fecha para la próxima dosis *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} min={getMinNextDoseDate()} />
                                </FormControl>
                                <p className="text-xs text-gray-500">Mínimo 21 días desde hoy</p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="agendarProximaCita"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Agendar cita automáticamente</FormLabel>
                                  <p className="text-sm text-gray-600">
                                    El sistema creará una nueva cita para la fecha seleccionada
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={attending || !patientHasHistory}>
                    {attending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Syringe className="mr-2 h-4 w-4" />
                        Completar Atención
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

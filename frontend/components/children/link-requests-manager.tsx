"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Check, 
  X, 
  Clock, 
  User, 
  Mail, 
  CreditCard,
  MessageCircle,
  Calendar
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import useApi from "@/hooks/use-api"

export interface LinkRequest {
  id_Solicitud: number
  id_Nino: number
  NombresNino: string
  ApellidosNino: string
  CodigoIdentificacionPropio: string
  NombresSolicitante: string
  ApellidosSolicitante: string
  CedulaSolicitante: string
  EmailSolicitante: string
  FechaSolicitud: string
  Estado: string
  MensajePersonalizado?: string
}

interface LinkRequestsManagerProps {
  isOpen: boolean
  onClose: () => void
  childId?: number
}

export default function LinkRequestsManager({ isOpen, onClose, childId }: LinkRequestsManagerProps) {
  const { toast } = useToast()
  const { data: requests, loading, error, request: fetchRequests } = useApi<LinkRequest[]>()
  const { loading: responding, request: respondRequest } = useApi()

  useEffect(() => {
    if (isOpen) {
      fetchRequests('/api/ninos/link-requests')
    }
  }, [isOpen, fetchRequests])

  const handleResponse = async (requestId: number, action: 'Aceptar' | 'Rechazar') => {
    try {
      await respondRequest(`/api/ninos/respond-link-request/${requestId}`, {
        method: 'POST',
        body: { action }
      })

      toast({
        title: `Solicitud ${action.toLowerCase()}da`,
        description: `La solicitud ha sido ${action.toLowerCase()}da exitosamente.`,
        variant: action === 'Aceptar' ? 'default' : 'destructive'
      })

      // Refresh requests
      fetchRequests('/api/ninos/link-requests')
    } catch (err) {
      toast({
        title: 'Error',
        description: `No se pudo ${action.toLowerCase()} la solicitud.`,
        variant: 'destructive'
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (nombres: string, apellidos: string) => {
    return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase()
  }

  // Filter requests by childId if provided
  const filteredRequests = childId 
    ? requests?.filter(req => req.id_Nino === childId) 
    : requests

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Solicitudes de Vinculación
          </DialogTitle>
          <DialogDescription>
            Gestiona las solicitudes de otros tutores para vincularse a tus niños.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Cargando solicitudes...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                Error al cargar las solicitudes. Por favor, inténtalo de nuevo.
              </AlertDescription>
            </Alert>
          )}

          {!loading && !error && filteredRequests && (
            <>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No tienes solicitudes pendientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <Card key={request.id_Solicitud} className="border-l-4 border-l-amber-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(request.NombresSolicitante, request.ApellidosSolicitante)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">
                                Solicitud de {request.NombresSolicitante} {request.ApellidosSolicitante}
                              </CardTitle>
                              <p className="text-sm text-gray-500">
                                Para vincularse a: <strong>{request.NombresNino} {request.ApellidosNino}</strong>
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Pendiente
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Solicitante Info */}
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Información del Solicitante
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-3 w-3 text-gray-400" />
                              <span>Cédula: {request.CedulaSolicitante}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="truncate">{request.EmailSolicitante}</span>
                            </div>
                          </div>
                        </div>

                        {/* Personal Message */}
                        {request.MensajePersonalizado && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <MessageCircle className="h-4 w-4 text-blue-600" />
                              Mensaje Personal
                            </h4>
                            <p className="text-sm text-gray-700 italic">
                              "{request.MensajePersonalizado}"
                            </p>
                          </div>
                        )}

                        {/* Request Date */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>Solicitud enviada el {formatDate(request.FechaSolicitud)}</span>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleResponse(request.id_Solicitud, 'Aceptar')}
                            disabled={responding}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Aceptar
                          </Button>
                          <Button
                            onClick={() => handleResponse(request.id_Solicitud, 'Rechazar')}
                            disabled={responding}
                            variant="destructive"
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

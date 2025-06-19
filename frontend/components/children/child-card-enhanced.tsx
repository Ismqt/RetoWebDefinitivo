"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  User, 
  MapPin, 
  Syringe, 
  Bell, 
  Share2,
  QrCode,
  Clock,
  AlertCircle
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

export interface EnhancedChild {
  id_Nino: number
  Nombres: string
  Apellidos: string
  FechaNacimiento: string
  EdadActual: number
  Genero: string
  CodigoActivacion: string
  DireccionResidencia: string
  UltimaVacuna: string
  FechaUltimaCita: string
  SolicitudesPendientes: number
}

interface ChildCardEnhancedProps {
  child: EnhancedChild
  onViewProfile?: (childId: number) => void
  onViewRequests?: (childId: number) => void
}

export default function ChildCardEnhanced({ child, onViewProfile, onViewRequests }: ChildCardEnhancedProps) {
  const [showCode, setShowCode] = useState(false)
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getGenderIcon = (genero: string) => {
    return genero === 'M' ? '👦' : '👧'
  }

  const getAgeText = (edad: number) => {
    if (edad === 0) return 'Menor de 1 año'
    if (edad === 1) return '1 año'
    return `${edad} años`
  }

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getGenderIcon(child.Genero)}</span>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {child.Nombres} {child.Apellidos}
              </CardTitle>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {getAgeText(child.EdadActual)} • {formatDate(child.FechaNacimiento)}
              </p>
            </div>
          </div>
          {child.SolicitudesPendientes > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {child.SolicitudesPendientes}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location */}
        {child.DireccionResidencia && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="truncate">{child.DireccionResidencia}</span>
          </div>
        )}

        {/* Last Vaccination */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Syringe className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Última Vacunación</span>
          </div>
          <div className="text-sm text-gray-600">
            {child.UltimaVacuna === 'Sin vacunas' ? (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="h-3 w-3" />
                <span>Sin vacunas registradas</span>
              </div>
            ) : (
              <div>
                <p className="font-medium">{child.UltimaVacuna}</p>
                <p className="text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(child.FechaUltimaCita)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Activation Code */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Código de Activación</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCode(!showCode)}
              className="text-xs"
            >
              {showCode ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
          {showCode && (
            <div className="font-mono text-lg bg-white p-2 rounded border text-center tracking-wider">
              {child.CodigoActivacion}
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewProfile?.(child.id_Nino)}
            className="flex-1"
          >
            <User className="h-4 w-4 mr-1" />
            Ver Perfil
          </Button>
          
          {child.SolicitudesPendientes > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onViewRequests?.(child.id_Nino)}
              className="flex-1 relative"
            >
              <Bell className="h-4 w-4 mr-1" />
              Solicitudes
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
              >
                {child.SolicitudesPendientes}
              </Badge>
            </Button>
          )}
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Compartir Código de Activación</DialogTitle>
                <DialogDescription>
                  Comparte este código con otro tutor para que pueda solicitar vincularse a {child.Nombres}.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <div className="font-mono text-xl bg-gray-100 p-4 rounded text-center tracking-wider">
                    {child.CodigoActivacion}
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-start">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(child.CodigoActivacion)
                  }}
                >
                  Copiar Código
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, QrCode, Send, Heart } from "lucide-react"
import useApi from "@/hooks/use-api"

const formSchema = z.object({
  codigoActivacion: z.string()
    .min(1, "El código de activación es requerido")
    .regex(/^[A-Z0-9]+$/, "El código debe contener solo letras mayúsculas y números"),
  mensajePersonalizado: z.string()
    .max(500, "El mensaje no puede exceder 500 caracteres")
    .optional()
})

type FormData = z.infer<typeof formSchema>

interface RequestLinkFormProps {
  onSuccess?: () => void
  className?: string
}

export default function RequestLinkForm({ onSuccess, className }: RequestLinkFormProps) {
  const { toast } = useToast()
  const { request: submitRequest, loading } = useApi()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigoActivacion: "",
      mensajePersonalizado: ""
    }
  })

  const onSubmit = async (values: FormData) => {
    try {
      await submitRequest('/api/ninos/request-link', {
        method: 'POST',
        body: {
          CodigoActivacion: values.codigoActivacion,
          MensajePersonalizado: values.mensajePersonalizado
        }
      })

      setIsSubmitted(true)
      form.reset()
      
      toast({
        title: "¡Solicitud Enviada!",
        description: "Tu solicitud de vinculación ha sido enviada. El tutor recibirá una notificación para aprobarla.",
      })

      onSuccess?.()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "No se pudo enviar la solicitud. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  if (isSubmitted) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">¡Solicitud Enviada!</h3>
              <p className="text-sm text-gray-600 mt-2">
                Tu solicitud ha sido enviada al tutor. Recibirás una notificación cuando sea respondida.
              </p>
            </div>
            <Button 
              onClick={() => setIsSubmitted(false)}
              variant="outline"
            >
              Enviar Otra Solicitud
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          Solicitar Vinculación a Niño
        </CardTitle>
        <p className="text-sm text-gray-600">
          Ingresa el código de activación del niño para enviar una solicitud de vinculación a su tutor actual.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="codigoActivacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Código de Activación *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej: ABC123XYZ"
                      className="font-mono text-lg tracking-wider text-center"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      maxLength={20}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500">
                    Solicita este código al tutor actual del niño
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mensajePersonalizado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Mensaje Personal (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Escribe un mensaje personal para el tutor explicando por qué quieres vincularte a este niño..."
                      className="min-h-[100px] resize-none"
                      maxLength={500}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Un mensaje personal aumenta las posibilidades de aprobación</span>
                    <span>{field.value?.length || 0}/500</span>
                  </div>
                </FormItem>
              )}
            />

            {loading && (
              <Alert>
                <AlertDescription>Enviando solicitud...</AlertDescription>
              </Alert>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-amber-600 mt-0.5">💡</div>
                <div className="text-sm">
                  <p className="font-medium text-amber-800 mb-1">Consejos para tu solicitud:</p>
                  <ul className="text-amber-700 space-y-1 text-xs">
                    <li>• Explica tu relación con el niño (familiar, cuidador, etc.)</li>
                    <li>• Menciona por qué necesitas acceso a su información médica</li>
                    <li>• Sé claro y respetuoso en tu mensaje</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando Solicitud...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Solicitud
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

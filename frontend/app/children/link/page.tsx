"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import RequestLinkForm from "@/components/children/request-link-form";
import { useRouter } from "next/navigation";

export default function LinkChildPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSuccess = () => {
    // Navigate back to children list after successful request
    setTimeout(() => {
      router.push('/children');
    }, 2000);
  };

  // Only tutors can request links
  if (user?.id_Rol !== 5) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>Solo los tutores pueden solicitar vinculación a niños.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/children">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mis Niños
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            Solicitar Vinculación
          </h1>
          <p className="text-gray-600">
            Envía una solicitud para vincularte a un niño existente
          </p>
        </div>
      </div>

      {/* Information Card */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">¿Cómo funciona?</CardTitle>
          <CardDescription className="text-blue-700">
            <div className="space-y-2 mt-2">
              <div className="flex items-start gap-2">
                <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full font-medium min-w-fit">1</span>
                <span className="text-sm">Solicita el código de activación al tutor actual del niño</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full font-medium min-w-fit">2</span>
                <span className="text-sm">Ingresa el código y un mensaje personal explicando tu relación</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full font-medium min-w-fit">3</span>
                <span className="text-sm">El tutor recibirá tu solicitud y podrá aprobarla o rechazarla</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full font-medium min-w-fit">4</span>
                <span className="text-sm">Si es aprobada, tendrás acceso a la información del niño</span>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Request Form */}
      <RequestLinkForm onSuccess={handleSuccess} />

      {/* Additional Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">💡 Consejos para una solicitud exitosa:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Sé específico:</strong> Explica claramente tu relación con el niño</li>
          <li>• <strong>Proporciona contexto:</strong> Menciona por qué necesitas acceso a la información</li>
          <li>• <strong>Sé respetuoso:</strong> Un mensaje cortés aumenta las posibilidades de aprobación</li>
          <li>• <strong>Incluye contacto:</strong> Si es necesario, proporciona información de contacto adicional</li>
        </ul>
      </div>
    </div>
  );
}

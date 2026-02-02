import { getFormResponses } from "@/lib/google-forms/service";
import { ResponsesTable } from "@/components/admin/forms/ResponsesTable";
import { FormAnalytics } from "@/components/admin/forms/FormAnalytics";
import { StaticAnalysisReport } from "@/components/admin/forms/StaticAnalysisReport"; // Import static report
import { calculateAnalytics } from "@/lib/google-forms/analytics";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function FormDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // ID especifico de la encuesta de validación
  const IS_VALIDATION_FORM = id === '17cXUR1aJHApjghaNmo0BN3Xj7eCj2Vg4RBYls8hDvJY';

  try {
    const { normalized, formTitle, totalResponses } = await getFormResponses(id);
    const analytics = calculateAnalytics(normalized);

    return (
      <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4 border-b pb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/forms">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{formTitle}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span>ID: {id}</span>
              <Badge variant="secondary">{totalResponses} respuestas</Badge>
            </div>
          </div>
        </div>

        {/* 
            Si es el formulario de validación conocido, mostramos el reporte estático "digerido".
            Si no, mostramos la analítica automática genérica.
        */}
        <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Análisis de Respuestas</h2>
            {IS_VALIDATION_FORM ? (
                <StaticAnalysisReport />
            ) : (
                <FormAnalytics stats={analytics} />
            )}
        </div>

        <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Registro Detallado</h2>
            <Card>
            <CardContent className="p-0 overflow-hidden">
                <div className="max-h-[600px] overflow-auto">
                    <ResponsesTable responses={normalized} />
                </div>
            </CardContent>
            </Card>
        </div>
      </div>
      </DashboardLayout>
    );
  } catch (error: any) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold text-red-600">Error al cargar el formulario</h2>
        <p className="text-muted-foreground mt-2">{error.message}</p>
        <Button asChild className="mt-4" variant="outline">
            <Link href="/admin/forms">Volver</Link>
        </Button>
      </div>
    );
  }
}

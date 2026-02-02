import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";

const FORMS = [
  {
    id: "17cXUR1aJHApjghaNmo0BN3Xj7eCj2Vg4RBYls8hDvJY",
    title: "Encuesta de Movilidad Regional",
    description: "Formulario principal sobre hábitos de viaje y transporte."
  }
];

export default function FormsPage() {
  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Formularios de Google</h1>
        <p className="text-muted-foreground">
          Gestiona y visualiza las respuestas de tus formularios conectados.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FORMS.map((form) => (
          <Card key={form.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {form.title}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Google Form</div>
              <p className="text-xs text-muted-foreground mt-1">
                {form.description}
              </p>
              <div className="mt-4">
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/admin/forms/${form.id}`}>
                    Ver Respuestas <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </DashboardLayout>
  );
}

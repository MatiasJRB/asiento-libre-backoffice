import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingUp, Users, Shield, MapPin, AlertTriangle, Dog } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function StaticAnalysisReport() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Executive Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Adopción Potencial</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">Alta</div>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
              Gran mayoría dispuesta a usar la app ("Sí" o "Tal vez")
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Principal Obstáculo Actual</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Frecuencia</div>
            <p className="text-xs text-muted-foreground">
              Horarios rígidos e incomodidad del transporte público
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factor Decisivo</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Confianza</div>
            <p className="text-xs text-muted-foreground">
              "Saber quién es" es más valorado que el ahorro
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ruta Estrella</CardTitle>
            <MapPin className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bahía - Suárez</div>
            <p className="text-xs text-muted-foreground">
              Ruta con mayor mención espontánea
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deep Dive Sections */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Column 1: Demographics & Roles */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil del Usuario</CardTitle>
              <CardDescription>Análisis de los 74 encuestados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rol Predominante</span>
                  <span className="font-medium">Mixto</span>
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Existe un balance saludable entre conductores con auto propio y pasajeros. Muchos usuarios (especialmente estudiantes/jóvenes) oscilan entre ambos roles dependiendo del viaje.
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frecuencia de Viaje</span>
                  <span className="font-medium">Ocasional</span>
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  La mayoría viaja "1-2 veces al mes" o "muy de vez en cuando". Esto sugiere un modelo de uso esporádico más que commuting diario.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Qualitative Insights */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-slate-50 dark:bg-slate-900 border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                La Voz del Usuario (Insights Clave)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">🚗 Seguridad ante todo</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  La barrera de entrada no es tanto el precio, sino la <strong>incertidumbre social</strong>. Los usuarios piden perfiles verificados, validación de identidad y saber "quién me lleva".
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Dog className="h-4 w-4"/>
                    Nicho: Mascotas
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Un hallazgo interesante es la dificultad de viajar con mascotas en micros. Asiento Libre podría capturar este nicho permitiendo filtros "Pet Friendly".
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">🚌 Hartazgo del Transporte Público</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Palabras recurrentes: "Lento", "Incomodo", "Horarios feos". La propuesta de valor debe centrarse en la <strong>flexibilidad y confort</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">💬 Terminología</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Feedback directo sobre UX: usuarios sugieren usar "Micro" en lugar de "Bondi" para sonar más profesional en largas distancias.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
             <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Rutas Solicitadas</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Bahía Blanca ↔ Coronel Suárez</li>
                        <li>Bahía Blanca ↔ Monte Hermoso</li>
                        <li>Bahía Blanca ↔ Punta Alta</li>
                        <li>Bahía Blanca ↔ Dorrego</li>
                        <li>Bahía Blanca ↔ Tornquist</li>
                    </ul>
                </CardContent>
             </Card>

             <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Funcionalidades Esperadas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Perfil Conductor</Badge>
                        <Badge variant="secondary">Reseñas/Calificaciones</Badge>
                        <Badge variant="secondary">Filtro Mascotas</Badge>
                        <Badge variant="secondary">Modelo del Auto</Badge>
                        <Badge variant="secondary">Precios Claros</Badge>
                    </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

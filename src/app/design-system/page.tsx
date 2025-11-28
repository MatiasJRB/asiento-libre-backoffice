import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { KPICard } from '@/components/ui/kpi-card'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Separator } from '@/components/ui/separator'
import { Users, TrendingUp, Car, AlertCircle, Package } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function DesignSystemPage() {
  return (
    <DashboardLayout>
      <div className="space-y-12 pb-12">
        <PageHeader
          title="Design System"
          description="Catálogo de componentes y patrones visuales de Asiento Libre"
        />

        {/* Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Paleta de Colores</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Brand Colors</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="h-20 rounded-lg mb-2 border border-neutral-200" style={{ backgroundColor: '#d1450a' }} />
                  <p className="text-sm font-medium">Primary</p>
                  <p className="text-xs text-neutral-500">#d1450a</p>
                  <p className="text-xs text-neutral-400">Naranja oscuro - Confianza</p>
                </div>
                <div>
                  <div className="h-20 rounded-lg mb-2 border border-neutral-200" style={{ backgroundColor: '#e8e6e0' }} />
                  <p className="text-sm font-medium">Secondary</p>
                  <p className="text-xs text-neutral-500">#e8e6e0</p>
                  <p className="text-xs text-neutral-400">Beige claro - Sostenibilidad</p>
                </div>
                <div>
                  <div className="h-20 rounded-lg mb-2 border border-neutral-200" style={{ backgroundColor: '#d1450a' }} />
                  <p className="text-sm font-medium">Accent</p>
                  <p className="text-xs text-neutral-500">#d1450a</p>
                  <p className="text-xs text-neutral-400">Naranja - Energía</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Semantic Colors</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="h-20 rounded-lg mb-2 border border-neutral-200" style={{ backgroundColor: '#10B981' }} />
                  <p className="text-sm font-medium">Success</p>
                  <p className="text-xs text-neutral-500">#10B981</p>
                </div>
                <div>
                  <div className="h-20 rounded-lg mb-2 border border-neutral-200" style={{ backgroundColor: '#EF4444' }} />
                  <p className="text-sm font-medium">Error</p>
                  <p className="text-xs text-neutral-500">#EF4444</p>
                </div>
                <div>
                  <div className="h-20 rounded-lg mb-2 border border-neutral-200" style={{ backgroundColor: '#F59E0B' }} />
                  <p className="text-sm font-medium">Warning</p>
                  <p className="text-xs text-neutral-500">#F59E0B</p>
                </div>
                <div>
                  <div className="h-20 rounded-lg mb-2 border border-neutral-200" style={{ backgroundColor: '#3B82F6' }} />
                  <p className="text-sm font-medium">Info</p>
                  <p className="text-xs text-neutral-500">#3B82F6</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Neutral Scale</h3>
              <div className="grid grid-cols-5 gap-2">
                <div>
                  <div className="h-16 rounded-lg mb-2 border border-neutral-200 bg-neutral-50" />
                  <p className="text-xs font-medium">50</p>
                </div>
                <div>
                  <div className="h-16 rounded-lg mb-2 border border-neutral-200 bg-neutral-100" />
                  <p className="text-xs font-medium">100</p>
                </div>
                <div>
                  <div className="h-16 rounded-lg mb-2 border border-neutral-200 bg-neutral-200" />
                  <p className="text-xs font-medium">200</p>
                </div>
                <div>
                  <div className="h-16 rounded-lg mb-2 border border-neutral-200 bg-neutral-300" />
                  <p className="text-xs font-medium">300</p>
                </div>
                <div>
                  <div className="h-16 rounded-lg mb-2 border border-neutral-200 bg-neutral-400" />
                  <p className="text-xs font-medium">400</p>
                </div>
                <div>
                  <div className="h-16 rounded-lg mb-2 border border-neutral-200 bg-neutral-500" />
                  <p className="text-xs font-medium">500</p>
                </div>
                <div>
                  <div className="h-16 rounded-lg mb-2 border border-neutral-200 bg-neutral-600" />
                  <p className="text-xs font-medium">600</p>
                </div>
                <div>
                  <div className="h-16 rounded-lg mb-2 border border-neutral-200 bg-neutral-700" />
                  <p className="text-xs font-medium">700</p>
                </div>
                <div>
                  <div className="h-16 rounded-lg mb-2 border border-neutral-200 bg-neutral-800" />
                  <p className="text-xs font-medium">800</p>
                </div>
                <div>
                  <div className="h-16 rounded-lg mb-2 border border-neutral-200 bg-neutral-900" />
                  <p className="text-xs font-medium">900</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Tipografía</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h1 className="text-4xl font-bold">Heading 1</h1>
              <p className="text-sm text-neutral-500 mt-1">text-4xl font-bold</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h2 className="text-3xl font-bold">Heading 2</h2>
              <p className="text-sm text-neutral-500 mt-1">text-3xl font-bold</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-2xl font-semibold">Heading 3</h3>
              <p className="text-sm text-neutral-500 mt-1">text-2xl font-semibold</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="text-base">Body text regular - El texto base se usa para el contenido principal de la aplicación.</p>
              <p className="text-sm text-neutral-500 mt-1">text-base</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="text-sm text-neutral-600">Small text - Usado para texto secundario y descripciones.</p>
              <p className="text-sm text-neutral-500 mt-1">text-sm text-neutral-600</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Botones</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Variantes</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Primary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Tamaños</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Users className="size-4" />
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Estados</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Status Badges */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Status Badges</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Estados Disponibles</h3>
              <div className="flex flex-wrap gap-4">
                <StatusBadge status="active">Activo</StatusBadge>
                <StatusBadge status="pending">Pendiente</StatusBadge>
                <StatusBadge status="completed">Completado</StatusBadge>
                <StatusBadge status="cancelled">Cancelado</StatusBadge>
                <StatusBadge status="suspended">Suspendido</StatusBadge>
                <StatusBadge status="verified">Verificado</StatusBadge>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Sin punto indicador</h3>
              <div className="flex flex-wrap gap-4">
                <StatusBadge status="active" dot={false}>Activo</StatusBadge>
                <StatusBadge status="pending" dot={false}>Pendiente</StatusBadge>
                <StatusBadge status="completed" dot={false}>Completado</StatusBadge>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* KPI Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-6">KPI Cards</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Con tendencias</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                  title="Total Usuarios"
                  value="1,245"
                  subtitle="vs mes anterior"
                  icon={Users}
                  trend={{ value: 12, isPositive: true }}
                />
                <KPICard
                  title="Viajes Activos"
                  value="87"
                  icon={Car}
                  trend={{ value: -3, isPositive: false }}
                />
                <KPICard
                  title="Tasa Conversión"
                  value="67.3%"
                  icon={TrendingUp}
                  trend={{ value: 5.2, isPositive: true }}
                />
                <KPICard
                  title="Rating"
                  value="4.8/5"
                  icon={AlertCircle}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Variantes de color</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                  title="Default"
                  value="123"
                  variant="default"
                />
                <KPICard
                  title="Success"
                  value="456"
                  variant="success"
                />
                <KPICard
                  title="Warning"
                  value="789"
                  variant="warning"
                />
                <KPICard
                  title="Error"
                  value="12"
                  variant="error"
                />
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Básica</CardTitle>
                <CardDescription>Una card simple con título y descripción</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600">
                  El contenido de la card va aquí. Puede incluir texto, listas, o cualquier otro contenido.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card con Contenido</CardTitle>
                <CardDescription>Ejemplo con más elementos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Label:</span>
                  <span className="text-sm font-medium">Value</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Otro label:</span>
                  <span className="text-sm font-medium">Otro value</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Empty States */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Empty States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  icon={Package}
                  title="No hay datos"
                  description="No se encontraron elementos para mostrar."
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  icon={Users}
                  title="Sin usuarios"
                  description="Aún no hay usuarios registrados en el sistema."
                />
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Spacing */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Sistema de Espaciado</h2>
          <div className="space-y-4">
            <p className="text-neutral-600">
              Basado en múltiplos de 4px. Usar clases de Tailwind: p-1 (4px), p-2 (8px), p-4 (16px), etc.
            </p>
            <div className="space-y-2">
              {[1, 2, 3, 4, 6, 8, 10, 12, 16].map((size) => (
                <div key={size} className="flex items-center gap-4">
                  <div className={`bg-primary h-8`} style={{ width: `${size * 4}px` }} />
                  <span className="text-sm font-mono">
                    p-{size} = {size * 4}px
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* Border Radius */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Border Radius</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'xs', value: '4px' },
              { name: 'sm', value: '8px' },
              { name: 'md', value: '12px' },
              { name: 'lg', value: '16px' },
              { name: 'xl', value: '20px' },
              { name: '2xl', value: '25px' },
              { name: 'full', value: '9999px' },
            ].map((radius) => (
              <div key={radius.name} className="text-center">
                <div 
                  className={`h-20 bg-primary mb-2 rounded-${radius.name}`}
                />
                <p className="text-sm font-medium">{radius.name}</p>
                <p className="text-xs text-neutral-500">{radius.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

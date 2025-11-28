# 🎨 Plan de Implementación - Design System Asiento Libre Backoffice

## 📋 Resumen Ejecutivo

Este documento detalla el plan completo para implementar y consolidar el Design System de Asiento Libre en el backoffice, basado en los design tokens ya existentes y las mejores prácticas visuales.

**Estado Actual:**
- ✅ Design tokens definidos en `src/lib/design-tokens.ts`
- ✅ CSS variables configuradas en `src/app/globals.css`
- ✅ Componentes UI base (shadcn/ui) instalados
- ⚠️ Aplicación inconsistente de tokens en componentes
- ⚠️ Falta documentación de componentes
- ⚠️ No hay storybook o catálogo visual

---

## 🎯 Objetivos

1. **Consistencia Visual Total**: Todos los componentes usan los design tokens
2. **Documentación Completa**: Guía visual de componentes y patrones
3. **Escalabilidad**: Sistema fácil de extender y mantener
4. **Accesibilidad**: Cumplir con estándares WCAG 2.1 AA
5. **Developer Experience**: Herramientas que faciliten el desarrollo

---

## 📐 Fundamentos del Design System

### Identidad Visual Asiento Libre

#### Paleta de Colores Principal

```typescript
// Brand Colors - Identidad de marca
primary: '#1B365D'      // Azul petróleo - Confianza y solidez
secondary: '#A8E05F'    // Verde lima - Sostenibilidad
accent: '#FF6B35'       // Naranja coral - Energía y conexión

// Neutrals
neutral.50: '#F8F8F8'   // Fondos claros
neutral.800: '#2E2E2E'  // Texto principal
neutral.900: '#1A1A1A'  // Headings
```

#### Tipografía

```
Font Family: Geist Sans (principal), Geist Mono (código)
Escala: 12px → 48px (8 niveles)
Weights: normal(400), medium(500), semibold(600), bold(700)
```

#### Espaciado

```
Sistema de 4px base
Escala: 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 60, 64, 80, 96
```

#### Border Radius

```
xs: 4px   - Elementos pequeños
sm: 8px   - Inputs, cards pequeñas
md: 12px  - Cards medianas
lg: 16px  - Cards grandes
2xl: 25px - Botones pill
full: 9999px - Círculos
```

---

## 🗂️ Estructura de Implementación

### Fase 1: Auditoría y Limpieza (1-2 días)
**Prioridad: 🔴 CRÍTICA**

#### 1.1 Auditoría de Componentes Actuales

```bash
# Crear reporte de uso de colores hardcodeados
grep -r "bg-\[#" src/
grep -r "text-\[#" src/
grep -r "border-\[#" src/
```

**Acción:** Documentar todos los casos donde se usan colores/estilos hardcodeados

#### 1.2 Inventario de Componentes

Crear archivo: `docs/COMPONENT_INVENTORY.md`

```markdown
## Componentes Existentes

### UI Base (shadcn/ui)
- [ ] Button - Status: Revisión necesaria
- [ ] Card - Status: OK
- [ ] Dialog - Status: Revisión necesaria
- [ ] Select - Status: Revisión necesaria
- [ ] Textarea - Status: Revisión necesaria

### Componentes Custom
- [ ] DashboardLayout - Status: Revisar espaciado
- [ ] UserActions - Status: Revisar colores
- [ ] RideActions - Status: Revisar colores
- [ ] ReportActions - Status: Revisar colores

### Páginas
- [ ] Dashboard - Status: Revisar KPI cards
- [ ] Users - Status: OK
- [ ] Rides - Status: OK
- [ ] Reports - Status: OK
- [ ] Search Analytics - Status: Revisar gráficos
```

#### 1.3 Limpieza de Código

**Tareas:**
- [ ] Eliminar estilos inline con valores hardcodeados
- [ ] Reemplazar colores hex directos por tokens
- [ ] Consolidar clases duplicadas
- [ ] Eliminar archivos CSS no utilizados

---

### Fase 2: Consolidación de Tokens (2-3 días)
**Prioridad: 🔴 CRÍTICA**

#### 2.1 Extender Tailwind Config

Crear: `tailwind.config.ts` (actualizar existing)

```typescript
import type { Config } from "tailwindcss";
import { tokens } from "./src/lib/design-tokens";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: tokens.colors.brand.primary,
          dark: tokens.colors.brand.primaryDark,
          light: tokens.colors.brand.primaryLight,
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: tokens.colors.brand.secondary,
          dark: tokens.colors.brand.secondaryDark,
          light: tokens.colors.brand.secondaryLight,
          foreground: tokens.colors.neutral[800],
        },
        accent: {
          DEFAULT: tokens.colors.brand.accent,
          dark: tokens.colors.brand.accentDark,
          light: tokens.colors.brand.accentLight,
          foreground: '#FFFFFF',
        },
        // Neutrals
        neutral: tokens.colors.neutral,
        // Semantic
        error: tokens.colors.semantic.error,
        success: tokens.colors.semantic.success,
        warning: tokens.colors.semantic.warning,
        info: tokens.colors.semantic.info,
      },
      spacing: tokens.spacing,
      borderRadius: tokens.radius,
      fontSize: Object.entries(tokens.fontSize).reduce((acc, [key, value]) => {
        acc[key] = `${value}px`;
        return acc;
      }, {} as Record<string, string>),
      fontWeight: tokens.fontWeight,
    },
  },
  plugins: [],
};

export default config;
```

#### 2.2 Actualizar globals.css

Optimizar el archivo para usar solo las variables necesarias:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Usar tokens de design-tokens.ts como fuente única de verdad */
    --background: 0 0% 100%;
    --foreground: 0 0% 18%;
    
    /* Semantic mappings para shadcn */
    --card: 0 0% 100%;
    --card-foreground: 0 0% 18%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 18%;
    
    --primary: 216 55% 23%; /* #1B365D */
    --primary-foreground: 0 0% 100%;
    
    --secondary: 78 64% 64%; /* #A8E05F */
    --secondary-foreground: 0 0% 18%;
    
    --accent: 14 100% 60%; /* #FF6B35 */
    --accent-foreground: 0 0% 100%;
    
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    
    --border: 0 0% 90%;
    --input: 0 0% 90%;
    --ring: 216 55% 23%;
    
    --radius: 0.75rem; /* 12px default */
  }
}

@layer utilities {
  /* Utilities personalizadas usando tokens */
  .text-balance {
    text-wrap: balance;
  }
}
```

---

### Fase 3: Biblioteca de Componentes (3-4 días)
**Prioridad: 🟠 ALTA**

#### 3.1 Componentes UI Adicionales Necesarios

Instalar componentes shadcn faltantes:

```bash
# Componentes esenciales
npx shadcn@latest add badge
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add dropdown-menu
npx shadcn@latest add label
npx shadcn@latest add input
npx shadcn@latest add checkbox
npx shadcn@latest add switch
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add toast
npx shadcn@latest add alert
npx shadcn@latest add progress
```

#### 3.2 Componentes Custom del Backoffice

Crear componentes específicos del dominio:

**3.2.1 KPI Card Component**

`src/components/ui/kpi-card.tsx`

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { tokens } from '@/lib/design-tokens'
import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default'
}: KPICardProps) {
  const variantStyles = {
    default: 'border-neutral-200',
    success: 'border-success/20 bg-success/5',
    warning: 'border-warning/20 bg-warning/5',
    error: 'border-error/20 bg-error/5',
  }
  
  return (
    <Card className={variantStyles[variant]}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-600">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="size-4 text-neutral-400" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-neutral-900">{value}</div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span className={`text-sm font-medium ${
                trend.isPositive ? 'text-success' : 'text-error'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
            {subtitle && (
              <p className="text-xs text-neutral-500">{subtitle}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**3.2.2 Status Badge Component**

`src/components/ui/status-badge.tsx`

```typescript
import { Badge } from '@/components/ui/badge'
import { cva, type VariantProps } from 'class-variance-authority'

const statusVariants = cva(
  'inline-flex items-center gap-1.5 font-medium',
  {
    variants: {
      status: {
        active: 'bg-success-light text-success-dark border-success',
        pending: 'bg-warning-light text-warning-dark border-warning',
        cancelled: 'bg-neutral-100 text-neutral-600 border-neutral-300',
        completed: 'bg-info-light text-info-dark border-info',
        suspended: 'bg-error-light text-error-dark border-error',
        verified: 'bg-success-light text-success-dark border-success',
      },
    },
    defaultVariants: {
      status: 'active',
    },
  }
)

interface StatusBadgeProps extends VariantProps<typeof statusVariants> {
  children: React.ReactNode
  dot?: boolean
}

export function StatusBadge({ status, children, dot = true }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={statusVariants({ status })}>
      {dot && (
        <span className="size-1.5 rounded-full bg-current" />
      )}
      {children}
    </Badge>
  )
}
```

**3.2.3 Empty State Component**

`src/components/ui/empty-state.tsx`

```typescript
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-neutral-100 p-4">
          <Icon className="size-8 text-neutral-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-neutral-500 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

**3.2.4 Data Table Component**

`src/components/ui/data-table.tsx`

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Column<T> {
  header: string
  accessorKey: keyof T | ((row: T) => React.ReactNode)
  cell?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  emptyMessage?: string
}

export function DataTable<T>({ 
  data, 
  columns, 
  emptyMessage = 'No hay datos disponibles' 
}: DataTableProps<T>) {
  return (
    <div className="rounded-md border border-neutral-200">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, i) => (
              <TableHead key={i}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                className="text-center py-8 text-neutral-500"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow key={i}>
                {columns.map((column, j) => (
                  <TableCell key={j}>
                    {column.cell 
                      ? column.cell(row)
                      : typeof column.accessorKey === 'function'
                      ? column.accessorKey(row)
                      : String(row[column.accessorKey as keyof T])}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
```

#### 3.3 Patrones de Layout

**3.3.1 Page Header Component**

`src/components/ui/page-header.tsx`

```typescript
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline'
  }
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-neutral-600">{description}</p>
        )}
      </div>
      {action && (
        <Button 
          onClick={action.onClick}
          variant={action.variant || 'default'}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

---

### Fase 4: Documentación Visual (2-3 días)
**Prioridad: 🟡 MEDIA**

#### 4.1 Guía de Estilo

Crear: `docs/VISUAL_GUIDE.md`

```markdown
# 🎨 Guía Visual - Asiento Libre Backoffice

## Principios de Diseño

### 1. Claridad sobre Creatividad
- Priorizar legibilidad y funcionalidad
- Evitar efectos visuales innecesarios
- Jerarquía visual clara

### 2. Consistencia
- Usar siempre los design tokens
- Seguir patrones establecidos
- Mantener espaciados predecibles

### 3. Accesibilidad
- Contraste mínimo 4.5:1 para texto
- Áreas clicables de 44x44px mínimo
- Estados focus visibles

## Paleta de Colores

### Uso de Colores Brand

**Primary (Azul Petróleo #1B365D)**
- Uso: Botones principales, links, encabezados importantes
- No usar: Fondos grandes, texto sobre fondos oscuros
- Ejemplo: Botón "Guardar", "Confirmar"

**Secondary (Verde Lima #A8E05F)**
- Uso: Indicadores positivos, badges de éxito
- No usar: Botones primarios
- Ejemplo: Badge "Verificado", indicador de crecimiento

**Accent (Naranja Coral #FF6B35)**
- Uso: Call-to-actions secundarias, badges de atención
- No usar: Errores (usar semantic.error)
- Ejemplo: Badge "Nuevo", highlight de features

### Colores Semánticos

**Success (#10B981)**
```jsx
// ✅ Correcto
<Badge className="bg-success-light text-success-dark">Aprobado</Badge>

// ❌ Incorrecto
<Badge style={{ background: '#10B981' }}>Aprobado</Badge>
```

**Error (#EF4444)**
```jsx
// ✅ Correcto
<Button variant="destructive">Eliminar</Button>

// ❌ Incorrecto
<Button className="bg-red-500">Eliminar</Button>
```

## Tipografía

### Jerarquía de Texto

```jsx
// Títulos de página
<h1 className="text-3xl font-bold text-neutral-900">Título Principal</h1>

// Subtítulos de sección
<h2 className="text-2xl font-semibold text-neutral-800">Sección</h2>

// Cards titles
<h3 className="text-lg font-semibold text-neutral-800">Card Title</h3>

// Texto normal
<p className="text-base text-neutral-700">Contenido normal</p>

// Texto secundario
<p className="text-sm text-neutral-500">Texto secundario</p>

// Labels
<label className="text-sm font-medium text-neutral-700">Label</label>
```

## Espaciado

### Sistema de Spacing

```jsx
// Espaciado interno de componentes
<Card className="p-6">       // 24px padding
<Button className="px-4 py-2"> // 16px horizontal, 8px vertical

// Espaciado entre elementos
<div className="space-y-4">   // 16px gap vertical
<div className="gap-6">        // 24px gap en flex/grid

// Márgenes de página
<main className="p-8">         // 32px padding
```

### Reglas de Espaciado

1. **Dentro de componentes**: 4px, 8px, 12px, 16px
2. **Entre componentes**: 16px, 24px, 32px
3. **Secciones de página**: 32px, 48px, 64px

## Componentes

### Botones

```jsx
// Primary Action
<Button variant="default">Guardar Cambios</Button>

// Secondary Action
<Button variant="outline">Cancelar</Button>

// Destructive Action
<Button variant="destructive">Eliminar Usuario</Button>

// Ghost (navegación)
<Button variant="ghost">Ver Más</Button>
```

### Cards

```jsx
// Card estándar
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenido */}
  </CardContent>
</Card>

// KPI Card
<KPICard
  title="Total Usuarios"
  value="1,245"
  subtitle="vs mes anterior"
  trend={{ value: 12, isPositive: true }}
/>
```

### Badges de Estado

```jsx
<StatusBadge status="active">Activo</StatusBadge>
<StatusBadge status="pending">Pendiente</StatusBadge>
<StatusBadge status="cancelled">Cancelado</StatusBadge>
<StatusBadge status="suspended">Suspendido</StatusBadge>
<StatusBadge status="verified">Verificado</StatusBadge>
```

## Layouts

### Estructura de Página Estándar

```jsx
export default function Page() {
  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader
        title="Título de Página"
        description="Descripción opcional"
        action={{
          label: "Nueva Acción",
          onClick: () => {}
        }}
      />
      
      {/* Contenido principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cards o contenido */}
      </div>
    </DashboardLayout>
  )
}
```

### Grid de KPIs

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <KPICard {...} />
  <KPICard {...} />
  <KPICard {...} />
  <KPICard {...} />
</div>
```

## Accesibilidad

### Checklist

- [ ] Contraste de colores cumple WCAG AA (4.5:1)
- [ ] Todos los botones tienen tamaño mínimo 44x44px
- [ ] Estados :focus visibles con ring
- [ ] Textos alternativos en imágenes
- [ ] Labels asociados a inputs
- [ ] Navegación por teclado funcional
- [ ] Aria-labels en iconos interactivos

### Ejemplos

```jsx
// ✅ Botón accesible
<Button 
  aria-label="Eliminar usuario Juan Pérez"
  className="min-h-[44px]"
>
  <Trash2 className="size-4" />
</Button>

// ✅ Input accesible
<div>
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email"
    aria-describedby="email-error"
  />
  <span id="email-error" className="text-sm text-error">
    Email inválido
  </span>
</div>
```

## Responsividad

### Breakpoints

```
sm: 640px   - Tablets pequeñas
md: 768px   - Tablets
lg: 1024px  - Laptops
xl: 1280px  - Desktops
2xl: 1536px - Pantallas grandes
```

### Patrones Responsive

```jsx
// Grids adaptativos
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Ocultar en móvil
<div className="hidden md:block">

// Stack en móvil, row en desktop
<div className="flex flex-col md:flex-row gap-4">

// Padding responsive
<div className="p-4 md:p-6 lg:p-8">
```
```

#### 4.2 Component Gallery Page

Crear página interna para visualizar componentes:

`src/app/design-system/page.tsx`

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { KPICard } from '@/components/ui/kpi-card'
import { PageHeader } from '@/components/ui/page-header'
import { Users, TrendingUp, Car, AlertCircle } from 'lucide-react'

export default function DesignSystemPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Design System"
        description="Catálogo de componentes y patrones visuales"
      />
      
      {/* Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Colores</h2>
        
        <h3 className="text-lg font-semibold mb-4">Brand</h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <div className="h-20 rounded-lg bg-primary mb-2" />
            <p className="text-sm font-medium">Primary</p>
            <p className="text-xs text-neutral-500">#1B365D</p>
          </div>
          <div>
            <div className="h-20 rounded-lg bg-secondary mb-2" />
            <p className="text-sm font-medium">Secondary</p>
            <p className="text-xs text-neutral-500">#A8E05F</p>
          </div>
          <div>
            <div className="h-20 rounded-lg bg-accent mb-2" />
            <p className="text-sm font-medium">Accent</p>
            <p className="text-xs text-neutral-500">#FF6B35</p>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-4">Semantic</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="h-20 rounded-lg bg-success mb-2" />
            <p className="text-sm font-medium">Success</p>
          </div>
          <div>
            <div className="h-20 rounded-lg bg-error mb-2" />
            <p className="text-sm font-medium">Error</p>
          </div>
          <div>
            <div className="h-20 rounded-lg bg-warning mb-2" />
            <p className="text-sm font-medium">Warning</p>
          </div>
          <div>
            <div className="h-20 rounded-lg bg-info mb-2" />
            <p className="text-sm font-medium">Info</p>
          </div>
        </div>
      </section>
      
      {/* Typography */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Tipografía</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <p className="text-sm text-neutral-500">text-4xl font-bold</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Heading 2</h2>
            <p className="text-sm text-neutral-500">text-3xl font-bold</p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold">Heading 3</h3>
            <p className="text-sm text-neutral-500">text-2xl font-semibold</p>
          </div>
          <div>
            <p className="text-base">Body text regular</p>
            <p className="text-sm text-neutral-500">text-base</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600">Small text</p>
            <p className="text-sm text-neutral-500">text-sm</p>
          </div>
        </div>
      </section>
      
      {/* Buttons */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Botones</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>
      
      {/* Badges */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Status Badges</h2>
        <div className="flex flex-wrap gap-4">
          <StatusBadge status="active">Activo</StatusBadge>
          <StatusBadge status="pending">Pendiente</StatusBadge>
          <StatusBadge status="completed">Completado</StatusBadge>
          <StatusBadge status="cancelled">Cancelado</StatusBadge>
          <StatusBadge status="suspended">Suspendido</StatusBadge>
          <StatusBadge status="verified">Verificado</StatusBadge>
        </div>
      </section>
      
      {/* KPI Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">KPI Cards</h2>
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
            variant="success"
          />
          <KPICard
            title="Tasa Conversión"
            value="67.3%"
            icon={TrendingUp}
            trend={{ value: -3.2, isPositive: false }}
          />
          <KPICard
            title="Reportes Pendientes"
            value="12"
            icon={AlertCircle}
            variant="warning"
          />
        </div>
      </section>
      
      {/* Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card content goes here.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Another Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>More card content.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
```

---

### Fase 5: Refactorización de Páginas (3-4 días)
**Prioridad: 🟠 ALTA**

#### 5.1 Actualizar Dashboard

Refactorizar `src/app/dashboard/page.tsx` para usar nuevos componentes:

```typescript
// Reemplazar cards manuales por KPICard
// Usar StatusBadge en lugar de estilos inline
// Aplicar PageHeader
// Usar DataTable para actividad reciente
```

#### 5.2 Actualizar Gestión de Usuarios

```typescript
// Usar StatusBadge para estados
// Aplicar DataTable con filtros
// Usar EmptyState cuando no hay usuarios
```

#### 5.3 Actualizar Resto de Páginas

- Rides
- Reports
- Leads
- Search Analytics

---

### Fase 6: Testing y Accesibilidad (2 días)
**Prioridad: 🟡 MEDIA**

#### 6.1 Auditoría de Accesibilidad

```bash
# Instalar herramientas
npm install -D axe-core @axe-core/react
npm install -D eslint-plugin-jsx-a11y
```

**Tareas:**
- [ ] Ejecutar Lighthouse en cada página
- [ ] Verificar contraste de colores
- [ ] Test de navegación por teclado
- [ ] Test con screen reader

#### 6.2 Testing Manual

**Checklist:**
- [ ] Responsividad en mobile (375px)
- [ ] Responsividad en tablet (768px)
- [ ] Responsividad en desktop (1920px)
- [ ] Dark mode (si aplica)
- [ ] Estados hover/focus/active
- [ ] Loading states
- [ ] Error states

---

### Fase 7: Performance y Optimización (1-2 días)
**Prioridad: 🟢 BAJA**

#### 7.1 Optimización de CSS

```bash
# Purge unused CSS
npm install -D @fullhuman/postcss-purgecss
```

#### 7.2 Code Splitting

- Lazy load de componentes pesados
- Dynamic imports para rutas

#### 7.3 Métricas

**Objetivos:**
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Total Blocking Time < 300ms
- Cumulative Layout Shift < 0.1

---

## 📦 Entregables

### Documentos

- [x] `PLAN_IMPLEMENTACION_DESIGN_SYSTEM.md` (este archivo)
- [ ] `docs/VISUAL_GUIDE.md`
- [ ] `docs/COMPONENT_INVENTORY.md`
- [ ] `docs/ACCESSIBILITY_CHECKLIST.md`

### Código

- [ ] Componentes UI actualizados
- [ ] Nuevos componentes custom (KPICard, StatusBadge, etc.)
- [ ] Páginas refactorizadas
- [ ] Tailwind config optimizado
- [ ] Tests de accesibilidad

### Herramientas

- [ ] Página `/design-system` para componentes
- [ ] Linters configurados
- [ ] Pre-commit hooks

---

## 🎯 Métricas de Éxito

### Consistencia Visual
- ✅ 0 colores hardcodeados en componentes
- ✅ 100% de componentes usan design tokens
- ✅ Espaciado consistente en todas las páginas

### Accesibilidad
- ✅ Lighthouse Score > 90 en accesibilidad
- ✅ Contraste AAA en textos principales
- ✅ Navegación por teclado completa

### Developer Experience
- ✅ Tiempo de onboarding reducido 50%
- ✅ Componentes reutilizables documentados
- ✅ Guía visual completa

---

## 🚀 Quick Start

### Para Desarrolladores

```bash
# 1. Ver design tokens
cat src/lib/design-tokens.ts

# 2. Ver catálogo de componentes
npm run dev
# Navegar a: http://localhost:3000/design-system

# 3. Usar un componente
import { KPICard } from '@/components/ui/kpi-card'

<KPICard
  title="Mi Métrica"
  value="1,234"
  trend={{ value: 12, isPositive: true }}
/>
```

### Reglas de Oro

1. **NUNCA hardcodear colores**: Siempre usar tokens
2. **Usar componentes existentes**: No reinventar la rueda
3. **Seguir la guía visual**: Consistencia > creatividad
4. **Pensar en accesibilidad**: Desde el inicio, no al final

---

## 📅 Timeline Estimado

| Fase | Duración | Prioridad |
|------|----------|-----------|
| 1. Auditoría y Limpieza | 1-2 días | 🔴 |
| 2. Consolidación Tokens | 2-3 días | 🔴 |
| 3. Biblioteca Componentes | 3-4 días | 🟠 |
| 4. Documentación Visual | 2-3 días | 🟡 |
| 5. Refactorización Páginas | 3-4 días | 🟠 |
| 6. Testing y Accesibilidad | 2 días | 🟡 |
| 7. Performance | 1-2 días | 🟢 |
| **TOTAL** | **14-20 días** | |

---

## 🔄 Mantenimiento Continuo

### Weekly
- Revisar PRs para cumplimiento de design system
- Actualizar componentes según feedback

### Monthly
- Auditoría de accesibilidad
- Review de métricas de performance
- Actualizar documentación

### Quarterly
- Evaluar nuevos componentes necesarios
- Revisar design tokens
- Actualizar guía visual

---

## 📚 Referencias

- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Design Tokens W3C](https://www.w3.org/community/design-tokens/)

---

**Última actualización:** 28 de noviembre de 2025
**Versión:** 1.0.0
**Autor:** GitHub Copilot

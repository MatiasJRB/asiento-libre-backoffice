# 📦 Inventario de Componentes - Asiento Libre Backoffice

**Última actualización:** 28 de noviembre de 2025

---

## 🎯 Estado Actual

### Componentes UI Base (shadcn/ui)

| Componente | Estado | Usa Tokens | Accesible | Notas |
|------------|--------|------------|-----------|-------|
| Button | 🟡 Revisar | ✅ Sí | ✅ Sí | Múltiples variantes, bien implementado |
| Card | ✅ OK | ✅ Sí | ✅ Sí | Estructura correcta |
| Dialog | 🟡 Revisar | ⚠️ Parcial | ✅ Sí | Verificar overlays |
| Select | 🟡 Revisar | ⚠️ Parcial | ⚠️ Mejorar | Focus states |
| Textarea | 🟡 Revisar | ⚠️ Parcial | ✅ Sí | - |

### Componentes Faltantes (shadcn/ui)

Componentes esenciales que deben instalarse:

```bash
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

---

## 🔧 Componentes Custom Existentes

### Layout Components

| Componente | Archivo | Estado | Acción Requerida |
|------------|---------|--------|------------------|
| DashboardLayout | `components/dashboard-layout.tsx` | 🟡 Revisar | Verificar espaciados, usar tokens de spacing |

### Feature Components

| Componente | Archivo | Estado | Acción Requerida |
|------------|---------|--------|------------------|
| ReportActions | `components/report-actions.tsx` | 🔴 Refactor | Usar StatusBadge, eliminar colores hardcodeados |
| RideActions | `components/ride-actions.tsx` | 🔴 Refactor | Usar StatusBadge, aplicar tokens |
| UserActions | `components/user-actions.tsx` | 🔴 Refactor | Usar StatusBadge, aplicar tokens |

---

## ✨ Componentes Custom a Crear

### 1. KPICard

**Archivo:** `src/components/ui/kpi-card.tsx`

**Props:**
```typescript
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
```

**Prioridad:** 🔴 Alta (usado en dashboard)

**Dependencias:** Card, tokens

---

### 2. StatusBadge

**Archivo:** `src/components/ui/status-badge.tsx`

**Props:**
```typescript
interface StatusBadgeProps {
  status: 'active' | 'pending' | 'cancelled' | 'completed' | 'suspended' | 'verified'
  children: React.ReactNode
  dot?: boolean
}
```

**Prioridad:** 🔴 Alta (usado en múltiples páginas)

**Dependencias:** Badge (shadcn), tokens

---

### 3. EmptyState

**Archivo:** `src/components/ui/empty-state.tsx`

**Props:**
```typescript
interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}
```

**Prioridad:** 🟡 Media

**Dependencias:** Button, lucide-react

---

### 4. DataTable

**Archivo:** `src/components/ui/data-table.tsx`

**Props:**
```typescript
interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  emptyMessage?: string
}
```

**Prioridad:** 🟠 Media-Alta

**Dependencias:** Table (shadcn), EmptyState

---

### 5. PageHeader

**Archivo:** `src/components/ui/page-header.tsx`

**Props:**
```typescript
interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline'
  }
}
```

**Prioridad:** 🟠 Media-Alta

**Dependencias:** Button, tokens

---

### 6. FilterBar

**Archivo:** `src/components/ui/filter-bar.tsx`

**Props:**
```typescript
interface FilterBarProps {
  filters: Filter[]
  onFilterChange: (filters: Record<string, any>) => void
}
```

**Prioridad:** 🟡 Media

**Dependencias:** Select, Input, Button

---

### 7. StatsCard

**Archivo:** `src/components/ui/stats-card.tsx`

**Props:**
```typescript
interface StatsCardProps {
  label: string
  value: string | number
  change?: {
    value: number
    period: string
  }
}
```

**Prioridad:** 🟡 Media

**Dependencias:** Card, tokens

---

### 8. UserAvatar

**Archivo:** `src/components/ui/user-avatar.tsx`

**Props:**
```typescript
interface UserAvatarProps {
  name: string
  imageUrl?: string
  size?: 'sm' | 'md' | 'lg'
  verified?: boolean
}
```

**Prioridad:** 🟢 Baja

**Dependencias:** Avatar (shadcn), Badge

---

## 📄 Páginas y su Estado

### Dashboard (`/dashboard`)

**Componentes usados:**
- Card (manual) → 🔴 Migrar a KPICard
- Grids → ✅ OK
- Layout → ✅ OK

**Refactorización necesaria:**
- [ ] Reemplazar cards manuales por KPICard
- [ ] Agregar PageHeader
- [ ] Usar StatusBadge para estados
- [ ] Aplicar DataTable para actividad reciente

---

### Users (`/users` y `/users/[id]`)

**Componentes usados:**
- Búsqueda custom → 🟡 Revisar
- Tabla manual → 🔴 Migrar a DataTable
- Badges inline → 🔴 Migrar a StatusBadge

**Refactorización necesaria:**
- [ ] Implementar FilterBar
- [ ] Usar DataTable
- [ ] StatusBadge para verificación/suspensión
- [ ] UserAvatar en listado
- [ ] EmptyState cuando no hay usuarios

---

### Rides (`/rides` y `/rides/[id]`)

**Componentes usados:**
- Filtros custom → 🟡 Migrar a FilterBar
- Cards manuales → ✅ OK
- Estados inline → 🔴 Migrar a StatusBadge

**Refactorización necesaria:**
- [ ] FilterBar para filtros de estado
- [ ] StatusBadge para estados de viaje
- [ ] EmptyState cuando no hay viajes

---

### Reports (`/reports`)

**Componentes usados:**
- Filtros custom → 🟡 Migrar a FilterBar
- Badges inline → 🔴 Migrar a StatusBadge
- Cards → ✅ OK

**Refactorización necesaria:**
- [ ] FilterBar para estado/severidad
- [ ] StatusBadge para estados
- [ ] EmptyState cuando no hay reportes

---

### Leads (`/leads`)

**Componentes usados:**
- Tabla básica → 🟡 Migrar a DataTable
- Cards de stats → 🟡 Migrar a StatsCard

**Refactorización necesaria:**
- [ ] DataTable para listado
- [ ] StatsCard para métricas
- [ ] StatusBadge para suscripción

---

### Search Analytics (`/search-analytics`)

**Componentes usados:**
- KPI cards manuales → 🔴 Migrar a KPICard
- Tabla básica → 🟡 Migrar a DataTable
- Filtros de fecha → ✅ OK

**Refactorización necesaria:**
- [ ] KPICard para métricas
- [ ] DataTable para rutas
- [ ] Gráficos (recharts) con tokens de colores

---

## 🎨 Patrones de Diseño Identificados

### 1. Patrón: Lista con Filtros

**Páginas:** Users, Rides, Reports, Leads

**Componentes necesarios:**
- FilterBar
- DataTable
- EmptyState
- PageHeader

**Estructura:**
```tsx
<PageHeader title="..." action={...} />
<FilterBar filters={...} />
<DataTable data={...} columns={...} />
```

---

### 2. Patrón: Dashboard de Métricas

**Páginas:** Dashboard, Search Analytics

**Componentes necesarios:**
- KPICard
- StatsCard
- Grid layout

**Estructura:**
```tsx
<PageHeader title="..." />
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <KPICard ... />
  <KPICard ... />
</div>
```

---

### 3. Patrón: Detalle de Entidad

**Páginas:** Users/[id], Rides/[id], Reports/[id]

**Componentes necesarios:**
- Card
- StatusBadge
- UserAvatar
- Tabs (futuro)

**Estructura:**
```tsx
<PageHeader title="..." action={...} />
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <Card><!-- Info principal --></Card>
  <Card><!-- Info secundaria --></Card>
</div>
```

---

## 📊 Métricas de Progreso

### Componentes

- ✅ **Base instalados:** 5/20 (25%)
- 🔴 **Custom creados:** 0/8 (0%)
- 🟡 **Páginas refactorizadas:** 0/7 (0%)

### Tokens

- ✅ **Tokens definidos:** 100%
- 🟡 **Aplicación en componentes:** ~40%
- 🔴 **Colores hardcodeados eliminados:** 0%

### Accesibilidad

- ⚠️ **Contraste verificado:** No auditado
- ⚠️ **Navegación teclado:** Parcial
- ⚠️ **Screen reader:** No testeado

---

## 🚀 Roadmap de Implementación

### Sprint 1 - Fundamentos (Semana 1)
- [ ] Instalar componentes shadcn faltantes
- [ ] Crear KPICard
- [ ] Crear StatusBadge
- [ ] Refactorizar Dashboard

### Sprint 2 - Componentes Core (Semana 2)
- [ ] Crear DataTable
- [ ] Crear PageHeader
- [ ] Crear EmptyState
- [ ] Refactorizar Users page

### Sprint 3 - Refinamiento (Semana 3)
- [ ] Crear FilterBar
- [ ] Crear StatsCard
- [ ] Refactorizar Rides, Reports, Leads
- [ ] Refactorizar Search Analytics

### Sprint 4 - Polish (Semana 4)
- [ ] Crear UserAvatar
- [ ] Auditoría de accesibilidad
- [ ] Testing responsivo
- [ ] Documentación final

---

## 🔍 Notas de Auditoría

### Colores Hardcodeados Detectados

```bash
# Comando para buscar:
grep -r "bg-\[#" src/ --include="*.tsx"
grep -r "text-\[#" src/ --include="*.tsx"
grep -r "border-\[#" src/ --include="*.tsx"
```

**Archivos a revisar:**
- (Ejecutar auditoría)

### Espaciados No Estandarizados

```bash
# Comando para buscar:
grep -r "p-\[" src/ --include="*.tsx"
grep -r "m-\[" src/ --include="*.tsx"
```

**Archivos a revisar:**
- (Ejecutar auditoría)

---

## 📝 Changelog

### v1.0.0 - 2025-11-28
- Inventario inicial de componentes
- Identificación de patrones
- Roadmap definido

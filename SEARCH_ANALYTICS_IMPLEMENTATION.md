# 📊 Plan de Implementación: Analíticas de Búsqueda en Backoffice

## 🎯 Objetivo

Implementar una nueva sección en el backoffice para visualizar y analizar las búsquedas de viajes que hacen los usuarios, incluyendo:
- Métricas de búsquedas totales
- Rutas más buscadas
- Tasa de conversión (búsqueda → solicitud de reserva)
- Demanda insatisfecha (búsquedas sin resultados)
- Tendencias temporales

## 📋 Contexto Técnico

### Base de Datos
Ya existe la tabla `search_logs` con la siguiente estructura:

```sql
search_logs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  origin_city text NOT NULL,          -- Ciudad normalizada (ej: "Buenos Aires")
  origin_lat numeric NOT NULL,
  origin_lng numeric NOT NULL,
  origin_text text NOT NULL,          -- Texto completo ingresado
  dest_city text NOT NULL,            -- Ciudad normalizada (ej: "Mar del Plata")
  dest_lat numeric NOT NULL,
  dest_lng numeric NOT NULL,
  dest_text text NOT NULL,            -- Texto completo ingresado
  search_date date NOT NULL,          -- Fecha del viaje buscado
  passengers integer NOT NULL,
  results_found integer NOT NULL DEFAULT 0,
  has_results boolean GENERATED AS (results_found > 0) STORED,
  converted_to_request_id uuid REFERENCES ride_requests(id),
  did_convert boolean GENERATED AS (converted_to_request_id IS NOT NULL) STORED,
  converted_at timestamp,
  created_at timestamp DEFAULT now()
)
```

### Índices Optimizados
- `idx_search_logs_cities` - Para queries por origen/destino
- `idx_search_logs_date` - Para filtros temporales
- `idx_search_logs_user` - Para análisis por usuario
- `idx_search_logs_conversion` - Para métricas de conversión

### RLS Policies
- Admins pueden ver todos los logs
- Usuarios regulares solo ven sus propias búsquedas

## 🏗️ Arquitectura del Backoffice

**Stack Actual:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (con Service Role para bypass de RLS)

**Estructura de Carpetas:**
```
src/
├── app/
│   ├── dashboard/              # Dashboard principal
│   ├── users/                  # Gestión de usuarios
│   ├── rides/                  # Gestión de viajes
│   ├── reports/                # Reportes de usuarios
│   ├── leads/                  # Leads de landing
│   └── search-analytics/       # 🆕 NUEVA SECCIÓN
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── dashboard-layout.tsx    # Layout con sidebar
└── lib/
    ├── supabase/
    │   └── admin.ts           # Cliente con Service Role
    └── types/database.ts      # Tipos de Supabase
```

## 📝 Plan de Implementación

### 🎯 Fase 1: Página Principal de Analytics (ALTA PRIORIDAD)

**Archivo:** `src/app/search-analytics/page.tsx`

**Componentes a Crear:**

1. **KPIs Principales** (Cards superiores)
   - Total de búsquedas (últimos 30 días)
   - Búsquedas sin resultados (%)
   - Tasa de conversión (búsqueda → solicitud) (%)
   - Usuarios únicos que buscaron

2. **Top 10 Rutas Más Buscadas** (Tabla)
   - Origen → Destino
   - Cantidad de búsquedas
   - % con resultados
   - % de conversión

3. **Demanda Insatisfecha** (Tabla)
   - Rutas buscadas SIN resultados
   - Cantidad de búsquedas fallidas
   - Última búsqueda fallida

4. **Filtros**
   - Rango de fechas (últimos 7, 30, 90 días)
   - Filtrar por: todas las búsquedas / con resultados / sin resultados / convertidas

**Queries SQL Necesarias:**

```typescript
// KPIs
const getSearchKPIs = async (days = 30) => {
  const { data } = await adminClient
    .from('search_logs')
    .select('*')
    .gte('created_at', `now() - interval '${days} days'`);
  
  return {
    totalSearches: data.length,
    searchesWithoutResults: data.filter(s => !s.has_results).length,
    convertedSearches: data.filter(s => s.did_convert).length,
    uniqueUsers: new Set(data.map(s => s.user_id)).size,
  };
};

// Top Routes
const getTopRoutes = async (limit = 10, days = 30) => {
  const { data } = await adminClient.rpc('get_top_search_routes', {
    p_days: days,
    p_limit: limit
  });
  return data;
};

// Unsatisfied Demand
const getUnsatisfiedDemand = async (limit = 10, days = 30) => {
  const { data } = await adminClient.rpc('get_unsatisfied_demand', {
    p_days: days,
    p_limit: limit
  });
  return data;
};
```

**Funciones SQL a Crear en Supabase:**

```sql
-- Función 1: Top rutas más buscadas
CREATE OR REPLACE FUNCTION get_top_search_routes(p_days int DEFAULT 30, p_limit int DEFAULT 10)
RETURNS TABLE (
  origin_city text,
  dest_city text,
  search_count bigint,
  results_rate numeric,
  conversion_rate numeric,
  avg_passengers numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sl.origin_city,
    sl.dest_city,
    COUNT(*) as search_count,
    ROUND(100.0 * SUM(CASE WHEN sl.has_results THEN 1 ELSE 0 END) / COUNT(*), 2) as results_rate,
    ROUND(100.0 * SUM(CASE WHEN sl.did_convert THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate,
    ROUND(AVG(sl.passengers), 1) as avg_passengers
  FROM search_logs sl
  WHERE sl.created_at >= NOW() - (p_days || ' days')::interval
  GROUP BY sl.origin_city, sl.dest_city
  ORDER BY search_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función 2: Demanda insatisfecha
CREATE OR REPLACE FUNCTION get_unsatisfied_demand(p_days int DEFAULT 30, p_limit int DEFAULT 10)
RETURNS TABLE (
  origin_city text,
  dest_city text,
  failed_searches bigint,
  last_search_date timestamp,
  avg_passengers numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sl.origin_city,
    sl.dest_city,
    COUNT(*) as failed_searches,
    MAX(sl.created_at) as last_search_date,
    ROUND(AVG(sl.passengers), 1) as avg_passengers
  FROM search_logs sl
  WHERE sl.created_at >= NOW() - (p_days || ' days')::interval
    AND sl.has_results = false
  GROUP BY sl.origin_city, sl.dest_city
  ORDER BY failed_searches DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 📊 Fase 2: Gráficos y Visualizaciones (MEDIA PRIORIDAD)

**Dependencia a Instalar:**
```bash
npm install recharts
```

**Gráficos a Agregar:**

1. **Gráfico de Líneas: Búsquedas por Día (últimos 30 días)**
   - Query: `GROUP BY DATE(created_at)`
   - Muestra tendencia temporal

2. **Gráfico de Barras: Conversión vs No Conversión**
   - Compara búsquedas convertidas vs no convertidas
   - Por rango de fechas

3. **Gráfico de Torta: Distribución de Resultados**
   - Con resultados
   - Sin resultados
   - Convertidas

**Componente de Ejemplo:**

```typescript
// components/search-analytics/searches-chart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { date: string; searches: number }[];
}

export function SearchesChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="searches" stroke="#3B82F6" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### 🔍 Fase 3: Página de Detalle por Ruta (BAJA PRIORIDAD)

**Archivo:** `src/app/search-analytics/routes/[origin]/[destination]/page.tsx`

**Funcionalidad:**
- Click en una ruta de la tabla → ver detalle
- Muestra:
  - Gráfico temporal de búsquedas para esa ruta
  - Lista de usuarios que buscaron (con fechas)
  - Viajes publicados en esa ruta (para correlacionar oferta/demanda)
  - Recomendaciones: "Deberías promover esta ruta"

### 📥 Fase 4: Exportación de Datos (BAJA PRIORIDAD)

**Botón de Exportar a CSV:**

```typescript
// lib/export-csv.ts
export function exportSearchLogsToCSV(data: SearchLog[]) {
  const headers = ['Fecha', 'Origen', 'Destino', 'Pasajeros', 'Resultados', 'Convertida'];
  const rows = data.map(log => [
    new Date(log.created_at).toLocaleDateString(),
    log.origin_city,
    log.dest_city,
    log.passengers,
    log.has_results ? 'Sí' : 'No',
    log.did_convert ? 'Sí' : 'No'
  ]);
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `search-logs-${new Date().toISOString()}.csv`;
  a.click();
}
```

## 🛠️ Checklist de Implementación

### ✅ Pre-requisitos (YA HECHO)
- [x] Tabla `search_logs` creada
- [x] Función `logSearch()` implementada en app
- [x] Función `markSearchAsConverted()` implementada
- [x] Tracking funcionando en producción

### 📝 Tareas Backoffice

#### 1️⃣ Setup Inicial
- [ ] Crear directorio `src/app/search-analytics/`
- [ ] Agregar link en el sidebar del backoffice
- [ ] Actualizar tipos de TypeScript con tabla `search_logs`

#### 2️⃣ Base de Datos
- [ ] Crear función SQL `get_top_search_routes()`
- [ ] Crear función SQL `get_unsatisfied_demand()`
- [ ] Verificar RLS policies (admins deben ver todo)
- [ ] Probar queries desde SQL Editor

#### 3️⃣ Página Principal
- [ ] Crear `page.tsx` con layout base
- [ ] Implementar KPIs cards
- [ ] Tabla de top rutas
- [ ] Tabla de demanda insatisfecha
- [ ] Filtros de fecha

#### 4️⃣ Visualizaciones (Opcional)
- [ ] Instalar `recharts`
- [ ] Gráfico de líneas (búsquedas por día)
- [ ] Gráfico de barras (conversión)
- [ ] Gráfico de torta (distribución)

#### 5️⃣ Exportación (Opcional)
- [ ] Botón "Exportar CSV"
- [ ] Función de generación de CSV
- [ ] Filtrar data antes de exportar

## 📚 Recursos de Referencia

### Queries SQL Completas
Ver archivo: `docs/SEARCH_ANALYTICS_QUERIES.md` (ya creado en asiento-libre)

### Componentes shadcn/ui a Usar
```bash
# Si no están instalados
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add select
npx shadcn@latest add button
```

### Estructura de Ejemplo de Card

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SearchKPICard({ title, value, description }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
```

## 🎨 Diseño Visual Propuesto

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Analíticas de Búsqueda                  🔽 Últimos 30 días│
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  1,234   │  │   18.5%  │  │   12.3%  │  │   487    │   │
│  │ Búsquedas│  │Sin Result│  │Conversión│  │ Usuarios │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────┤
│ 📈 Gráfico: Búsquedas por Día                               │
│  [Gráfico de líneas aquí]                                   │
├─────────────────────────────────────────────────────────────┤
│ 🔥 Top 10 Rutas Más Buscadas                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Origen → Destino        │ Búsquedas │ % Res │ % Conv ││  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ Buenos Aires → Mar del  │    142    │  78%  │  15%   ││  │
│  │ Córdoba → Buenos Aires  │    98     │  92%  │  22%   ││  │
│  │ ...                                                   ││  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│ ⚠️  Demanda Insatisfecha                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Origen → Destino        │ Búsquedas │ Última Búsqueda││  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ Bahía Blanca → Neuquén  │     24    │ 2024-11-27     ││  │
│  │ Mendoza → San Juan      │     18    │ 2024-11-26     ││  │
│  │ ...                                                   ││  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Próximos Pasos Recomendados

1. **Fase 1 (2-3 horas):** Implementar página básica con KPIs y tablas
2. **Fase 2 (1-2 horas):** Agregar gráficos con recharts
3. **Fase 3 (1 hora):** Exportación CSV
4. **Fase 4 (opcional):** Página de detalle por ruta

## 💡 Ideas Adicionales

- **Alertas Automáticas:** "Nueva ruta con +10 búsquedas sin resultados"
- **Notificaciones Push:** Avisar a conductores de rutas muy demandadas
- **A/B Testing:** Comparar efectividad de diferentes UIs de búsqueda
- **Machine Learning:** Predecir demanda futura por ruta

## 📞 Contacto con App Principal

**Conexión con App:**
- La app ya está logueando todas las búsquedas
- No requiere cambios en el código de la app
- Solo consumir datos desde el backoffice

**Verificar Funcionamiento:**
```sql
-- En Supabase SQL Editor
SELECT COUNT(*) FROM search_logs; -- Debe tener registros
SELECT * FROM search_logs ORDER BY created_at DESC LIMIT 10; -- Ver últimas búsquedas
```

---

**Tiempo Estimado Total:** 4-6 horas de desarrollo

**Complejidad:** Media (similar a las páginas existentes del backoffice)

**Valor de Negocio:** ALTO - permite identificar oportunidades de crecimiento y mejorar la oferta

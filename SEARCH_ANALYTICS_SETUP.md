# 🚀 Setup: Search Analytics Implementation

## ✅ Implementación Completa

Se ha implementado exitosamente la funcionalidad de **Analíticas de Búsqueda** en el backoffice.

## 📦 Archivos Creados

### 1. Base de Datos
- `supabase-migrations/search_analytics_functions.sql` - Funciones SQL para Supabase

### 2. Backend
- `src/app/search-analytics/page.tsx` - Página principal
- `src/app/search-analytics/actions.ts` - Server actions
- `src/app/search-analytics/components/SearchAnalyticsContent.tsx` - Componente principal

### 3. Tipos y Configuración
- `src/lib/types/database.ts` - Tipos TypeScript actualizados
- `src/components/dashboard-layout.tsx` - Sidebar actualizado

## 🔧 Pasos para Activar la Funcionalidad

### 1️⃣ Ejecutar Funciones SQL en Supabase

1. Abre tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `supabase-migrations/search_analytics_functions.sql`
4. Ejecuta el script (Run)

Esto creará las siguientes funciones:
- `get_top_search_routes(p_days, p_limit)` - Rutas más buscadas
- `get_unsatisfied_demand(p_days, p_limit)` - Demanda insatisfecha
- `get_searches_by_day(p_days)` - Búsquedas por día

### 2️⃣ Verificar que la tabla search_logs existe

```sql
SELECT COUNT(*) FROM search_logs;
```

Si la tabla no existe, debes crearla primero con la estructura mencionada en el documento de implementación.

### 3️⃣ Verificar Políticas RLS

Asegúrate de que los administradores puedan ver todos los registros:

```sql
-- Verificar policies existentes
SELECT * FROM pg_policies WHERE tablename = 'search_logs';

-- Si no existe, crear policy para admins
CREATE POLICY "Admins can view all search logs"
ON search_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);
```

### 4️⃣ Instalar Dependencias (si es necesario)

Verifica que tengas todas las dependencias de shadcn/ui:

```bash
# Si no están instalados
npx shadcn@latest add card
npx shadcn@latest add select
```

### 5️⃣ Reiniciar el Servidor de Desarrollo

```bash
npm run dev
```

### 6️⃣ Acceder a la Nueva Sección

Navega a: `http://localhost:3000/search-analytics`

O haz click en **"Analíticas"** en el sidebar del backoffice.

## 🎯 Funcionalidades Implementadas

### ✅ Fase 1 (Completada)
- [x] KPIs principales (4 cards)
  - Total de búsquedas
  - % sin resultados
  - % de conversión
  - Usuarios únicos
- [x] Top 10 rutas más buscadas
  - Origen → Destino
  - Cantidad de búsquedas
  - % con resultados (color-coded)
  - % de conversión (color-coded)
  - Pasajeros promedio
- [x] Demanda insatisfecha (búsquedas sin resultados)
  - Rutas sin resultados
  - Cantidad de búsquedas fallidas
  - Última búsqueda
- [x] Filtros por período (7, 30, 90 días)
- [x] Link en sidebar

### 📊 KPIs Implementados

1. **Total Búsquedas**: Cantidad total de búsquedas en el período
2. **Sin Resultados**: % de búsquedas que no encontraron viajes disponibles
3. **Tasa de Conversión**: % de búsquedas que resultaron en una solicitud de reserva
4. **Usuarios Únicos**: Cantidad de usuarios diferentes que realizaron búsquedas

### 🎨 Características del UI

- **Color Coding**:
  - Verde: Buen rendimiento (>80% resultados, >15% conversión)
  - Amarillo: Rendimiento medio (50-80% resultados, 8-15% conversión)
  - Rojo: Necesita atención (<50% resultados)

- **Responsive**: Funciona en desktop, tablet y móvil
- **Loading States**: Skeleton loaders mientras carga
- **Error Handling**: Manejo de errores con console.log

## 🔍 Próximas Mejoras (Opcionales)

### Fase 2: Visualizaciones con Gráficos
```bash
npm install recharts
```

Agregar:
- Gráfico de líneas: búsquedas por día
- Gráfico de barras: conversión vs no conversión
- Gráfico de torta: distribución de resultados

### Fase 3: Exportación CSV
Botón para exportar datos a Excel/CSV

### Fase 4: Página de Detalle por Ruta
Click en una ruta → ver detalles específicos

## 🐛 Troubleshooting

### Error: "Cannot find module '../actions'"
- Reinicia el servidor TypeScript en VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
- O reinicia VS Code

### Error: "function get_top_search_routes does not exist"
- Ejecuta el SQL en Supabase SQL Editor

### Error: "permission denied for table search_logs"
- Verifica las RLS policies para admins

### No aparecen datos
- Verifica que la app esté logueando búsquedas
- Ejecuta: `SELECT COUNT(*) FROM search_logs` en Supabase

## 📞 Soporte

Si tienes problemas:
1. Verifica que las funciones SQL estén creadas
2. Verifica que el usuario tenga rol de admin
3. Revisa la consola del navegador (F12) para errores
4. Revisa los logs del servidor Next.js

## ✨ ¡Listo!

Tu backoffice ahora tiene una sección completa de analíticas de búsqueda que te permitirá:
- Identificar rutas populares
- Detectar demanda insatisfecha
- Medir conversión de búsquedas a reservas
- Tomar decisiones basadas en datos

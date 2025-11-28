# Plan de Implementación: Administración de Rutas y Ciudades

**Proyecto:** Asiento Libre - Backoffice  
**Fecha:** Noviembre 2025  
**Objetivo:** Implementar interfaz administrativa para gestionar rutas y ciudades de cobertura

---

## 📋 Contexto

La aplicación móvil de Asiento Libre migró de un archivo JSON estático (`route-matrix.json`) a tablas dinámicas en Supabase para gestionar las rutas y ciudades. Este documento detalla cómo implementar las interfaces administrativas en el backoffice para gestionar estos datos.

### Estado Actual en Producción

**Base de Datos (Supabase):**
- ✅ Tabla `routes` (9 rutas activas)
- ✅ Tabla `coverage_cities` (67 ciudades)
- ✅ RLS policies configuradas (solo admins pueden escribir)
- ✅ Indexes de performance y fuzzy search
- ✅ Triggers para PostGIS automático

**Frontend Mobile:**
- ✅ Migración completada de JSON → Supabase
- ✅ Cache de 5 minutos implementado
- ✅ Función `invalidateCache()` lista para backoffice

---

## 🎯 Alcance del MVP

### Funcionalidades Core

#### 1. Gestión de Rutas (`/admin/routes`)
- **Listar todas las rutas** con estado (activa/inactiva)
- **Crear nueva ruta** con validaciones
- **Editar ruta existente** (nombre, descripción, orden)
- **Activar/Desactivar ruta** (toggle)
- **Eliminar ruta** (con confirmación y verificación de ciudades asociadas)

#### 2. Gestión de Ciudades (`/admin/cities`)
- **Listar ciudades** con filtros por ruta
- **Crear nueva ciudad** con coordenadas y jerarquía
- **Editar ciudad existente**
- **Cambiar ruta de una ciudad**
- **Activar/Desactivar ciudad**
- **Eliminar ciudad** (con confirmación)

#### 3. Visualización Avanzada
- **Vista de mapa** con ciudades georeferenciadas
- **Diagrama de rutas** mostrando jerarquías (0, 1, 2)
- **Búsqueda fuzzy** de ciudades (usando pg_trgm)
- **Estadísticas de cobertura** por ruta

---

## 🗄️ Modelo de Datos

### Tabla: `routes`

```sql
CREATE TABLE routes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Campos clave:**
- `name`: "Ruta 3 Sur", "Ruta 22 Valle", etc.
- `display_order`: Orden de visualización en app móvil
- `is_active`: Si aparece en la app (soft delete)

### Tabla: `coverage_cities`

```sql
CREATE TABLE coverage_cities (
  id SERIAL PRIMARY KEY,
  route_id INTEGER REFERENCES routes(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  location GEOGRAPHY(POINT, 4326), -- Auto-generado por trigger
  hierarchy INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_city_per_route UNIQUE(route_id, name)
);
```

**Campos clave:**
- `hierarchy`: 0 = Principal, 1 = Intermedia, 2 = Secundaria
- `location`: PostGIS point (auto-generado desde lat/lng)
- `route_id`: FK con restricción ON DELETE RESTRICT

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

```
Next.js 14+
├── App Router (/app/admin/routes, /app/admin/cities)
├── Server Components (fetch directo desde Supabase)
├── Client Components (formularios con validación)
└── Server Actions (mutaciones con revalidatePath)

UI Layer
├── shadcn/ui (Button, Table, Dialog, Form)
├── React Hook Form + Zod (validaciones)
├── Leaflet / Mapbox (visualización de mapas)
└── Recharts (gráficos de cobertura)

Data Layer
├── Supabase Client (queries + RLS)
├── Server Actions (create, update, delete)
└── Revalidation (invalidateCache en mobile)
```

### Estructura de Carpetas

```
src/
├── app/
│   └── admin/
│       ├── routes/
│       │   ├── page.tsx              # Lista de rutas
│       │   ├── new/page.tsx          # Crear ruta
│       │   └── [id]/edit/page.tsx    # Editar ruta
│       └── cities/
│           ├── page.tsx              # Lista de ciudades
│           ├── new/page.tsx          # Crear ciudad
│           └── [id]/edit/page.tsx    # Editar ciudad
│
├── components/
│   └── admin/
│       ├── routes/
│       │   ├── RouteTable.tsx
│       │   ├── RouteForm.tsx
│       │   └── RouteDeleteDialog.tsx
│       └── cities/
│           ├── CityTable.tsx
│           ├── CityForm.tsx
│           ├── CityMapView.tsx
│           └── CityHierarchyBadge.tsx
│
├── lib/
│   ├── actions/
│   │   ├── routes.ts                 # Server Actions para routes
│   │   └── cities.ts                 # Server Actions para cities
│   ├── validations/
│   │   ├── route.schema.ts           # Zod schemas
│   │   └── city.schema.ts
│   └── utils/
│       └── geocoding.ts              # Helpers para coords
│
└── types/
    └── admin.ts                      # TypeScript types
```

---

## 📝 Especificaciones de UI

### Página: Listado de Rutas (`/admin/routes`)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Rutas                              [+ Nueva Ruta]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Nombre  │ Descripción │ Ciudades │ Estado  │   │
│ ├─────────────────────────────────────────────┤   │
│ │ Ruta 3  │ BS AS - CR  │    12    │ ●Activa │   │
│ │ Ruta 22 │ NEU - BRC   │     8    │ ●Activa │   │
│ │ ...                                          │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Acciones por fila:                                 │
│ - Ver ciudades (→ /admin/cities?route=X)           │
│ - Editar                                           │
│ - Toggle activo/inactivo                           │
│ - Eliminar (solo si no tiene ciudades)             │
└─────────────────────────────────────────────────────┘
```

**Validaciones:**
- ❌ No se puede eliminar ruta con ciudades asociadas
- ⚠️ Confirmación al desactivar (afecta app móvil)
- ✅ Orden de visualización editable (drag & drop opcional)

---

### Página: Formulario de Ciudad (`/admin/cities/new`)

**Campos:**

1. **Ruta** (select)
   - Validación: requerido
   - Opciones: Solo rutas activas

2. **Nombre de Ciudad** (text)
   - Validación: requerido, único por ruta
   - Autocomplete: Sugerencias de Google Places API (opcional)

3. **Coordenadas** (number inputs)
   - Latitud: -90 a 90
   - Longitud: -180 a 180
   - Botón: "Obtener desde mapa" (modal con Leaflet)

4. **Jerarquía** (radio buttons)
   - ○ Principal (0) - Ciudades grandes, puntos clave
   - ○ Intermedia (1) - Ciudades medianas, paradas frecuentes
   - ○ Secundaria (2) - Pueblos pequeños, paradas opcionales

5. **Estado** (toggle)
   - Activa / Inactiva

**Vista Previa:**
- Mapa pequeño mostrando la ubicación
- Lista de ciudades cercanas (radio 50km)

---

### Componente: Mapa Interactivo

**Librería:** Leaflet (gratis) o Mapbox (mejor UX)

**Funcionalidades:**
```tsx
<CityMapView 
  cities={cities}
  selectedRoute={routeId}
  onCityClick={(city) => navigate(`/admin/cities/${city.id}`)}
  mode="view" // o "edit" para drag markers
/>
```

**Features:**
- Markers con colores por jerarquía (0=rojo, 1=amarillo, 2=verde)
- Líneas conectando ciudades de una misma ruta
- Cluster de markers cuando hay zoom out
- Info popup al hacer click (nombre, ruta, coordenadas)

---

## 🔐 Seguridad y Permisos

### Row Level Security (RLS)

**Políticas Actuales:**
```sql
-- Lectura pública (app móvil)
CREATE POLICY "public_read_routes" ON routes
  FOR SELECT USING (is_active = true);

CREATE POLICY "public_read_cities" ON coverage_cities
  FOR SELECT USING (is_active = true);

-- Escritura solo admins
CREATE POLICY "admin_write_routes" ON routes
  FOR ALL USING (auth.role() = 'authenticated' AND is_admin());

CREATE POLICY "admin_write_cities" ON coverage_cities
  FOR ALL USING (auth.role() = 'authenticated' AND is_admin());
```

**Backoffice:**
- Usar service role key para bypass RLS (backend only)
- O implementar función `is_admin()` en Supabase

### Validación de Permisos en Backoffice

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.user_metadata.role !== 'admin') {
    return NextResponse.redirect('/login');
  }
}

export const config = {
  matcher: '/admin/:path*',
};
```

---

## 🔄 Sincronización con Mobile App

### Problema: Cache en Mobile

La app móvil cachea rutas/ciudades por 5 minutos. Cuando el admin edita datos en backoffice, deben reflejarse en la app.

### Solución: Invalidación Manual

**Botón en Backoffice:**
```tsx
<Button onClick={async () => {
  await fetch('/api/invalidate-mobile-cache', { method: 'POST' });
  toast.success('Cache invalidado en todas las apps móviles');
}}>
  🔄 Forzar Actualización en Apps
</Button>
```

**API Route:**
```typescript
// app/api/invalidate-mobile-cache/route.ts
export async function POST() {
  // Opción 1: Endpoint en app móvil (si tiene server)
  await fetch('https://api.asientolibre.com/cache/invalidate', {
    method: 'POST',
    headers: { 'X-Admin-Secret': process.env.ADMIN_SECRET }
  });
  
  // Opción 2: Notificación push a todas las apps
  await sendPushNotification({
    type: 'CACHE_INVALIDATE',
    table: 'routes'
  });
  
  return NextResponse.json({ success: true });
}
```

**Alternativa: TTL Dinámico**
- Almacenar `last_update` en tabla `routes` / `coverage_cities`
- Mobile app compara timestamp local vs server
- Invalida cache si hay diferencia

---

## 📊 Queries y Performance

### Queries Optimizadas

**Listar rutas con conteo de ciudades:**
```sql
SELECT 
  r.*,
  COUNT(c.id) as city_count,
  COUNT(c.id) FILTER (WHERE c.is_active = true) as active_cities
FROM routes r
LEFT JOIN coverage_cities c ON r.id = c.route_id
GROUP BY r.id
ORDER BY r.display_order;
```

**Búsqueda fuzzy de ciudades:**
```sql
SELECT * FROM coverage_cities
WHERE name ILIKE '%bahia%' -- Búsqueda simple
  OR name % 'bahia blanca'; -- Fuzzy con pg_trgm

-- Index requerido:
CREATE INDEX idx_cities_name_trgm ON coverage_cities USING gin(name gin_trgm_ops);
```

**Ciudades cercanas a un punto:**
```sql
SELECT 
  name,
  ST_Distance(location::geography, ST_Point(-62.2663, -38.7183)::geography) as distance_m
FROM coverage_cities
WHERE ST_DWithin(
  location::geography,
  ST_Point(-62.2663, -38.7183)::geography,
  50000 -- 50km radio
)
ORDER BY distance_m;
```

---

## 🧪 Plan de Testing

### Tests Unitarios (Vitest)

```typescript
// lib/validations/city.schema.test.ts
describe('citySchema', () => {
  it('valida coordenadas dentro de rango', () => {
    expect(() => citySchema.parse({
      latitude: 91, // Inválido
      longitude: 0
    })).toThrow();
  });
});
```

### Tests de Integración

```typescript
// app/admin/routes/__tests__/create.test.tsx
it('crea ruta y aparece en listado', async () => {
  await createRoute({ name: 'Ruta Test' });
  const routes = await getRoutes();
  expect(routes).toContainEqual(expect.objectContaining({
    name: 'Ruta Test'
  }));
});
```

### Tests E2E (Playwright)

```typescript
test('admin puede crear ciudad desde mapa', async ({ page }) => {
  await page.goto('/admin/cities/new');
  await page.click('[data-testid="map-picker"]');
  await page.click('.leaflet-map', { position: { x: 100, y: 100 } });
  await page.fill('[name="name"]', 'Nueva Ciudad');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.toast-success')).toBeVisible();
});
```

---

## 📅 Cronograma de Implementación

### Fase 1: Setup Básico (2-3 días)
- [ ] Crear rutas `/admin/routes` y `/admin/cities`
- [ ] Implementar schemas de validación (Zod)
- [ ] Setup Supabase client con RLS bypass
- [ ] Crear componentes base (Table, Form)

### Fase 2: CRUD de Rutas (2 días)
- [ ] Listar rutas con conteo de ciudades
- [ ] Formulario crear/editar ruta
- [ ] Validación ON DELETE RESTRICT
- [ ] Toggle activo/inactivo
- [ ] Tests unitarios

### Fase 3: CRUD de Ciudades (3 días)
- [ ] Listar ciudades con filtros
- [ ] Formulario crear/editar ciudad
- [ ] Input de coordenadas con validación
- [ ] Selector de jerarquía con badges
- [ ] Tests unitarios

### Fase 4: Mapa Interactivo (3 días)
- [ ] Integrar Leaflet/Mapbox
- [ ] Markers con colores por jerarquía
- [ ] Click para editar ciudad
- [ ] Modal para seleccionar coordenadas
- [ ] Vista de rutas completas

### Fase 5: Features Avanzados (2 días)
- [ ] Búsqueda fuzzy con pg_trgm
- [ ] Geocoding API para autocompletar
- [ ] Estadísticas de cobertura
- [ ] Invalidación de cache móvil
- [ ] Tests E2E

### Fase 6: Polish y Deploy (1 día)
- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling
- [ ] Documentación de uso
- [ ] Deploy a producción

**Total estimado:** 13-14 días hábiles

---

## 🚀 Criterios de Aceptación

### MVP Listo Cuando:

✅ **Admin puede:**
1. Ver todas las rutas activas/inactivas
2. Crear nueva ruta con nombre único
3. Editar descripción y orden de rutas
4. Desactivar ruta (soft delete)
5. Ver error si intenta eliminar ruta con ciudades

✅ **Admin puede:**
1. Ver todas las ciudades filtradas por ruta
2. Crear ciudad con coordenadas válidas
3. Asignar jerarquía (0, 1, 2) con descripción clara
4. Editar ciudad existente
5. Cambiar ciudad de ruta
6. Ver ciudad en mapa interactivo

✅ **Sistema garantiza:**
1. No duplicar ciudad en misma ruta
2. Coordenadas válidas (-90/90, -180/180)
3. Location PostGIS auto-generado
4. Cache móvil se puede invalidar manualmente
5. RLS previene edición no autorizada

✅ **UX es intuitiva:**
1. Formularios con validaciones en tiempo real
2. Mensajes de error claros
3. Confirmaciones en acciones destructivas
4. Loading states en operaciones async
5. Toast notifications en éxito/error

---

## 📚 Referencias Técnicas

### Documentación
- [Supabase Geo Queries](https://supabase.com/docs/guides/database/extensions/postgis)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [Leaflet React](https://react-leaflet.js.org/)

### Código en Mobile App
- `lib/routes/routes-service.ts` - Queries de ejemplo
- `types/routes.ts` - TypeScript types
- `supabase/migrations/` - Migraciones SQL

### Scripts Útiles

**Generar tipos TypeScript desde Supabase:**
```bash
npx supabase gen types typescript --project-id pvssldpfbeicbddodxzk > src/types/database.ts
```

**Seed de datos de prueba:**
```sql
-- supabase/seed.sql
INSERT INTO routes (name, description, display_order) VALUES
  ('Ruta Test 1', 'Descripción test', 99);

INSERT INTO coverage_cities (route_id, name, latitude, longitude, hierarchy) VALUES
  (1, 'Ciudad Test', -38.0, -62.0, 1);
```

---

## 🎨 Mockups de Referencia

### Listado de Rutas
```
┌────────────────────────────────────────────────────────────┐
│  Rutas                                    [+ Nueva Ruta]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🔍 Buscar ruta...                    Filtro: [Todas ▼]   │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Ruta 3 Sur                          🟢 Activa        │ │
│  │ Buenos Aires → Bahía Blanca → Comodoro Rivadavia     │ │
│  │ 📍 12 ciudades  |  Orden: 1                          │ │
│  │ [Ver Ciudades] [Editar] [Desactivar] [🗑️]           │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ Ruta 22 Valle                       🟢 Activa        │ │
│  │ Neuquén → San Carlos de Bariloche                    │ │
│  │ �� 8 ciudades  |  Orden: 2                           │ │
│  │ [Ver Ciudades] [Editar] [Desactivar] [��️]           │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### Formulario de Ciudad
```
┌────────────────────────────────────────────────────────────┐
│  ← Volver   Nueva Ciudad                                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Ruta *                                                    │
│  [Ruta 3 Sur                                         ▼]   │
│                                                            │
│  Nombre de la Ciudad *                                    │
│  [Bahía Blanca                                        ]   │
│                                                            │
│  Coordenadas *                                            │
│  Latitud:  [-38.7183    ]  Longitud: [-62.2663      ]   │
│  [📍 Seleccionar en Mapa]                                │
│                                                            │
│  ┌────────────────────────────────────┐                   │
│  │         Mapa Interactivo           │                   │
│  │                                    │                   │
│  │           📍 (marker)              │                   │
│  │                                    │                   │
│  └────────────────────────────────────┘                   │
│                                                            │
│  Jerarquía *                                              │
│  ○ Principal (0)   - Ciudades grandes, puntos clave      │
│  ● Intermedia (1)  - Ciudades medianas                   │
│  ○ Secundaria (2)  - Pueblos pequeños                    │
│                                                            │
│  Estado                                                   │
│  [●────○] Activa                                         │
│                                                            │
│  [Cancelar]                             [Guardar Ciudad] │
└────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Consideraciones Importantes

### 1. Eliminación de Rutas
- Implementar `ON DELETE RESTRICT` ya configurado
- Mostrar alerta: "No se puede eliminar. Hay X ciudades en esta ruta"
- Opción: "Desactivar en su lugar" (soft delete)

### 2. Migración de Ciudades
- Permitir cambiar `route_id` de una ciudad
- Validar constraint `unique_city_per_route`
- Log de auditoría (opcional)

### 3. Geocoding
- Integrar Google Places API o Nominatim (OSM, gratis)
- Autocomplete al escribir nombre de ciudad
- Rellenar coordenadas automáticamente

### 4. Backup antes de Ediciones
- Crear tabla `routes_audit` / `cities_audit`
- Trigger que guarda snapshot antes de UPDATE/DELETE
- Permite rollback manual si algo sale mal

### 5. Notificación a Usuarios
- Si se desactiva una ruta popular
- Si se mueve una ciudad crítica
- Dashboard de "Cambios Recientes"

---

## 📞 Soporte y Mantenimiento

### Logs de Auditoría (Opcional - Fase 2)

```sql
CREATE TABLE admin_audit_log (
  id SERIAL PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT, -- 'CREATE', 'UPDATE', 'DELETE'
  table_name TEXT,
  record_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMPTZ DEFAULT now()
);
```

### Monitoreo
- Sentry para errores de backoffice
- Logs de acciones críticas (eliminar ruta)
- Alertas si queries tardan > 5s

---

## ✅ Checklist Final

Antes de marcar como completo:

- [ ] Todas las rutas CRUD funcionan
- [ ] Todas las ciudades CRUD funcionan
- [ ] Mapa interactivo carga correctamente
- [ ] Validaciones previenen datos incorrectos
- [ ] No se pueden eliminar rutas con ciudades
- [ ] Cache móvil se invalida desde backoffice
- [ ] Tests unitarios pasando
- [ ] Tests E2E pasando
- [ ] Documentación de usuario creada
- [ ] Deploy a staging exitoso
- [ ] QA completo por equipo
- [ ] Deploy a producción

---

**Última actualización:** Noviembre 2025  
**Responsable:** Equipo Backoffice  
**Prioridad:** Alta  
**Dependencias:** Migración mobile app completada ✅

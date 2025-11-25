le pregunte a la ia que hace toda la aplicaicon y esto me dijo en cuantoa. features

"Searched codebase for "analiza #codebase y arma un mvp para un panel administrativo backoffice de asiento libre.

que flujos indispensables y de gran valor deberian implementarse alli?
que metricas agregariamos? que otra cosa se te ocurre?", 22 results

Voy a analizar el codebase para entender la estructura actual y proponer un MVP de panel administrativo backoffice. 

Searched codebase for "supabase database schema tables rides users passengers", 24 results

Searched codebase for "authentication roles admin permissions security", 25 results

Searched codebase for "types models interfaces ride user passenger", 23 results

Read [](file:///Users/matiasrios/Documents/GitHub/asiento-libre/supabase)

Searched codebase for "notifications push email triggers ride events", 21 results

Perfecto, ahora tengo una visión completa del codebase. Voy a analizar y crear una propuesta de MVP para el panel administrativo backoffice.

## 📊 MVP Panel Administrativo Backoffice - Asiento Libre

Basándome en el análisis del codebase, aquí está mi propuesta de MVP para el backoffice:

---

### 🎯 **FLUJOS INDISPENSABLES DE ALTO VALOR**

#### **1. Gestión de Usuarios** 🔴 CRÍTICO
- **Ver lista de usuarios** (conductores + pasajeros)
  - Filtros: verificado/no verificado, fecha de registro, estado
  - Búsqueda por email/nombre/ID
  - Indicadores: # viajes publicados, # viajes tomados, rating promedio
  
- **Detalle de usuario**
  - Datos personales (email, teléfono, fecha nacimiento)
  - Estado de verificación (email, identidad)
  - Historial de viajes (como conductor y pasajero)
  - Calificaciones recibidas/dadas
  - Vehículos registrados
  
- **Acciones de moderación**
  - Suspender/reactivar cuenta
  - Forzar verificación de email
  - Ver/editar perfil
  - Borrar usuario (+ cascade)

**Valor**: Detectar usuarios problemáticos, fraudes, resolver disputes

---

#### **2. Moderación de Viajes** 🔴 CRÍTICO
- **Dashboard de viajes activos**
  - Filtros: fecha, estado (active/completed/cancelled), origen/destino
  - Banderas rojas: viajes con precios anormales, sin pasajeros, cancelados frecuentemente
  
- **Detalle de viaje**
  - Info completa: ruta, conductor, pasajeros, precio
  - Solicitudes: pending/accepted/rejected
  - Chat del viaje (mensajes entre participantes)
  - Timeline de eventos
  
- **Acciones**
  - Cancelar viaje (con razón)
  - Notificar a participantes
  - Ajustar precio sugerido
  - Marcar como sospechoso

**Valor**: Prevenir fraudes, mejorar calidad del servicio, resolver conflictos

---

#### **3. Sistema de Reportes/Denuncias** 🟠 ALTA PRIORIDAD
- **Módulo de reports** (tabla nueva: `reports`)
  ```sql
  - id, reporter_id, reported_user_id, ride_id
  - type: 'fraud', 'harassment', 'no_show', 'unsafe_driving', 'other'
  - description, evidence_urls[], status, admin_notes
  - created_at, resolved_at
  ```
  
- **Dashboard de reportes**
  - Filtros: pendiente/resuelto, tipo, gravedad
  - Asignación a admin
  - Acciones rápidas: suspender usuario, cancelar viaje, contactar usuarios

**Valor**: Seguridad de la plataforma, confianza del usuario

---

#### **4. Métricas y Analytics** 🟢 VALOR ESTRATÉGICO

##### **KPIs Principales**
```
┌─────────────────────────────────────────────┐
│ 📊 DASHBOARD PRINCIPAL                      │
├─────────────────────────────────────────────┤
│ • Total usuarios: 1,245 (+12% vs mes ant.) │
│ • Viajes publicados (mes): 487              │
│ • Viajes completados (mes): 312             │
│ • Tasa conversión: 64%                      │
│ • GMV (Gross Merchandise Value): $124,500  │
│ • Ticket promedio: $399                     │
│ • Rating promedio plataforma: 4.7/5        │
└─────────────────────────────────────────────┘
```

##### **Gráficos Esenciales**
1. **Usuarios nuevos por día/semana/mes** (chart de líneas)
2. **Viajes publicados vs completados** (chart de barras)
3. **Rutas más populares** (top 10 origen-destino)
4. **Distribución de precios** (histogram)
5. **Ocupación promedio** (% asientos ocupados)
6. **Tasa de cancelación** (% cancelados por conductor/pasajero)
7. **Tiempo promedio desde publicación a llenado**

##### **Métricas de Engagement**
- DAU/MAU (Daily/Monthly Active Users)
- Usuarios con ≥1 viaje completado
- Tasa de retención (cohorts por mes de registro)
- NPS (Net Promoter Score) - via ratings
- Tiempo promedio en la plataforma

##### **Métricas de Calidad**
- Distribución de ratings (1-5 estrellas)
- % conductores verificados
- % pasajeros con email verificado
- % viajes con chat activo
- Tiempo promedio de respuesta a solicitudes

##### **Finanzas** (si hay monetización)
- Revenue total
- Revenue por transacción
- Comisión promedio
- AOV (Average Order Value)

**Valor**: Toma de decisiones data-driven, identificar oportunidades de crecimiento

---

#### **5. Gestión de Contenido/Configuración** 🟡 MEDIO PLAZO

- **Ciudades soportadas** (via `cities-coordinates.ts`)
  - CRUD de ciudades
  - Activar/desactivar mercados
  - Matriz de rutas (route-matrix.json)

- **Precios dinámicos** (tabla `price_rules`)
  - Reglas de precio por km, ruta, temporada
  - Min/max permitido

- **Notificaciones masivas**
  - Enviar push/email a segmento de usuarios
  - Templates de mensajes

**Valor**: Control de calidad, expansión a nuevas ciudades

---

### 🛠️ **STACK TÉCNICO SUGERIDO**

```typescript
// Opción 1: Next.js Admin (Recomendada)
Frontend: Next.js 14 + TypeScript
UI: Shadcn/ui (Radix UI + Tailwind) - misma stack que la app
Auth: Supabase Auth (RLS bypass con service_role)
Charts: Recharts o Tremor
Tables: TanStack Table v8

// Opción 2: Retool (Low-Code)
Si querés MVP ultra-rápido: Retool + Supabase
Pros: 0 código frontend, UIs pre-built
Cons: Vendor lock-in, menos customización
```

---

### 📐 **ARQUITECTURA DB**

#### Nuevas tablas necesarias:

```sql
-- 1. Reports/Denuncias
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id),
  reported_user_id UUID REFERENCES auth.users(id),
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('fraud', 'harassment', 'no_show', 'unsafe_driving', 'price_gouging', 'other')),
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  assigned_admin_id UUID,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 2. Admin Audit Log
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action_type TEXT, -- 'suspend_user', 'cancel_ride', 'resolve_report', etc.
  target_type TEXT, -- 'user', 'ride', 'report'
  target_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Admin Roles
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user' 
  CHECK (role IN ('user', 'admin', 'super_admin'));
CREATE INDEX idx_profiles_role ON profiles(role);

-- 4. Feature Flags (opcional)
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INT DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  metadata JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 📊 **QUERIES ÚTILES PARA ANALYTICS**

```sql
-- KPI: Usuarios nuevos por día (últimos 30 días)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users
FROM profiles
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- KPI: Tasa de conversión (viajes publicados → completados)
SELECT 
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  COUNT(*) AS total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / COUNT(*), 2) AS conversion_rate
FROM rides
WHERE created_at >= DATE_TRUNC('month', NOW());

-- KPI: Rutas más populares
SELECT 
  origin_text,
  dest_text,
  COUNT(*) as trips_count,
  AVG(price_suggested) as avg_price,
  AVG(seats) as avg_passengers
FROM rides
WHERE status = 'completed'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY origin_text, dest_text
ORDER BY trips_count DESC
LIMIT 10;

-- KPI: Usuarios con mayor actividad
SELECT 
  p.id,
  p.full_name,
  p.email,
  COUNT(DISTINCT r.id) as trips_as_driver,
  COUNT(DISTINCT rr.id) as trips_as_passenger,
  COALESCE(AVG(rat.stars), 0) as avg_rating
FROM profiles p
LEFT JOIN rides r ON r.driver_id = p.id
LEFT JOIN ride_requests rr ON rr.passenger_id = p.id AND rr.status = 'accepted'
LEFT JOIN ratings rat ON rat.ratee_id = p.id
GROUP BY p.id, p.full_name, p.email
ORDER BY (COUNT(DISTINCT r.id) + COUNT(DISTINCT rr.id)) DESC
LIMIT 20;

-- KPI: Distribución de ratings
SELECT 
  stars,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
FROM ratings
GROUP BY stars
ORDER BY stars DESC;

-- Detección de anomalías: Precios fuera de rango
SELECT 
  r.id,
  r.origin_text,
  r.dest_text,
  r.price_suggested,
  p.full_name as driver_name,
  p.email as driver_email
FROM rides r
JOIN profiles p ON p.id = r.driver_id
WHERE r.price_suggested > 10000 -- Precio sospechoso
  OR r.price_suggested < 100
ORDER BY r.price_suggested DESC;
```

---

### 🚀 **ROADMAP DE IMPLEMENTACIÓN**

#### **Fase 1: MVP Core (2-3 semanas)**
- ✅ Setup Next.js + Supabase (service_role bypass RLS)
- ✅ Auth admin (agregar columna `role` a profiles)
- ✅ Vista de usuarios (lista + detalle)
- ✅ Vista de viajes (lista + detalle)
- ✅ Dashboard con 5 KPIs principales
- ✅ Sistema de reportes básico

#### **Fase 2: Analytics (1 semana)**
- 📊 Gráficos de usuarios/viajes
- 📊 Rutas populares
- 📊 Métricas de calidad (ratings, verificación)

#### **Fase 3: Moderación Avanzada (1-2 semanas)**
- 🛡️ Suspender/reactivar usuarios
- 🛡️ Cancelar viajes
- 🛡️ Ver chat de viajes
- 🛡️ Audit log

#### **Fase 4: Automatizaciones (opcional)**
- 🤖 Alertas automáticas (precio anormal, usuario reportado 3+ veces)
- 🤖 Email templates para soporte
- 🤖 Feature flags

---

### 💡 **OTRAS IDEAS DE VALOR**

1. **Soporte integrado**
   - Chat directo con usuarios desde el backoffice
   - Tickets de soporte (tabla `support_tickets`)

2. **Testing QA**
   - Crear viajes de prueba
   - Impersonar usuario (ver la app como ellos)

3. **Exportación de datos**
   - Excel de usuarios/viajes para análisis offline
   - Backup de datos de usuario (GDPR compliance)

4. **Mapa en tiempo real**
   - Ver viajes activos en mapa
   - Heatmap de rutas

5. **A/B Testing**
   - Feature flags por usuario
   - Segmentación para tests

---

### ⚙️ **CONSIDERACIONES TÉCNICAS**

#### **Seguridad RLS Bypass**
```typescript
// lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ Solo server-side
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

#### **Protección de rutas admin**
```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const user = await getUser();
  
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }
}
```

---

### 🎨 **UI/UX Sugerida**

```
┌──────────────────────────────────────────────────────────┐
│  🪑 Asiento Libre Admin                        👤 Admin  │
├──────────────────────────────────────────────────────────┤
│  📊 Dashboard  │  👥 Usuarios  │  🚗 Viajes  │  ⚠️ Reportes │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  📈 KPIs Principales                                      │
│  ┌──────────┬──────────┬──────────┬──────────┐          │
│  │ Usuarios │  Viajes  │   GMV    │  Rating  │          │
│  │  1,245   │   487    │ $124.5k  │   4.7    │          │
│  │  +12%    │   +8%    │  +15%    │   +0.1   │          │
│  └──────────┴──────────┴──────────┴──────────┘          │
│                                                            │
│  📊 Gráfico: Usuarios nuevos (últimos 30 días)          │
│  [────────────── Chart ──────────────]                   │
│                                                            │
│  🔥 Alertas Recientes                                     │
│  • Reporte CRÍTICO: Usuario #123 (hace 2h)              │
│  • Precio anormal: Viaje #456 ($25,000)                 │
│  • 5 viajes cancelados por conductor #789               │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

### 📌 **RESUMEN EJECUTIVO**

**Inversión estimada**: 4-6 semanas de desarrollo  
**ROI esperado**:  
- ⏱️ **-70% tiempo de soporte** (self-service analytics)
- 🛡️ **+50% detección de fraudes** (alertas automáticas)  
- 📈 **+30% retención** (resolución rápida de disputes)
- 💰 **Monetizable** (datos para ads, partnerships)

**Prioridad #1**: Sistema de reportes + Moderación de usuarios  
**Quick wins**: Dashboard de KPIs, lista de usuarios, detalle de viajes
"

tu plan debe tener en cuenta estas features ademas de las de manejo de leads
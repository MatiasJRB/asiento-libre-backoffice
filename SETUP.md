# 🚀 Setup Completo del Backoffice

## ✅ Lo que se ha implementado

### 1. Infraestructura Base
- ✅ Next.js 14 con TypeScript
- ✅ Tailwind CSS configurado
- ✅ shadcn/ui componentes instalados
- ✅ Supabase configurado (cliente, servidor y admin)
- ✅ Middleware de autenticación

### 2. Base de Datos
- ✅ Migración aplicada con:
  - Columna `role` en `profiles` (user, admin, super_admin)
  - Tabla `reports` para denuncias
  - Tabla `admin_actions` para audit log
  - Columnas de suspensión en `profiles`
  - RLS policies configuradas

### 3. Páginas Implementadas
- ✅ `/login` - Autenticación de admins
- ✅ `/dashboard` - Dashboard con KPIs principales
- ✅ `/users` - Lista y búsqueda de usuarios
- ✅ `/users/[id]` - Detalle de usuario
- ✅ `/rides` - Gestión de viajes con filtros
- ✅ `/reports` - Sistema de reportes con filtros
- ✅ `/leads` - Gestión de leads de la landing
- ✅ `/unauthorized` - Página de acceso denegado
- ✅ `/suspended` - Página de cuenta suspendida

### 4. Features Principales
- ✅ KPIs: Total usuarios, viajes, conversión, rating promedio
- ✅ Métricas de leads
- ✅ Filtros por estado y severidad en reportes
- ✅ Búsqueda de usuarios
- ✅ Detalles completos de usuarios (stats, vehículos, ratings, viajes)
- ✅ Protección de rutas con middleware
- ✅ Verificación de roles (solo admin/super_admin)

## 🔧 Configuración Pendiente

### IMPORTANTE: Service Role Key

**Necesitas agregar tu Service Role Key de Supabase:**

1. Ve a: https://supabase.com/dashboard/project/pvssldpfbeicbddodxzk/settings/api

2. En "Project API keys", copia el **service_role** key

3. Actualiza en `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

⚠️ **NUNCA** compartas esta key ni la subas a GitHub. Está en `.gitignore`.

### Crear tu primer usuario admin

Opción 1: Manualmente desde Supabase SQL Editor:
```sql
-- Reemplaza 'tu-user-id' con el ID de tu usuario
UPDATE profiles 
SET role = 'super_admin' 
WHERE id = 'tu-user-id';
```

Opción 2: Desde la consola de Supabase:
1. Ve a Authentication → Users
2. Copia el UUID de tu usuario
3. Ve a Table Editor → profiles
4. Busca tu registro y cambia `role` a `super_admin`

## 🚀 Correr el Proyecto

```bash
# Instalar dependencias (si no lo hiciste)
npm install

# Agregar Service Role Key en .env.local
# SUPABASE_SERVICE_ROLE_KEY=...

# Iniciar servidor de desarrollo
npm run dev
```

Abre http://localhost:3000

## 📋 Próximos Pasos Sugeridos

### Fase 2: Acciones de Moderación (1-2 semanas)
- [ ] Suspender/reactivar usuarios desde el backoffice
- [ ] Cancelar viajes con razón
- [ ] Cambiar roles de usuarios
- [ ] Asignar reportes a admins
- [ ] Resolver/desestimar reportes
- [ ] Ver chat de viajes

### Fase 3: Analytics Avanzados (1 semana)
- [ ] Gráficos de usuarios/viajes (Recharts)
- [ ] Rutas más populares
- [ ] Distribución de ratings
- [ ] Export a Excel/CSV

### Fase 4: Notificaciones y Comunicación
- [ ] Enviar notificaciones push masivas
- [ ] Enviar emails a segmentos de usuarios
- [ ] Chat de soporte integrado
- [ ] Templates de emails

### Fase 5: Automatizaciones
- [ ] Alertas automáticas (precios anormales, múltiples reportes)
- [  ] Feature flags
- [ ] A/B testing

## 📊 Estructura del Proyecto

```
src/
├── app/
│   ├── dashboard/         # Dashboard con KPIs
│   ├── users/            # Gestión de usuarios
│   ├── rides/            # Gestión de viajes
│   ├── reports/          # Sistema de reportes
│   ├── leads/            # Gestión de leads
│   ├── login/            # Autenticación
│   ├── unauthorized/     # Acceso denegado
│   └── suspended/        # Cuenta suspendida
├── components/
│   ├── dashboard-layout.tsx  # Layout principal
│   └── ui/                   # Componentes shadcn/ui
└── lib/
    ├── supabase/
    │   ├── client.ts     # Cliente browser
    │   ├── server.ts     # Cliente server
    │   ├── admin.ts      # Cliente admin (service_role)
    │   └── middleware.ts # Middleware auth
    ├── auth/
    │   └── check-role.ts # Verificación de roles
    └── types/
        └── database.ts    # Tipos TypeScript
```

## 🔐 Seguridad

- ✅ RLS habilitado en todas las tablas nuevas
- ✅ Middleware protege todas las rutas admin
- ✅ Service Role Key solo server-side
- ✅ Verificación de roles en cada página
- ✅ Audit log de acciones admin
- ✅ Detección de usuarios suspendidos

## 📝 Notas

### Para crear usuarios admin:
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid';
UPDATE profiles SET role = 'super_admin' WHERE id = 'user-uuid';
```

### Para suspender usuarios:
```sql
UPDATE profiles 
SET 
  suspended = true,
  suspended_at = NOW(),
  suspended_reason = 'Razón de suspensión',
  suspended_by = 'admin-uuid'
WHERE id = 'user-uuid';
```

### Para crear un reporte manualmente:
```sql
INSERT INTO reports (
  reporter_id,
  reported_user_id,
  type,
  description,
  severity
) VALUES (
  'reporter-uuid',
  'reported-uuid',
  'harassment',
  'Descripción del reporte',
  'high'
);
```

## 🐛 Troubleshooting

**Error: Cannot find module '@/components/ui/card'**
```bash
npx shadcn@latest add card
```

**Error: SUPABASE_SERVICE_ROLE_KEY is not defined**
- Asegúrate de tener el `.env.local` con la key correcta
- Reinicia el servidor de desarrollo

**Error 401 en llamadas a Supabase**
- Verifica que tu usuario tenga rol `admin` o `super_admin`
- Revisa que las RLS policies estén activas

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

¿Necesitas ayuda? Revisa los logs en la consola del navegador y del servidor.

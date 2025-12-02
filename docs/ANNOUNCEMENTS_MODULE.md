# Módulo de Anuncios de Comunidad

## Descripción
Sistema completo de gestión CRUD para anuncios de comunidad que se muestran en el componente `CommunityInfoCard` de la app móvil de Asiento Libre.

## Características Implementadas

### ✅ Gestión Completa (CRUD)
- **Crear** anuncios con todos los campos configurables
- **Editar** anuncios existentes
- **Eliminar** anuncios con confirmación
- **Duplicar** anuncios para reutilizar configuraciones
- **Listar** todos los anuncios con filtros

### ✅ Interfaz de Usuario
#### Vista de Lista (`/admin/announcements`)
- Tabla ordenable con columnas: Orden, Estado, Título, Tipo, Vigencia, CTA, Acciones
- **Filtros rápidos**:
  - Por estado: Todos, Activos, Borradores, Inactivos
  - Por tipo: Información, Promoción, Evento, Alerta, Consejo
- Badges de colores para estados y tipos
- Preview de icono y color en la lista
- Indicador visual de vigencia (fechas de inicio/fin)

#### Formulario con Live Preview
- **Diseño de 2 columnas**: Formulario (izquierda) + Preview móvil (derecha)
- **Preview en tiempo real**: Muestra exactamente cómo se verá en la app
- **Validaciones en cliente y servidor**
- **Campos del formulario**:
  - Título (max 100 caracteres)
  - Descripción (max 300 caracteres)
  - Tipo (info, promo, event, alert, tip)
  - Estado (draft, active, inactive, archived)
  - Orden de visualización
  - Rango de fechas (inicio/fin)
  - Icono (Ionicons) con link de ayuda
  - Color de icono (color picker nativo)
  - Etiqueta de badge (opcional)
  - Configuración de CTA (texto, acción, objetivo)

### ✅ Lógica de Negocio
- **Validación de fechas**: `ends_at` debe ser posterior a `starts_at`
- **Validación de CTA**: Si se selecciona una acción (distinta de "none"), los campos de texto y objetivo son obligatorios
- **Estados controlados**: 
  - Borradores para trabajo en progreso
  - Activos para publicación
  - Inactivos para pausar temporalmente
  - Archivados para histórico
- **Duplicación inteligente**: Crea copias como "borrador" automáticamente
- **Logging de acciones**: Todas las operaciones se registran en `admin_actions`

### ✅ Seguridad
- **RLS (Row Level Security)** implementado
- **Verificación de roles**: Solo admins y super_admins pueden gestionar anuncios
- **Políticas de Supabase**:
  - Usuarios regulares solo ven anuncios activos y vigentes
  - Admins ven todos los anuncios
  - Solo admins pueden crear, editar y eliminar

### ✅ Performance
- **Índices** en campos frecuentemente consultados (status, type, display_order, dates)
- **Server Components** por defecto para mejor rendimiento
- **Revalidación automática** de rutas después de cambios

## Estructura de Archivos

```
src/
├── app/
│   └── admin/
│       └── announcements/
│           ├── page.tsx                    # Lista de anuncios
│           ├── new/
│           │   └── page.tsx               # Crear nuevo anuncio
│           └── [id]/
│               └── edit/
│                   └── page.tsx           # Editar anuncio existente
├── components/
│   └── admin/
│       └── announcements/
│           ├── AnnouncementForm.tsx       # Formulario con live preview
│           └── AnnouncementActions.tsx    # Botones de acción (duplicar, eliminar)
├── lib/
│   ├── actions/
│   │   └── announcements.ts              # Server actions (CRUD)
│   ├── types/
│   │   └── announcements.ts              # TypeScript types
│   └── validations/
│       └── announcement.schema.ts        # Zod schemas de validación
└── supabase-migrations/
    └── community_announcements.sql        # Schema de BD + RLS

```

## Uso

### 1. Aplicar la migración de base de datos
Ejecuta el archivo SQL en tu proyecto de Supabase:
```bash
# Usando el CLI de Supabase
supabase db push
```

O ejecuta manualmente el contenido de `supabase-migrations/community_announcements.sql` en el editor SQL de Supabase.

### 2. Acceder al módulo
Navega a `/admin/announcements` en el backoffice.

### 3. Crear un anuncio
1. Click en "Nuevo Anuncio"
2. Completa el formulario observando el preview en tiempo real
3. Ajusta colores, iconos y texto según necesites
4. Configura fechas de vigencia (opcional)
5. Define la acción del botón CTA si es necesario
6. Guarda como "Borrador" para revisar después o "Activo" para publicar

### 4. Gestionar anuncios existentes
- **Filtrar**: Usa los botones de filtro rápido por estado o tipo
- **Editar**: Click en "Editar" para modificar
- **Duplicar**: Crea una copia del anuncio con un click
- **Eliminar**: Click en "Eliminar" con confirmación

## Modelo de Datos

### Campos Principales
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `title` | string(100) | Título del anuncio |
| `description` | string(300) | Descripción completa |
| `type` | enum | Tipo: info, promo, event, alert, tip |
| `status` | enum | Estado: draft, active, inactive, archived |
| `display_order` | integer | Orden de visualización (menor = mayor prioridad) |

### Campos de Diseño
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `icon` | string(50) | Nombre del icono de Ionicons |
| `icon_color` | string(7) | Color en formato hex (#RRGGBB) |
| `badge_label` | string(20) | Etiqueta opcional (ej: "NUEVO", "-30%") |

### Campos de Vigencia
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `starts_at` | timestamptz | Fecha/hora de inicio (opcional) |
| `ends_at` | timestamptz | Fecha/hora de fin (opcional) |

### Campos de CTA (Call To Action)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cta_text` | string(30) | Texto del botón |
| `cta_action` | enum | Acción: none, navigate, link, share |
| `cta_target` | string(200) | Objetivo (pantalla o URL) |

## API de Acciones

### Server Actions Disponibles

```typescript
// Obtener todos los anuncios (con filtros opcionales)
getAllAnnouncements({ status?: string, type?: string })

// Obtener un anuncio por ID
getAnnouncementById(id: string)

// Crear nuevo anuncio
createAnnouncement(formData: AnnouncementFormData)

// Actualizar anuncio existente
updateAnnouncement(id: string, formData: AnnouncementFormData)

// Eliminar anuncio
deleteAnnouncement(id: string)

// Duplicar anuncio
duplicateAnnouncement(id: string)

// Actualizar orden de visualización (batch)
updateDisplayOrder(updates: { id: string; display_order: number }[])
```

## Integración con la App Móvil

### Query Recomendado para la App
```typescript
// En la app móvil, para obtener anuncios activos y vigentes:
const { data: announcements } = await supabase
  .from('community_announcements')
  .select('*')
  .eq('status', 'active')
  .or(`starts_at.is.null,starts_at.lte.${new Date().toISOString()}`)
  .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
  .order('display_order', { ascending: true })
  .limit(5)
```

### Mapeo de Iconos
El campo `icon` debe contener el nombre exacto del icono de Ionicons (ej: `megaphone`, `gift`, `calendar`). Consulta [ionic.io/ionicons](https://ionic.io/ionicons) para ver todos los iconos disponibles.

### Acciones de CTA
- **none**: No muestra botón
- **navigate**: Navegar a una pantalla de la app (ej: `RideDetail`, `Profile`)
- **link**: Abrir URL externa (ej: `https://ejemplo.com`)
- **share**: Compartir contenido nativo

## Próximas Mejoras (Opcional)

- [ ] Drag & Drop para reordenar anuncios visualmente
- [ ] Preview de múltiples anuncios (carrusel)
- [ ] Programación automática (activar/desactivar por fechas)
- [ ] Analytics de interacciones (clicks en CTA)
- [ ] Templates predefinidos
- [ ] Soporte multiidioma

## Soporte

Para dudas o problemas, contacta al equipo de desarrollo.

---

**Última actualización**: Diciembre 2025

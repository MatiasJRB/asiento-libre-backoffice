# Integración de Anuncios en la Landing

## Query para consumir anuncios desde la Landing

### Setup inicial

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Query básico - Obtener anuncios activos para la landing

```typescript
const { data: announcements, error } = await supabase
  .from('community_announcements')
  .select('*')
  .eq('status', 'active')
  .in('target_audience', ['landing', 'both'])
  .or(`starts_at.is.null,starts_at.lte.${new Date().toISOString()}`)
  .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
  .order('display_order', { ascending: true })
  .limit(5)

if (error) {
  console.error('Error fetching announcements:', error)
  return []
}

return announcements
```

### Tipos TypeScript

```typescript
type AnnouncementType = 'info' | 'promo' | 'event' | 'alert' | 'tip'
type AnnouncementStatus = 'draft' | 'active' | 'inactive' | 'archived'
type CTAAction = 'none' | 'navigate' | 'link' | 'share'
type TargetAudience = 'app' | 'landing' | 'both'

interface CommunityAnnouncement {
  id: string
  title: string
  description: string
  type: AnnouncementType
  status: AnnouncementStatus
  display_order: number | null
  starts_at: string | null
  ends_at: string | null
  icon: string
  icon_color: string
  badge_label: string
  cta_text: string | null
  cta_action: CTAAction | null
  cta_target: string | null
  target_audience: TargetAudience
  created_at: string | null
  updated_at: string | null
  created_by: string | null
}
```

## Componente React de ejemplo

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function LandingAnnouncements() {
  const [announcements, setAnnouncements] = useState<CommunityAnnouncement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data, error } = await supabase
        .from('community_announcements')
        .select('*')
        .eq('status', 'active')
        .in('target_audience', ['landing', 'both'])
        .or(`starts_at.is.null,starts_at.lte.${new Date().toISOString()}`)
        .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
        .order('display_order', { ascending: true })
        .limit(5)

      if (!error && data) {
        setAnnouncements(data)
      }
      setLoading(false)
    }

    fetchAnnouncements()
  }, [])

  if (loading) {
    return <div className="animate-pulse">Cargando...</div>
  }

  if (announcements.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <AnnouncementCard key={announcement.id} announcement={announcement} />
      ))}
    </div>
  )
}

function AnnouncementCard({ announcement }: { announcement: CommunityAnnouncement }) {
  const handleCTA = () => {
    if (announcement.cta_action === 'link' && announcement.cta_target) {
      window.open(announcement.cta_target, '_blank', 'noopener,noreferrer')
    } else if (announcement.cta_action === 'share' && announcement.cta_target) {
      if (navigator.share) {
        navigator.share({
          title: announcement.title,
          text: announcement.description,
          url: announcement.cta_target,
        })
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      {/* Badge si existe */}
      {announcement.badge_label && (
        <div className="mb-3">
          <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {announcement.badge_label}
          </span>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex gap-4">
        {/* Icono */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: announcement.icon_color }}
        >
          {/* Aquí puedes usar una librería de iconos o una imagen */}
          <span className="text-white text-xl font-bold">
            {announcement.icon.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Texto */}
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-2">
            {announcement.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            {announcement.description}
          </p>

          {/* Botón CTA */}
          {announcement.cta_action && announcement.cta_action !== 'none' && announcement.cta_text && (
            <button
              onClick={handleCTA}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors"
            >
              {announcement.cta_text}
            </button>
          )}
        </div>
      </div>

      {/* Tipo de anuncio (badge visual) */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <span className={`inline-block text-xs px-2 py-1 rounded ${getTypeBadgeClass(announcement.type)}`}>
          {getTypeLabel(announcement.type)}
        </span>
      </div>
    </div>
  )
}

// Helpers
function getTypeBadgeClass(type: AnnouncementType): string {
  const classes = {
    info: 'bg-blue-100 text-blue-700',
    promo: 'bg-purple-100 text-purple-700',
    event: 'bg-green-100 text-green-700',
    alert: 'bg-red-100 text-red-700',
    tip: 'bg-yellow-100 text-yellow-700'
  }
  return classes[type] || classes.info
}

function getTypeLabel(type: AnnouncementType): string {
  const labels = {
    info: 'Información',
    promo: 'Promoción',
    event: 'Evento',
    alert: 'Importante',
    tip: 'Consejo'
  }
  return labels[type] || 'Info'
}
```

## Server Component (Next.js 13+)

```tsx
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function LandingAnnouncementsServer() {
  const { data: announcements } = await supabase
    .from('community_announcements')
    .select('*')
    .eq('status', 'active')
    .in('target_audience', ['landing', 'both'])
    .or(`starts_at.is.null,starts_at.lte.${new Date().toISOString()}`)
    .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
    .order('display_order', { ascending: true })
    .limit(5)

  if (!announcements || announcements.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        Novedades y Beneficios
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {announcements.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </div>
    </section>
  )
}
```

## Variaciones de Query

### Solo promociones activas
```typescript
const { data } = await supabase
  .from('community_announcements')
  .select('*')
  .eq('status', 'active')
  .eq('type', 'promo')
  .in('target_audience', ['landing', 'both'])
  .order('display_order')
```

### Solo eventos próximos
```typescript
const { data } = await supabase
  .from('community_announcements')
  .select('*')
  .eq('status', 'active')
  .eq('type', 'event')
  .in('target_audience', ['landing', 'both'])
  .gte('ends_at', new Date().toISOString())
  .order('starts_at', { ascending: true })
```

### Anuncios destacados (orden bajo = prioridad alta)
```typescript
const { data } = await supabase
  .from('community_announcements')
  .select('*')
  .eq('status', 'active')
  .in('target_audience', ['landing', 'both'])
  .lte('display_order', 3) // Solo los 3 primeros
  .order('display_order')
```

## Iconos (Ionicons en web)

Para usar los iconos de Ionicons en la landing:

```html
<!-- Agregar en el <head> -->
<script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
<script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
```

```tsx
// Componente de icono
function AnnouncementIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center"
      style={{ backgroundColor: color }}
    >
      <ion-icon 
        name={icon} 
        style={{ fontSize: '28px', color: 'white' }}
      />
    </div>
  )
}
```

## Ejemplo de Carousel/Slider

```tsx
'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function AnnouncementsCarousel({ announcements }: { announcements: CommunityAnnouncement[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % announcements.length)
    }, 5000) // Cambia cada 5 segundos

    return () => clearInterval(timer)
  }, [announcements.length])

  if (announcements.length === 0) return null

  const announcement = announcements[current]

  return (
    <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
      {/* Contenido */}
      <div className="max-w-2xl mx-auto text-center">
        {announcement.badge_label && (
          <span className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-semibold mb-4">
            {announcement.badge_label}
          </span>
        )}
        
        <h2 className="text-3xl font-bold mb-4">{announcement.title}</h2>
        <p className="text-lg opacity-90 mb-6">{announcement.description}</p>
        
        {announcement.cta_text && (
          <a
            href={announcement.cta_target || '#'}
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-full hover:scale-105 transition-transform"
          >
            {announcement.cta_text}
          </a>
        )}
      </div>

      {/* Controles */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + announcements.length) % announcements.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full hover:bg-white/30"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % announcements.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full hover:bg-white/30"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {announcements.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === current ? 'bg-white w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
```

## Caché y Revalidación (Next.js)

```typescript
// app/api/announcements/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // O anon key
)

export const revalidate = 300 // Revalidar cada 5 minutos

export async function GET() {
  const { data, error } = await supabase
    .from('community_announcements')
    .select('*')
    .eq('status', 'active')
    .in('target_audience', ['landing', 'both'])
    .or(`starts_at.is.null,starts_at.lte.${new Date().toISOString()}`)
    .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
    .order('display_order')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

## Notas Importantes

1. **Permisos RLS**: La tabla ya tiene configurado Row Level Security que permite a usuarios autenticados ver anuncios activos. Para la landing pública, asegúrate de usar el `anon_key`.

2. **Filtros de audiencia**: Siempre usar `.in('target_audience', ['landing', 'both'])` para obtener solo anuncios relevantes para la landing.

3. **Fechas de vigencia**: Los filtros de `starts_at` y `ends_at` aseguran que solo se muestren anuncios vigentes.

4. **Display order**: Menor número = mayor prioridad en la visualización.

5. **CTA Actions**: 
   - `none`: No mostrar botón
   - `link`: Abrir URL en nueva pestaña
   - `share`: Usar Web Share API (si está disponible)

---

**Contacto**: Para dudas sobre la integración, revisar la documentación completa en `docs/ANNOUNCEMENTS_MODULE.md`

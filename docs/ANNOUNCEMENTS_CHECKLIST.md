# ✅ Checklist de Implementación: Módulo de Anuncios

## Pre-Despliegue

### Base de Datos
- [ ] Ejecutar migración SQL en Supabase
  - Archivo: `supabase-migrations/community_announcements.sql`
  - Método 1: `supabase db push` (recomendado)
  - Método 2: Copiar/pegar en SQL Editor de Supabase Dashboard

- [ ] Verificar que la tabla `community_announcements` se creó correctamente
  ```sql
  SELECT * FROM community_announcements LIMIT 1;
  ```

- [ ] Verificar que las políticas RLS están activas
  ```sql
  SELECT tablename, policyname FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'community_announcements';
  ```

### Permisos de Usuario
- [ ] Confirmar que tu usuario tiene rol `admin` o `super_admin`
  ```sql
  SELECT id, full_name, email, role FROM profiles WHERE id = auth.uid();
  ```

- [ ] Si no tienes permisos, actualizar rol:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE id = 'TU_USER_ID';
  ```

## Pruebas Funcionales

### Navegación
- [ ] Acceder a `/admin/announcements`
- [ ] Verificar que el link "Anuncios" aparece en el menú principal
- [ ] Verificar que la página carga sin errores

### Crear Anuncio
- [ ] Click en "Nuevo Anuncio"
- [ ] Verificar que el formulario se muestra correctamente
- [ ] Verificar que el preview aparece en la columna derecha
- [ ] Completar todos los campos requeridos:
  - [ ] Título (max 100 chars)
  - [ ] Descripción (max 300 chars)
  - [ ] Tipo (seleccionar uno)
  - [ ] Estado (seleccionar uno)
- [ ] Configurar diseño:
  - [ ] Elegir icono (ej: "megaphone")
  - [ ] Seleccionar color con color picker
  - [ ] Agregar badge label (opcional)
- [ ] Configurar fechas (opcional):
  - [ ] Fecha de inicio
  - [ ] Fecha de fin (debe ser posterior a inicio)
- [ ] Configurar CTA:
  - [ ] Seleccionar acción distinta de "none"
  - [ ] Verificar que campos de texto y target aparecen
  - [ ] Completar texto y target
- [ ] Verificar que el preview se actualiza en tiempo real
- [ ] Click en "Crear"
- [ ] Verificar redirección a lista
- [ ] Confirmar que el anuncio aparece en la tabla

### Editar Anuncio
- [ ] Click en "Editar" de un anuncio existente
- [ ] Verificar que los datos se cargan correctamente
- [ ] Modificar algún campo
- [ ] Verificar cambios en preview
- [ ] Guardar cambios
- [ ] Verificar que los cambios se reflejan en la lista

### Duplicar Anuncio
- [ ] Click en "Duplicar" de un anuncio
- [ ] Verificar redirección a página de edición
- [ ] Confirmar que el título tiene "(Copia)"
- [ ] Confirmar que el estado es "draft"
- [ ] Guardar el duplicado

### Eliminar Anuncio
- [ ] Click en "Eliminar" de un anuncio
- [ ] Verificar que aparece dialog de confirmación
- [ ] Cancelar eliminación
- [ ] Volver a intentar eliminar
- [ ] Confirmar eliminación
- [ ] Verificar que el anuncio desaparece de la lista

### Filtros
- [ ] Click en filtro "Activos"
  - [ ] Verificar que solo se muestran anuncios activos
- [ ] Click en filtro "Borradores"
  - [ ] Verificar que solo se muestran borradores
- [ ] Click en filtro por tipo (ej: "Promoción")
  - [ ] Verificar que solo se muestran anuncios de ese tipo
- [ ] Click en "Todos"
  - [ ] Verificar que se muestran todos los anuncios

### Validaciones
- [ ] Intentar crear anuncio con título vacío
  - [ ] Verificar mensaje de error
- [ ] Intentar crear anuncio con descripción > 300 chars
  - [ ] Verificar límite en input
- [ ] Configurar fecha de fin anterior a fecha de inicio
  - [ ] Verificar mensaje de error
- [ ] Seleccionar acción CTA pero dejar campos vacíos
  - [ ] Verificar mensaje de error
- [ ] Ingresar color en formato inválido
  - [ ] Verificar mensaje de error

### Preview Móvil
- [ ] Verificar que el preview muestra:
  - [ ] Badge label (si existe)
  - [ ] Icono circular con color correcto
  - [ ] Título del anuncio
  - [ ] Descripción del anuncio
  - [ ] Botón CTA (si está configurado)
  - [ ] Fechas de vigencia (si existen)
- [ ] Cambiar color de icono
  - [ ] Verificar actualización inmediata en preview
- [ ] Cambiar texto
  - [ ] Verificar actualización inmediata en preview

## Verificación de Seguridad

### Row Level Security
- [ ] Crear un usuario test sin permisos de admin
- [ ] Intentar acceder a `/admin/announcements`
  - [ ] Debe redirigir o mostrar error
- [ ] Verificar que usuario regular no puede:
  - [ ] Ver anuncios inactivos
  - [ ] Crear anuncios
  - [ ] Editar anuncios
  - [ ] Eliminar anuncios

### Logging
- [ ] Crear un anuncio
- [ ] Verificar que se registró en `admin_actions`:
  ```sql
  SELECT * FROM admin_actions 
  WHERE action_type = 'create_announcement' 
  ORDER BY created_at DESC LIMIT 5;
  ```
- [ ] Editar un anuncio
  - [ ] Verificar log de `update_announcement`
- [ ] Eliminar un anuncio
  - [ ] Verificar log de `delete_announcement`
- [ ] Duplicar un anuncio
  - [ ] Verificar log de `duplicate_announcement`

## Performance

### Queries
- [ ] Abrir DevTools > Network
- [ ] Recargar `/admin/announcements`
- [ ] Verificar tiempo de carga razonable
- [ ] Verificar que no hay queries N+1

### Índices
- [ ] Verificar que los índices existen:
  ```sql
  SELECT indexname, indexdef 
  FROM pg_indexes 
  WHERE tablename = 'community_announcements';
  ```

## Integración con App Móvil (Pendiente)

### Backend listo ✅
- [x] Tabla creada
- [x] RLS configurado
- [x] Datos accesibles vía API

### Frontend móvil (Por implementar)
- [ ] Actualizar CommunityInfoCard
- [ ] Implementar query de anuncios activos
- [ ] Mapear iconos de Ionicons
- [ ] Implementar acciones de CTA
- [ ] Manejar navegación
- [ ] Manejar links externos
- [ ] Implementar share nativo

### Query Sugerido para App
```typescript
const { data: announcements } = await supabase
  .from('community_announcements')
  .select('*')
  .eq('status', 'active')
  .or(`starts_at.is.null,starts_at.lte.${new Date().toISOString()}`)
  .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
  .order('display_order', { ascending: true })
  .limit(5)
```

## Documentación

- [ ] Revisar `docs/ANNOUNCEMENTS_MODULE.md`
- [ ] Revisar `docs/ANNOUNCEMENTS_IMPLEMENTATION_SUMMARY.md`
- [ ] Compartir con el equipo

## Despliegue a Producción

- [ ] Merge de código a rama principal
- [ ] Ejecutar migración en Supabase producción
- [ ] Verificar que el módulo funciona en producción
- [ ] Crear primer anuncio de prueba
- [ ] Monitorear logs de errores

---

## Soporte

Si encuentras algún problema:
1. Revisar logs del navegador (Console)
2. Revisar logs de Supabase (Logs & Analytics)
3. Verificar que la migración se aplicó correctamente
4. Verificar permisos de usuario

## Notas

- ✅ = Completado y verificado
- ⚠️ = Pendiente o requiere atención
- ❌ = Bloqueado o con error

**Fecha de creación**: Diciembre 2025

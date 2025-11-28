# 📊 Consultas SQL Útiles - Analíticas de Búsqueda

## Consultas Directas (SQL Editor)

### Ver últimas búsquedas
```sql
SELECT 
  id,
  origin_city,
  dest_city,
  passengers,
  has_results,
  did_convert,
  created_at
FROM search_logs
ORDER BY created_at DESC
LIMIT 20;
```

### Contar búsquedas totales
```sql
SELECT COUNT(*) as total_searches
FROM search_logs
WHERE created_at >= NOW() - INTERVAL '30 days';
```

### Tasa de conversión general
```sql
SELECT 
  COUNT(*) as total_searches,
  SUM(CASE WHEN did_convert THEN 1 ELSE 0 END) as converted,
  ROUND(100.0 * SUM(CASE WHEN did_convert THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate
FROM search_logs
WHERE created_at >= NOW() - INTERVAL '30 days';
```

### Búsquedas sin resultados por ruta
```sql
SELECT 
  origin_city,
  dest_city,
  COUNT(*) as failed_searches
FROM search_logs
WHERE has_results = false
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY origin_city, dest_city
ORDER BY failed_searches DESC
LIMIT 20;
```

## Funciones RPC (desde el código)

### 1. Top Rutas Más Buscadas
```typescript
const { data } = await supabase.rpc('get_top_search_routes', {
  p_days: 30,
  p_limit: 10
})
```

SQL directo:
```sql
SELECT * FROM get_top_search_routes(30, 10);
```

### 2. Demanda Insatisfecha
```typescript
const { data } = await supabase.rpc('get_unsatisfied_demand', {
  p_days: 30,
  p_limit: 10
})
```

SQL directo:
```sql
SELECT * FROM get_unsatisfied_demand(30, 10);
```

### 3. Búsquedas por Día
```typescript
const { data } = await supabase.rpc('get_searches_by_day', {
  p_days: 30
})
```

SQL directo:
```sql
SELECT * FROM get_searches_by_day(30);
```

## Análisis Avanzados

### Usuarios que más buscan
```sql
SELECT 
  p.full_name,
  p.email,
  COUNT(sl.id) as total_searches,
  SUM(CASE WHEN sl.did_convert THEN 1 ELSE 0 END) as converted_searches
FROM search_logs sl
LEFT JOIN profiles p ON p.id = sl.user_id
WHERE sl.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.full_name, p.email
ORDER BY total_searches DESC
LIMIT 10;
```

### Rutas con mejor conversión
```sql
SELECT 
  origin_city,
  dest_city,
  COUNT(*) as searches,
  SUM(CASE WHEN did_convert THEN 1 ELSE 0 END) as conversions,
  ROUND(100.0 * SUM(CASE WHEN did_convert THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate
FROM search_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND has_results = true
GROUP BY origin_city, dest_city
HAVING COUNT(*) >= 5  -- Al menos 5 búsquedas
ORDER BY conversion_rate DESC
LIMIT 10;
```

### Días de la semana más buscados
```sql
SELECT 
  TO_CHAR(search_date, 'Day') as day_of_week,
  COUNT(*) as searches
FROM search_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY day_of_week, EXTRACT(DOW FROM search_date)
ORDER BY EXTRACT(DOW FROM search_date);
```

### Cantidad promedio de pasajeros
```sql
SELECT 
  ROUND(AVG(passengers), 1) as avg_passengers,
  MIN(passengers) as min_passengers,
  MAX(passengers) as max_passengers
FROM search_logs
WHERE created_at >= NOW() - INTERVAL '30 days';
```

## Testing de Funciones

### Probar get_top_search_routes
```sql
-- Ver si retorna datos
SELECT * FROM get_top_search_routes(7, 5);

-- Verificar tipos de datos
SELECT 
  origin_city::text,
  dest_city::text,
  search_count::bigint,
  results_rate::numeric,
  conversion_rate::numeric,
  avg_passengers::numeric
FROM get_top_search_routes(30, 10);
```

### Probar get_unsatisfied_demand
```sql
SELECT * FROM get_unsatisfied_demand(30, 10);
```

### Probar get_searches_by_day
```sql
SELECT * FROM get_searches_by_day(7);
```

## Verificación de Datos

### Verificar que el tracking funciona
```sql
-- Debe tener búsquedas recientes (hoy o ayer)
SELECT COUNT(*) as recent_searches
FROM search_logs
WHERE created_at >= NOW() - INTERVAL '24 hours';
```

### Verificar conversiones
```sql
SELECT 
  sl.id,
  sl.origin_city,
  sl.dest_city,
  sl.converted_at,
  rr.id as request_id
FROM search_logs sl
LEFT JOIN ride_requests rr ON rr.id = sl.converted_to_request_id
WHERE sl.did_convert = true
ORDER BY sl.converted_at DESC
LIMIT 10;
```

## Mantenimiento

### Limpiar búsquedas antiguas (>1 año)
```sql
-- Solo si quieres mantener la DB ligera
DELETE FROM search_logs
WHERE created_at < NOW() - INTERVAL '1 year';
```

### Ver tamaño de la tabla
```sql
SELECT 
  pg_size_pretty(pg_total_relation_size('search_logs')) as table_size,
  COUNT(*) as total_rows
FROM search_logs;
```

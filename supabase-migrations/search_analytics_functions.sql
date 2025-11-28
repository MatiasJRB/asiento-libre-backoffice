-- ============================================
-- Funciones SQL para Analíticas de Búsqueda
-- ============================================
-- Ejecutar en Supabase SQL Editor

-- Función 1: Top rutas más buscadas
CREATE OR REPLACE FUNCTION get_top_search_routes(p_days int DEFAULT 30, p_limit int DEFAULT 10)
RETURNS TABLE (
  origin_city text,
  dest_city text,
  search_count bigint,
  results_rate numeric,
  conversion_rate numeric,
  avg_passengers numeric
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;

-- Función 2: Demanda insatisfecha
CREATE OR REPLACE FUNCTION get_unsatisfied_demand(p_days int DEFAULT 30, p_limit int DEFAULT 10)
RETURNS TABLE (
  origin_city text,
  dest_city text,
  failed_searches bigint,
  last_search_date timestamp,
  avg_passengers numeric
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;

-- Función 3: Búsquedas por día (para gráficos)
CREATE OR REPLACE FUNCTION get_searches_by_day(p_days int DEFAULT 30)
RETURNS TABLE (
  search_date date,
  total_searches bigint,
  with_results bigint,
  converted bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(sl.created_at) as search_date,
    COUNT(*) as total_searches,
    SUM(CASE WHEN sl.has_results THEN 1 ELSE 0 END) as with_results,
    SUM(CASE WHEN sl.did_convert THEN 1 ELSE 0 END) as converted
  FROM search_logs sl
  WHERE sl.created_at >= NOW() - (p_days || ' days')::interval
  GROUP BY DATE(sl.created_at)
  ORDER BY search_date ASC;
END;
$$;

-- Grant EXECUTE permission to authenticated users
GRANT EXECUTE ON FUNCTION get_top_search_routes TO authenticated;
GRANT EXECUTE ON FUNCTION get_unsatisfied_demand TO authenticated;
GRANT EXECUTE ON FUNCTION get_searches_by_day TO authenticated;

-- Comentarios para documentación
COMMENT ON FUNCTION get_top_search_routes IS 'Retorna las rutas más buscadas con métricas de resultados y conversión';
COMMENT ON FUNCTION get_unsatisfied_demand IS 'Retorna las rutas con más búsquedas sin resultados (demanda insatisfecha)';
COMMENT ON FUNCTION get_searches_by_day IS 'Retorna búsquedas agrupadas por día para gráficos temporales';

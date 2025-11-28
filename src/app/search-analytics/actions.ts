'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { SearchLog, TopSearchRoute, UnsatisfiedDemand } from '@/lib/types/database'

interface SearchAnalyticsData {
  kpis: {
    totalSearches: number
    searchesWithoutResults: number
    convertedSearches: number
    uniqueUsers: number
    withoutResultsRate: number
    conversionRate: number
  }
  topRoutes: TopSearchRoute[]
  unsatisfiedDemand: UnsatisfiedDemand[]
}

export async function getSearchAnalytics(days: number = 30): Promise<SearchAnalyticsData> {
  const adminClient = createAdminClient()

  // Calcular fecha de inicio
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateISO = startDate.toISOString()

  // Obtener todas las búsquedas del período
  const { data: searchLogs, error: logsError } = await adminClient
    .from('search_logs')
    .select('*')
    .gte('created_at', startDateISO)
    .order('created_at', { ascending: false })

  if (logsError) {
    console.error('Error fetching search logs:', logsError)
    throw new Error('Error al obtener logs de búsqueda')
  }

  const logs = searchLogs as SearchLog[]

  // Calcular KPIs
  const totalSearches = logs.length
  const searchesWithoutResults = logs.filter((s) => !s.has_results).length
  const convertedSearches = logs.filter((s) => s.did_convert).length
  const uniqueUsers = new Set(logs.map((s) => s.user_id).filter(Boolean)).size

  const kpis = {
    totalSearches,
    searchesWithoutResults,
    convertedSearches,
    uniqueUsers,
    withoutResultsRate: totalSearches > 0 ? (searchesWithoutResults / totalSearches) * 100 : 0,
    conversionRate: totalSearches > 0 ? (convertedSearches / totalSearches) * 100 : 0,
  }

  // Calcular top rutas manualmente
  const routeMap = new Map<string, {
    origin_city: string
    dest_city: string
    searches: SearchLog[]
  }>()

  logs.forEach(log => {
    const key = `${log.origin_city}|${log.dest_city}`
    if (!routeMap.has(key)) {
      routeMap.set(key, {
        origin_city: log.origin_city,
        dest_city: log.dest_city,
        searches: []
      })
    }
    routeMap.get(key)!.searches.push(log)
  })

  const topRoutes: TopSearchRoute[] = Array.from(routeMap.values())
    .map(route => ({
      origin_city: route.origin_city,
      dest_city: route.dest_city,
      search_count: route.searches.length,
      results_rate: route.searches.length > 0 
        ? Number(((route.searches.filter(s => s.has_results).length / route.searches.length) * 100).toFixed(2))
        : 0,
      conversion_rate: route.searches.length > 0
        ? Number(((route.searches.filter(s => s.did_convert).length / route.searches.length) * 100).toFixed(2))
        : 0,
      avg_passengers: route.searches.length > 0
        ? Number((route.searches.reduce((sum, s) => sum + s.passengers, 0) / route.searches.length).toFixed(1))
        : 0
    }))
    .sort((a, b) => b.search_count - a.search_count)
    .slice(0, 10)

  // Calcular demanda insatisfecha manualmente
  const unsatisfiedMap = new Map<string, {
    origin_city: string
    dest_city: string
    searches: SearchLog[]
  }>()

  logs.filter(log => !log.has_results).forEach(log => {
    const key = `${log.origin_city}|${log.dest_city}`
    if (!unsatisfiedMap.has(key)) {
      unsatisfiedMap.set(key, {
        origin_city: log.origin_city,
        dest_city: log.dest_city,
        searches: []
      })
    }
    unsatisfiedMap.get(key)!.searches.push(log)
  })

  const unsatisfiedDemand: UnsatisfiedDemand[] = Array.from(unsatisfiedMap.values())
    .map(route => ({
      origin_city: route.origin_city,
      dest_city: route.dest_city,
      failed_searches: route.searches.length,
      last_search_date: route.searches.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0].created_at,
      avg_passengers: route.searches.length > 0
        ? Number((route.searches.reduce((sum, s) => sum + s.passengers, 0) / route.searches.length).toFixed(1))
        : 0
    }))
    .sort((a, b) => b.failed_searches - a.failed_searches)
    .slice(0, 10)

  return {
    kpis,
    topRoutes,
    unsatisfiedDemand,
  }
}

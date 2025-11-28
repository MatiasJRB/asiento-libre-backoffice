'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { KPICard } from '@/components/ui/kpi-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { getSearchAnalytics } from '../actions'
import type { TopSearchRoute, UnsatisfiedDemand } from '@/lib/types/database'
import { Search, AlertTriangle, TrendingUp, Users } from 'lucide-react'

interface KPIData {
  totalSearches: number
  searchesWithoutResults: number
  convertedSearches: number
  uniqueUsers: number
  withoutResultsRate: number
  conversionRate: number
}

export function SearchAnalyticsContent() {
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<KPIData | null>(null)
  const [topRoutes, setTopRoutes] = useState<TopSearchRoute[]>([])
  const [unsatisfiedDemand, setUnsatisfiedDemand] = useState<UnsatisfiedDemand[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSearchAnalytics(days)
      setKpis(data.kpis)
      setTopRoutes(data.topRoutes)
      setUnsatisfiedDemand(data.unsatisfiedDemand)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <div className="flex justify-end">
        <Select value={days.toString()} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
            <SelectItem value="90">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Búsquedas"
          value={kpis?.totalSearches.toLocaleString() || '0'}
          subtitle={`En los últimos ${days} días`}
          icon={Search}
        />
        <KPICard
          title="Sin Resultados"
          value={`${kpis?.withoutResultsRate.toFixed(1)}%`}
          subtitle={`${kpis?.searchesWithoutResults || 0} búsquedas`}
          icon={AlertTriangle}
          variant={Number(kpis?.withoutResultsRate) > 20 ? 'warning' : 'default'}
        />
        <KPICard
          title="Tasa de Conversión"
          value={`${kpis?.conversionRate.toFixed(1)}%`}
          subtitle={`${kpis?.convertedSearches || 0} conversiones`}
          icon={TrendingUp}
          variant={Number(kpis?.conversionRate) > 10 ? 'success' : 'default'}
        />
        <KPICard
          title="Usuarios Únicos"
          value={kpis?.uniqueUsers.toLocaleString() || '0'}
          subtitle="Usuarios que buscaron"
          icon={Users}
        />
      </div>

      {/* Top 10 Rutas Más Buscadas */}
      <Card>
        <CardHeader>
          <CardTitle>🔥 Top 10 Rutas Más Buscadas</CardTitle>
        </CardHeader>
        <CardContent>
          {topRoutes.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">
              No hay datos de búsquedas en este período
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700">
                      Ruta
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-neutral-700">
                      Búsquedas
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-neutral-700">
                      % con Resultados
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-neutral-700">
                      % Conversión
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-neutral-700">
                      Pasajeros Prom.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topRoutes.map((route, idx) => (
                    <tr key={idx} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-900">
                          {route.origin_city} → {route.dest_city}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-neutral-900">
                        {route.search_count}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-block px-2 py-1 rounded text-sm ${
                            route.results_rate >= 80
                              ? 'bg-green-100 text-green-800'
                              : route.results_rate >= 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {route.results_rate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-block px-2 py-1 rounded text-sm ${
                            route.conversion_rate >= 15
                              ? 'bg-green-100 text-green-800'
                              : route.conversion_rate >= 8
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}
                        >
                          {route.conversion_rate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-neutral-700">
                        {route.avg_passengers}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demanda Insatisfecha */}
      <Card>
        <CardHeader>
          <CardTitle>⚠️ Demanda Insatisfecha (Sin Resultados)</CardTitle>
        </CardHeader>
        <CardContent>
          {unsatisfiedDemand.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">
              ¡Excelente! No hay búsquedas sin resultados en este período
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700">
                      Ruta
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-neutral-700">
                      Búsquedas Fallidas
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-neutral-700">
                      Pasajeros Prom.
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-neutral-700">
                      Última Búsqueda
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {unsatisfiedDemand.map((route, idx) => (
                    <tr key={idx} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-900">
                          {route.origin_city} → {route.dest_city}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-block px-2 py-1 rounded text-sm bg-red-100 text-red-800 font-semibold">
                          {route.failed_searches}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-neutral-700">
                        {route.avg_passengers}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-neutral-600">
                        {new Date(route.last_search_date).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-neutral-200 rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-neutral-200 rounded-lg" />
      <div className="h-96 bg-neutral-200 rounded-lg" />
    </div>
  )
}

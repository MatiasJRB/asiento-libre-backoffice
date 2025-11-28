export interface Route {
  id: string
  name: string
  description: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface CoverageCity {
  id: number
  route_id: string
  name: string
  lat: number
  lng: number
  hierarchy: number | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface RouteWithCityCount extends Route {
  city_count: number
  active_cities: number
}

export interface CityWithRoute extends CoverageCity {
  route: {
    id: string
    name: string
  }
}

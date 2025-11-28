export type UserRole = 'user' | 'admin' | 'super_admin'

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed'
export type ReportSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ReportType = 
  | 'fraud' 
  | 'harassment' 
  | 'no_show' 
  | 'unsafe_driving' 
  | 'price_gouging' 
  | 'inappropriate_content' 
  | 'other'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  email_verif_status: 'pending' | 'verified'
  city: string | null
  gender: 'hombre' | 'mujer' | 'no_binario' | 'prefiero_no_decir' | null
  birth_date: string | null
  bio: string | null
  avg_rating: number
  ratings_count: number
  role: UserRole
  suspended: boolean
  suspended_at: string | null
  suspended_reason: string | null
  suspended_by: string | null
  created_at: string
}

export interface Ride {
  id: string
  driver_id: string
  vehicle_id: string | null
  origin_text: string
  dest_text: string
  origin_lat: number
  origin_lng: number
  dest_lat: number
  dest_lng: number
  date_utc: string
  time_str: string
  seats: number
  seats_offered: number
  price_suggested: number | null
  status: 'active' | 'completed' | 'cancelled'
  flexible: boolean
  prefs_text: string | null
  allows_luggage: boolean
  comfort_backseat_2_only: boolean
  estimated_arrival_str: string | null
  auto_closed_at: string | null
  auto_close_reason: string | null
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  reporter_id: string | null
  reported_user_id: string | null
  ride_id: string | null
  type: ReportType
  description: string
  evidence_urls: string[] | null
  status: ReportStatus
  severity: ReportSeverity
  assigned_admin_id: string | null
  admin_notes: string | null
  created_at: string
  resolved_at: string | null
  updated_at: string
}

export interface AdminAction {
  id: string
  admin_id: string | null
  action_type: string
  target_type: string
  target_id: string | null
  details: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

export interface Lead {
  id: string
  email: string
  name: string | null
  is_subscribed: boolean
  unsubscribe_token: string | null
  email_status: string | null
  welcome_email_sent: boolean
  last_email_sent_at: string | null
  source: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  updated_at: string
  unsubscribed_at: string | null
}

export interface RideRequest {
  id: string
  ride_id: string
  passenger_id: string
  message: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  seats_requested: number
  pickup_text: string | null
  dropoff_text: string | null
  created_at: string
  updated_at: string
}

export interface SearchLog {
  id: string
  user_id: string | null
  origin_city: string
  origin_lat: number
  origin_lng: number
  origin_text: string
  dest_city: string
  dest_lat: number
  dest_lng: number
  dest_text: string
  search_date: string
  passengers: number
  results_found: number
  has_results: boolean
  converted_to_request_id: string | null
  did_convert: boolean
  converted_at: string | null
  created_at: string
}

// Tipos para funciones SQL
export interface TopSearchRoute {
  origin_city: string
  dest_city: string
  search_count: number
  results_rate: number
  conversion_rate: number
  avg_passengers: number
}

export interface UnsatisfiedDemand {
  origin_city: string
  dest_city: string
  failed_searches: number
  last_search_date: string
  avg_passengers: number
}

export interface SearchByDay {
  search_date: string
  total_searches: number
  with_results: number
  converted: number
}

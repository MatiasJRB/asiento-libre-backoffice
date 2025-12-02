export type AnnouncementType = 'info' | 'promo' | 'event' | 'alert' | 'tip'
export type AnnouncementStatus = 'draft' | 'active' | 'inactive' | 'archived'
export type CTAAction = 'none' | 'navigate' | 'link' | 'share'
export type TargetAudience = 'app' | 'landing' | 'both'

export interface CommunityAnnouncement {
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

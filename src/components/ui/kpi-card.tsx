import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default'
}: KPICardProps) {
  const variantStyles = {
    default: 'border-[#d1450a]/30 bg-[#d1450a]/5',
    success: 'border-[#10B981]/30 bg-[#10B981]/5',
    warning: 'border-[#F59E0B]/30 bg-[#F59E0B]/5',
    error: 'border-[#EF4444]/30 bg-[#EF4444]/5',
  }

  const iconStyles = {
    default: 'text-[#d1450a]',
    success: 'text-[#10B981]',
    warning: 'text-[#F59E0B]',
    error: 'text-[#EF4444]',
  }
  
  return (
    <Card className={variantStyles[variant]}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-[#d1450a]">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={`size-5 ${iconStyles[variant]}`} />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[#d1450a]">{value}</div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span className={`text-sm font-medium ${
                trend.isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
            {subtitle && (
              <p className="text-xs text-[#d1450a]/70">{subtitle}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

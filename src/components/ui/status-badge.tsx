import { Badge } from '@/components/ui/badge'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusVariants = cva(
  'inline-flex items-center gap-1.5 font-medium',
  {
    variants: {
      status: {
        active: 'bg-[#ECFDF5] text-[#047857] border-[#6EE7B7]',
        pending: 'bg-[#FFFBEB] text-[#B45309] border-[#FCD34D]',
        cancelled: 'bg-neutral-100 text-neutral-700 border-neutral-300',
        completed: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#93C5FD]',
        suspended: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5]',
        verified: 'bg-[#ECFDF5] text-[#047857] border-[#6EE7B7]',
      },
    },
    defaultVariants: {
      status: 'active',
    },
  }
)

interface StatusBadgeProps extends VariantProps<typeof statusVariants> {
  children: React.ReactNode
  dot?: boolean
  className?: string
}

export function StatusBadge({ status, children, dot = true, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(statusVariants({ status }), className)}>
      {dot && (
        <span className="size-1.5 rounded-full bg-current" />
      )}
      {children}
    </Badge>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelRide } from '@/app/actions/admin-actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface RideActionsProps {
  rideId: string
  currentStatus: string
}

export function RideActions({ rideId, currentStatus }: RideActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const canCancel = currentStatus === 'active'

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setError('Debes ingresar un motivo para cancelar el viaje')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await cancelRide(rideId, cancelReason)

      if (!result.success) {
        setError(result.error || 'Error al cancelar el viaje')
        return
      }

      setShowCancelDialog(false)
      setCancelReason('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  if (!canCancel) {
    return null
  }

  return (
    <>
      <Button
        onClick={() => setShowCancelDialog(true)}
        variant="destructive"
      >
        Cancelar Viaje
      </Button>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Viaje</DialogTitle>
            <DialogDescription>
              Esta acción cancelará el viaje y notificará a todos los pasajeros.
              Ingresa el motivo de la cancelación.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Motivo de cancelación..."
              value={cancelReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCancelReason(e.target.value)}
              rows={4}
              disabled={isLoading}
            />

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false)
                setCancelReason('')
                setError(null)
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isLoading || !cancelReason.trim()}
            >
              {isLoading ? 'Cancelando...' : 'Confirmar Cancelación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

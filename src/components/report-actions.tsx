'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateReportStatus } from '@/app/actions/admin-actions'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ReportActionsProps {
  reportId: string
  currentStatus: string
}

export function ReportActions({ reportId, currentStatus }: ReportActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<'pending' | 'investigating' | 'resolved' | 'dismissed'>(currentStatus as 'pending' | 'investigating' | 'resolved' | 'dismissed')
  const [adminNotes, setAdminNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleUpdate = async () => {
    if (newStatus === currentStatus && !adminNotes.trim()) {
      setError('Debes cambiar el estado o agregar notas')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await updateReportStatus(reportId, newStatus, adminNotes || undefined)

      if (!result.success) {
        setError(result.error || 'Error al actualizar el reporte')
        return
      }

      setShowUpdateDialog(false)
      setAdminNotes('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setShowUpdateDialog(true)}
        variant="default"
      >
        Actualizar Estado
      </Button>

      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Reporte</DialogTitle>
            <DialogDescription>
              Cambia el estado del reporte y/o agrega notas administrativas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as typeof newStatus)} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="investigating">En investigación</SelectItem>
                  <SelectItem value="resolved">Resuelto</SelectItem>
                  <SelectItem value="dismissed">Descartado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Notas del administrador (opcional)
              </label>
              <Textarea
                placeholder="Agrega notas sobre las acciones tomadas, evidencia revisada, etc..."
                value={adminNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
                rows={4}
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-error">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUpdateDialog(false)
                setNewStatus(currentStatus as typeof newStatus)
                setAdminNotes('')
                setError(null)
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isLoading || (newStatus === currentStatus && !adminNotes.trim())}
            >
              {isLoading ? 'Actualizando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

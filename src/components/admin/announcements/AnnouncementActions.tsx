'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { duplicateAnnouncement, deleteAnnouncement } from '@/lib/actions/announcements'
import type { CommunityAnnouncement } from '@/lib/types/announcements'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AnnouncementActionsProps {
  announcement: CommunityAnnouncement
}

export function AnnouncementActions({ announcement }: AnnouncementActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    const result = await duplicateAnnouncement(announcement.id)
    
    if (result.success && result.id) {
      router.push(`/admin/announcements/${result.id}/edit`)
    } else {
      alert(result.error || 'Error al duplicar')
      setIsDuplicating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteAnnouncement(announcement.id)
    
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Error al eliminar')
      setIsDeleting(false)
    }
    setShowDeleteDialog(false)
  }

  return (
    <>
      <div className="flex gap-2 justify-end">
        <Link href={`/admin/announcements/${announcement.id}/edit`}>
          <Button variant="outline" size="sm">
            Editar
          </Button>
        </Link>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleDuplicate}
          disabled={isDuplicating}
        >
          {isDuplicating ? 'Duplicando...' : 'Duplicar'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700"
        >
          Eliminar
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar anuncio?</DialogTitle>
            <DialogDescription>
              Se eliminará permanentemente &quot;{announcement.title}&quot;. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

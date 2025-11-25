'use client'

import { useState } from 'react'
import { suspendUser, unsuspendUser, changeUserRole } from '@/app/actions/admin-actions'
import { useRouter } from 'next/navigation'

interface UserActionsProps {
  userId: string
  currentRole: string
  isSuspended: boolean
  userRole?: string
}

export function UserActions({ userId, currentRole, isSuspended, userRole }: UserActionsProps) {
  const [loading, setLoading] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')
  const [selectedRole, setSelectedRole] = useState(currentRole)
  const router = useRouter()

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      alert('Debes ingresar una razón para la suspensión')
      return
    }

    setLoading(true)
    const result = await suspendUser(userId, suspendReason)
    setLoading(false)

    if (result.success) {
      setShowSuspendModal(false)
      setSuspendReason('')
      router.refresh()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleUnsuspend = async () => {
    if (!confirm('¿Estás seguro de reactivar este usuario?')) return

    setLoading(true)
    const result = await unsuspendUser(userId)
    setLoading(false)

    if (result.success) {
      router.refresh()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleChangeRole = async () => {
    if (selectedRole === currentRole) {
      setShowRoleModal(false)
      return
    }

    if (!confirm(`¿Cambiar rol a ${selectedRole}?`)) return

    setLoading(true)
    const result = await changeUserRole(userId, selectedRole as 'user' | 'admin' | 'super_admin')
    setLoading(false)

    if (result.success) {
      setShowRoleModal(false)
      router.refresh()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const canChangeRoles = userRole === 'super_admin'

  return (
    <div className="flex gap-2 flex-wrap">
      {isSuspended ? (
        <button
          onClick={handleUnsuspend}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Reactivar Usuario'}
        </button>
      ) : (
        <button
          onClick={() => setShowSuspendModal(true)}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          Suspender Usuario
        </button>
      )}

      {canChangeRoles && (
        <button
          onClick={() => setShowRoleModal(true)}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Cambiar Rol
        </button>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Suspender Usuario</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razón de suspensión
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="Describe la razón de la suspensión..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSuspendModal(false)
                  setSuspendReason('')
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSuspend}
                disabled={loading || !suspendReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Suspendiendo...' : 'Suspender'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Cambiar Rol de Usuario</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuevo Rol
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
                <option value="super_admin">Super Administrador</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRoleModal(false)
                  setSelectedRole(currentRole)
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangeRole}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Cambiando...' : 'Cambiar Rol'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

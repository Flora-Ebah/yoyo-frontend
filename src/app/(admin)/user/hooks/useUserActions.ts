import { useState } from 'react'

import { userService, type User } from '@/services/user.service'

interface UseUserActionsParams {
  onDeleteSuccess?: () => void
  onStatusUpdateSuccess?: () => void
  onRoleUpdateSuccess?: () => void
}

export const useUserActions = ({ onDeleteSuccess, onStatusUpdateSuccess, onRoleUpdateSuccess }: UseUserActionsParams = {}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [updatingRole, setUpdatingRole] = useState(false)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget)
    setSelectedUser(user)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedUser(null)
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${selectedUser.firstname || selectedUser.username || selectedUser.email}" ?`)) {
      return
    }

    try {
      setDeleting(true)
      await userService.delete(selectedUser._id)
      handleMenuClose()

      if (onDeleteSuccess) {
        onDeleteSuccess()
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err)
      alert(err.message || 'Erreur lors de la suppression de l\'utilisateur')
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusUpdate = async (status: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending') => {
    if (!selectedUser) return

    try {
      setUpdatingStatus(true)
      await userService.updateStatus(selectedUser._id, status)
      handleMenuClose()

      if (onStatusUpdateSuccess) {
        onStatusUpdateSuccess()
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du statut:', err)
      alert(err.message || 'Erreur lors de la mise à jour du statut')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleRoleUpdate = async (role: 'admin' | 'user' | 'provider') => {
    if (!selectedUser) return

    try {
      setUpdatingRole(true)
      await userService.updateRole(selectedUser._id, role)
      handleMenuClose()

      if (onRoleUpdateSuccess) {
        onRoleUpdateSuccess()
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du rôle:', err)
      alert(err.message || 'Erreur lors de la mise à jour du rôle')
    } finally {
      setUpdatingRole(false)
    }
  }

  const deleteUser = async (user: User) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.firstname || user.username || user.email}" ?`)) return

    try {
      await userService.delete(user._id)

      if (onDeleteSuccess) {
        onDeleteSuccess()
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err)
      alert(err.message || 'Erreur lors de la suppression de l\'utilisateur')
    }
  }

  return {
    anchorEl,
    selectedUser,
    deleting,
    updatingStatus,
    updatingRole,
    handleMenuOpen,
    handleMenuClose,
    handleDelete,
    handleStatusUpdate,
    handleRoleUpdate,
    deleteUser
  }
}


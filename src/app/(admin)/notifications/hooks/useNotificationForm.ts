import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { notificationService } from '@/services/notification.service'
import { UserService, type User } from '@/services/user.service'

const userService = new UserService()

export const useNotificationForm = (onSuccess: () => void) => {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [userSearch, setUserSearch] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    targeting: 'all', // 'all', 'role', 'user'
    role: 'user',
    userId: ''
  })

  useEffect(() => {
    if (formData.targeting === 'user') {
      const fetchUsers = async () => {
        try {
          const response = await userService.getAll({ search: userSearch, limit: 10 })
          setUsers(response.data)
        } catch (error) {
          console.error('Failed to fetch users', error)
        }
      }
      const timer = setTimeout(fetchUsers, 500)
      return () => clearTimeout(timer)
    }
  }, [userSearch, formData.targeting])

  const handleOpen = () => setOpen(true)
  
  const handleClose = () => {
    setOpen(false)
    setFormData({
      title: '',
      message: '',
      type: 'info',
      targeting: 'all',
      role: 'user',
      userId: ''
    })
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.message) return
    setSubmitting(true)
    try {
      await notificationService.create({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        all: formData.targeting === 'all',
        role: formData.targeting === 'role' ? formData.role : undefined,
        userId: formData.targeting === 'user' ? formData.userId : undefined
      })
      toast.success('Notification envoyée')
      handleClose()
      onSuccess()
    } catch (error: any) {
      console.error('Failed to create notification', error)
      toast.error(error?.message || "Échec de l'envoi de la notification")
    } finally {
      setSubmitting(false)
    }
  }

  return {
    open,
    submitting,
    formData,
    setFormData,
    users,
    setUserSearch,
    handleOpen,
    handleClose,
    handleSubmit
  }
}

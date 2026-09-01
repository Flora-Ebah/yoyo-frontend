'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Box from '@mui/material/Box'

// Component Imports
import PageContainer from '@/components/PageContainer'

// Local Imports
import { UserFilters } from './components/UserFilters'
import { UserFormDialog } from './components/UserFormDialog'
import { UserHeader } from './components/UserHeader'
import { UserTable } from './components/UserTable'
import { useUserActions } from './hooks/useUserActions'
import { useUserForm } from './hooks/useUserForm'
import { useUsers } from './hooks/useUsers'

export default function UsersPage() {
  // États pour les filtres
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [searchFilter, setSearchFilter] = useState<string>('')

  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10
  })

  // Hook pour charger les utilisateurs
  const { users, pagination: paginationData, loading, error, reload } = useUsers({
    page: pagination.page,
    limit: pagination.limit,
    statusFilter,
    roleFilter,
    searchFilter
  })

  // Hook pour le formulaire
  const {
    dialogOpen,
    formMode,
    formData,
    setFormData,
    formErrors,
    submitting,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleClose
  } = useUserForm({
    onSuccess: reload
  })

  // Hook pour les actions
  const { deleteUser } = useUserActions({
    onDeleteSuccess: reload,
    onStatusUpdateSuccess: reload,
    onRoleUpdateSuccess: reload
  })

  // Gestion de la pagination
  const handleChangePage = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleChangeRowsPerPage = (rowsPerPage: number) => {
    setPagination(prev => ({
      ...prev,
      limit: rowsPerPage,
      page: 0
    }))
  }

  // Gestion des filtres
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setPagination(prev => ({ ...prev, page: 0 }))
  }

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    setPagination(prev => ({ ...prev, page: 0 }))
  }

  const handleSearchFilterChange = (value: string) => {
    setSearchFilter(value)
    setPagination(prev => ({ ...prev, page: 0 }))
  }

  return (
    <PageContainer>
      <Box className='flex flex-col gap-6'>
        <UserHeader onCreate={handleCreate} />

        <UserFilters
          statusFilter={statusFilter}
          roleFilter={roleFilter}
          searchFilter={searchFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onRoleFilterChange={handleRoleFilterChange}
          onSearchFilterChange={handleSearchFilterChange}
        />

        <UserTable
          users={users}
          loading={loading}
          error={error}
          pagination={paginationData}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onEdit={handleEdit}
          onDelete={deleteUser}
        />

        <UserFormDialog
          open={dialogOpen}
          mode={formMode}
          formData={formData}
          formErrors={formErrors}
          submitting={submitting}
          onClose={handleClose}
          onSubmit={handleSubmit}
          onFormDataChange={setFormData}
        />
      </Box>
    </PageContainer>
  )
}


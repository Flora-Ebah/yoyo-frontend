'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Box from '@mui/material/Box'

// Component Imports
import PageContainer from '@/components/PageContainer'

// Local Imports
import { PackFilters } from './components/PackFilters'
import { PackFormDialog } from './components/PackFormDialog'
import { PackHeader } from './components/PackHeader'
import { PackTable } from './components/PackTable'
import { usePacks } from './hooks/usePacks'
import { usePackActions } from './hooks/usePackActions'
import { usePackForm } from './hooks/usePackForm'

export default function PacksPage() {
  // États pour les filtres
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10
  })

  // Hook pour charger les packs
  const { packs, pagination: paginationData, loading, error, reload } = usePacks({
    page: pagination.page,
    limit: pagination.limit,
    statusFilter,
    typeFilter
  })

  // Hook pour le formulaire
  const {
    dialogOpen,
    formMode,
    formData,
    setFormData,
    formErrors,
    submitting,
    selectedPack,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleClose
  } = usePackForm({
    onSuccess: reload
  })

  // Hook pour les actions
  const { deletePack } = usePackActions({
    onDeleteSuccess: reload
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

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value)
    setPagination(prev => ({ ...prev, page: 0 }))
  }

  return (
    <PageContainer>
      <Box className='flex flex-col gap-6'>
        <PackHeader onCreate={handleCreate} />

        <PackFilters
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onTypeFilterChange={handleTypeFilterChange}
        />

        <PackTable
          packs={packs}
          loading={loading}
          error={error}
          pagination={paginationData}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onEdit={handleEdit}
          onDelete={deletePack}
        />

        <PackFormDialog
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


'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Box from '@mui/material/Box'

// Component Imports
import PageContainer from '@/components/PageContainer'

// Local Imports
import { SoinFilters } from './components/SoinFilters'
import { SoinFormDialog } from './components/SoinFormDialog'
import { SoinHeader } from './components/SoinHeader'
import { SoinTable } from './components/SoinTable'
import { useSoins } from './hooks/useSoins'
import { useSoinActions } from './hooks/useSoinActions'
import { useSoinForm } from './hooks/useSoinForm'

export default function SoinsPage() {
  // États pour les filtres
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10
  })

  // Hook pour charger les soins
  const { soins, pagination: paginationData, loading, error, reload } = useSoins({
    page: pagination.page,
    limit: pagination.limit,
    statusFilter,
    categoryFilter
  })

  // Hook pour le formulaire
  const {
    dialogOpen,
    formMode,
    formData,
    setFormData,
    formErrors,
    submitting,
    selectedSoin,
    availableCategories,
    loadingCategories,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleClose
  } = useSoinForm({
    onSuccess: reload
  })

  // Hook pour les actions
  const { deleteSoin } = useSoinActions({
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

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value)
    setPagination(prev => ({ ...prev, page: 0 }))
  }

  return (
    <PageContainer>
      <Box className='flex flex-col gap-6'>
        <SoinHeader onCreate={handleCreate} />

        <SoinFilters
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onCategoryFilterChange={handleCategoryFilterChange}
        />

        <SoinTable
          soins={soins}
          loading={loading}
          error={error}
          pagination={paginationData}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onEdit={handleEdit}
          onDelete={deleteSoin}
        />

        <SoinFormDialog
          open={dialogOpen}
          mode={formMode}
          formData={formData}
          formErrors={formErrors}
          submitting={submitting}
          availableCategories={availableCategories}
          loadingCategories={loadingCategories}
          onClose={handleClose}
          onSubmit={handleSubmit}
          onFormDataChange={setFormData}
        />
      </Box>
    </PageContainer>
  )
}


'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'

import PageContainer from '@/components/PageContainer'

import { SubTypeFilters } from './components/SubTypeFilters'
import { SubTypeFormDialog } from './components/SubTypeFormDialog'
import { SubTypeHeader } from './components/SubTypeHeader'
import { SubTypeTable } from './components/SubTypeTable'
import { useSubTypeActions } from './hooks/useSubTypeActions'
import { useSubTypeForm } from './hooks/useSubTypeForm'
import { useSubTypes } from './hooks/useSubTypes'

export default function RoutineSoinSubTypesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [search, setSearch] = useState<string>('')

  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10
  })

  const { subTypes, pagination: paginationData, loading, error, reload } = useSubTypes({
    page: pagination.page,
    limit: pagination.limit,
    statusFilter,
    typeFilter,
    search
  })

  const { dialogOpen, formMode, formData, setFormData, formErrors, submitting, handleCreate, handleEdit, handleSubmit, handleClose } =
    useSubTypeForm({
      onSuccess: reload
    })

  const { deleteSubType } = useSubTypeActions({
    onDeleteSuccess: reload
  })

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

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setPagination(prev => ({ ...prev, page: 0 }))
  }

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value)
    setPagination(prev => ({ ...prev, page: 0 }))
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPagination(prev => ({ ...prev, page: 0 }))
  }

  return (
    <PageContainer>
      <Box className='flex flex-col gap-6'>
        <SubTypeHeader onCreate={handleCreate} />

        <SubTypeFilters
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          search={search}
          onStatusFilterChange={handleStatusFilterChange}
          onTypeFilterChange={handleTypeFilterChange}
          onSearchChange={handleSearchChange}
        />

        <SubTypeTable
          subTypes={subTypes}
          loading={loading}
          error={error}
          pagination={paginationData}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onEdit={handleEdit}
          onDelete={deleteSubType}
          onRowClick={handleEdit}
        />

        <SubTypeFormDialog
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


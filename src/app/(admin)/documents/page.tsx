'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'

import PageContainer from '@/components/PageContainer'

import { DocumentFilters } from './components/DocumentFilters'
import { DocumentFormDialog } from './components/DocumentFormDialog'
import { DocumentHeader } from './components/DocumentHeader'
import { DocumentTable } from './components/DocumentTable'
import { useDocumentActions } from './hooks/useDocumentActions'
import { useDocumentForm } from './hooks/useDocumentForm'
import { useDocuments } from './hooks/useDocuments'

export default function DocumentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10
  })

  const { documents, pagination: paginationData, loading, error, reload } = useDocuments({
    page: pagination.page,
    limit: pagination.limit,
    statusFilter,
    typeFilter
  })

  const {
    dialogOpen,
    formMode,
    formData,
    setFormData,
    formErrors,
    submitting,
    fileUploading,
    fileName,
    selectedDocument,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleClose,
    handleFileSelect,
    handleClearFile
  } = useDocumentForm({
    onSuccess: reload
  })

  const { deleteDocument } = useDocumentActions({
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

  return (
    <PageContainer>
      <Box className='flex flex-col gap-6'>
        <DocumentHeader onCreate={handleCreate} />

        <DocumentFilters
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onTypeFilterChange={handleTypeFilterChange}
        />

        <DocumentTable
          documents={documents}
          loading={loading}
          error={error}
          pagination={paginationData}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onEdit={handleEdit}
          onDelete={deleteDocument}
        />

        <DocumentFormDialog
          open={dialogOpen}
          mode={formMode}
          formData={formData}
          formErrors={formErrors}
          submitting={submitting}
          fileUploading={fileUploading}
          fileName={fileName}
          onClose={handleClose}
          onSubmit={handleSubmit}
          onFormDataChange={setFormData}
          onFileSelect={handleFileSelect}
          onClearFile={handleClearFile}
        />
      </Box>
    </PageContainer>
  )
}



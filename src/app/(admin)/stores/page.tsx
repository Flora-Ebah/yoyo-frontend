'use client'

import { useState } from 'react'
import PageContainer from '@/components/PageContainer'
import { useStores } from './hooks/useStores'
import { useStoreActions } from './hooks/useStoreActions'
import { useStoreForm } from './hooks/useStoreForm'
import { StoreHeader } from './components/StoreHeader'
import { StoreFilters } from './components/StoreFilters'
import { StoreTable } from './components/StoreTable'
import { StoreFormDialog } from './components/StoreFormDialog'
import { userService } from '@/services/user.service'
import { useEffect } from 'react'

export default function StoresPage() {
  const [providers, setProviders] = useState<any[]>([])

  const {
    stores,
    loading,
    error,
    pagination,
    filters,
    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
    refresh
  } = useStores({ page: 1, limit: 10 })

  const {
    dialogOpen,
    formMode,
    formData,
    setFormData,
    formErrors,
    submitting,
    providers: formProviders,
    loadingProviders,
    handleEdit,
    handleSubmit,
    handleClose
  } = useStoreForm({ onSuccess: refresh })

  const { deleteStore } = useStoreActions({ onSuccess: refresh })

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await userService.getAll({ limit: 100 })
        const providerUsers = (response.data || []).filter(user => user.role === 'provider')
        setProviders(providerUsers)
      } catch (error) {
        console.error('Erreur lors du chargement des providers:', error)
      }
    }
    loadProviders()
  }, [])

  return (
    <PageContainer>
      <StoreHeader />
      <StoreFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        providers={providers}
      />
      <StoreTable
        stores={stores}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEdit}
        onDelete={deleteStore}
      />
      <StoreFormDialog
        open={dialogOpen}
        mode={formMode}
        formData={formData}
        formErrors={formErrors}
        submitting={submitting}
        providers={formProviders}
        loadingProviders={loadingProviders}
        onClose={handleClose}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />
    </PageContainer>
  )
}

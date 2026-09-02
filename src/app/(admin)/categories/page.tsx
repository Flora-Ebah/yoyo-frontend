'use client'

// React Imports
import { useState } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

// Component Imports
import PageContainer from '@/components/PageContainer'
import { AddIcon, StatusPill, SectionCard, DataTable, SelectFilter, FilterModal, FilterField, RowActions, type Column, type UiPalette } from '@/components/ui'
import { type Category } from '@/services/category.service'

// Local Imports
import { CategoryFormDialog } from './components/CategoryFormDialog'
import { getStatusLabel, isPredefinedCategory } from './utils/category.utils'
import { useCategories } from './hooks/useCategories'
import { useCategoryActions } from './hooks/useCategoryActions'
import { useCategoryForm } from './hooks/useCategoryForm'

const statusPalette: Record<string, UiPalette> = {
  active: 'success',
  inactive: 'secondary',
  archived: 'error'
}

export default function CategoriesPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [parentFilter, setParentFilter] = useState<string>('all')
  const [pagination, setPagination] = useState({ page: 0, limit: 10 })

  const { categories, pagination: paginationData, loading, error, reload } = useCategories({
    page: pagination.page,
    limit: pagination.limit,
    statusFilter,
    parentFilter
  })

  const {
    dialogOpen,
    formMode,
    formData,
    setFormData,
    formErrors,
    submitting,
    parentCategories,
    selectedCategory,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleClose
  } = useCategoryForm({ onSuccess: reload })

  const { deleteCategory } = useCategoryActions({ onDeleteSuccess: reload })

  const columns: Column<Category>[] = [
    { key: 'name', header: 'Nom', render: c => <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary' }} noWrap>{c.name}</Typography> },
    { key: 'slug', header: 'Slug', render: c => <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }} noWrap>{c.slug}</Typography> },
    {
      key: 'parent',
      header: 'Parent',
      render: c =>
        c.parent ? (
          <Typography sx={{ fontSize: 13, color: 'text.primary' }} noWrap>{typeof c.parent === 'string' ? c.parent : c.parent.name}</Typography>
        ) : (
          <StatusPill label='Racine' palette='secondary' />
        )
    },
    { key: 'status', header: 'Statut', render: c => <StatusPill label={getStatusLabel(c.status)} palette={statusPalette[c.status || ''] || 'secondary'} /> },
    { key: 'createdAt', header: 'Date de création', render: c => <Typography sx={{ fontSize: 12.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</Typography> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: c => {
        const predefined = isPredefinedCategory(c.slug)

        if (predefined) {
          return (
            <Box sx={{ display: 'inline-flex', justifyContent: 'flex-end' }}>
              <StatusPill label='Prédéfinie' palette='info' />
            </Box>
          )
        }

        return (
          <RowActions
            actions={[
              { label: 'Modifier', color: 'info', onClick: () => handleEdit(c) },
              { label: 'Supprimer', color: 'error', onClick: () => deleteCategory(c) }
            ]}
          />
        )
      }
    }
  ]

  return (
    <PageContainer
      title='Gestion des catégories'
      subtitle='Gérez les catégories de produits et services'
      actions={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant='text'
            disableRipple
            onClick={() => router.push('/account-settings')}
            sx={{ height: 36, borderRadius: 0, textTransform: 'none', px: 1.5, color: 'text.secondary', '&:hover': { backgroundColor: 'action.hover', color: 'primary.main' } }}
          >
            Retour
          </Button>
          <Button variant='contained' disableElevation onClick={handleCreate} sx={{ height: 36, borderRadius: 0, textTransform: 'none', px: 2 }}>
            Nouvelle catégorie
          </Button>
        </Box>
      }
    >
      <SectionCard
        title='Catégories'
        action={
          <FilterModal
            active={statusFilter !== 'all' || parentFilter !== 'all'}
            onApply={() => {}}
            onReset={() => { setStatusFilter('all'); setParentFilter('all'); setPagination(p => ({ ...p, page: 0 })) }}
            subtitle='Affinez la liste des catégories.'
          >
            <FilterField label='Statut'>
              <SelectFilter
                value={statusFilter}
                onChange={v => { setStatusFilter(v); setPagination(p => ({ ...p, page: 0 })) }}
                options={[
                  { value: 'all', label: 'Statut : tous' },
                  { value: 'active', label: 'Actif' },
                  { value: 'inactive', label: 'Inactif' },
                  { value: 'archived', label: 'Archivé' }
                ]}
              />
            </FilterField>
            <FilterField label='Parent'>
              <SelectFilter
                value={parentFilter}
                onChange={v => { setParentFilter(v); setPagination(p => ({ ...p, page: 0 })) }}
                options={[
                  { value: 'all', label: 'Parent : toutes' },
                  { value: 'root', label: 'Catégories racines' }
                ]}
              />
            </FilterField>
          </FilterModal>
        }
      >
        {loading ? (
          <Box className='flex items-center justify-center py-16'>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2.5 }}><Alert severity='error'>{error}</Alert></Box>
        ) : (
          <DataTable
            columns={columns}
            rows={categories}
            getRowKey={c => c._id}
            empty={{ icon: 'tabler-category', label: 'Aucune catégorie trouvée' }}
            pagination={{
              count: paginationData.total,
              page: paginationData.page,
              rowsPerPage: paginationData.limit,
              onPageChange: newPage => setPagination(p => ({ ...p, page: newPage })),
              onRowsPerPageChange: rpp => setPagination(p => ({ ...p, limit: rpp, page: 0 })),
              rowsPerPageOptions: [10, 25, 50, 100]
            }}
          />
        )}
      </SectionCard>

      <CategoryFormDialog
        open={dialogOpen}
        mode={formMode}
        formData={formData}
        formErrors={formErrors}
        submitting={submitting}
        parentCategories={parentCategories}
        selectedCategoryId={selectedCategory?._id}
        onClose={handleClose}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />
    </PageContainer>
  )
}

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useEffect, useState } from 'react'
import { categoryService } from '@/services/category.service'
import type { Category } from '@/services/category.service'

interface SoinFiltersProps {
  statusFilter: string
  categoryFilter: string
  onStatusFilterChange: (value: string) => void
  onCategoryFilterChange: (value: string) => void
}

export const SoinFilters = ({
  statusFilter,
  categoryFilter,
  onStatusFilterChange,
  onCategoryFilterChange
}: SoinFiltersProps) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await categoryService.getByParentSlug('gestion-soin', {
          page: 1,
          limit: 100,
          onlyActive: true
        })
        setCategories(response.data || [])
      } catch (err) {
        console.error('Erreur lors du chargement des catégories:', err)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  return (
    <Card>
      <CardContent>
        <Box className='flex gap-4 flex-wrap'>
          <FormControl size='small' sx={{ minWidth: 150 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={statusFilter}
              label='Statut'
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <MenuItem value='all'>Tous</MenuItem>
              <MenuItem value='active'>Actif</MenuItem>
              <MenuItem value='inactive'>Inactif</MenuItem>
              <MenuItem value='archived'>Archivé</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 200 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={categoryFilter}
              label='Catégorie'
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              disabled={loadingCategories}
            >
              <MenuItem value='all'>Toutes</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category.slug}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  )
}


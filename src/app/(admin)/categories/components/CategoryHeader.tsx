import Button from '@mui/material/Button'
import { AddIcon } from '@/components/ui'

import PageHeader from '@/components/page/PageHeader'

interface CategoryHeaderProps {
  onCreate: () => void
}

export const CategoryHeader = ({ onCreate }: CategoryHeaderProps) => {
  return (
    <PageHeader
      title='Gestion des categories'
      subtitle='Gerez les categories de produits et services'
      actions={
        <Button variant='contained' onClick={onCreate}>
          Nouvelle categorie
        </Button>
      }
    />
  )
}
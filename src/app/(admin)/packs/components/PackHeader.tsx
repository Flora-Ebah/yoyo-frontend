import Button from '@mui/material/Button'
import { AddIcon } from '@/components/ui'

import PageHeader from '@/components/page/PageHeader'

interface PackHeaderProps {
  onCreate: () => void
}

export const PackHeader = ({ onCreate }: PackHeaderProps) => {
  return (
    <PageHeader
      title='Gestion des packs'
      subtitle='Gerez les packs de produits, outils et services'
      actions={
        <Button variant='contained' onClick={onCreate}>
          Nouveau pack
        </Button>
      }
    />
  )
}
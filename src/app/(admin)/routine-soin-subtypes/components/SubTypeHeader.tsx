import Button from '@mui/material/Button'
import { AddIcon } from '@/components/ui'

import PageHeader from '@/components/page/PageHeader'

interface SubTypeHeaderProps {
  onCreate: () => void
}

export const SubTypeHeader = ({ onCreate }: SubTypeHeaderProps) => {
  return (
    <PageHeader
      title='Sous-types de routine soin'
      subtitle="Gérez les sous-types et leurs champs (ex : lavage, hydratation, massage capillaire, etc.)"
      actions={
        <Button variant='contained' onClick={onCreate}>
          Nouveau sous-type
        </Button>
      }
    />
  )
}


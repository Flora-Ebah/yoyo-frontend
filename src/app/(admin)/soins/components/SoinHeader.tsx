import Button from '@mui/material/Button'
import { AddIcon } from '@/components/ui'

import PageHeader from '@/components/page/PageHeader'

interface SoinHeaderProps {
  onCreate: () => void
}

export const SoinHeader = ({ onCreate }: SoinHeaderProps) => {
  return (
    <PageHeader
      title='Gestion des soins capillaires'
      subtitle='Gerez les soins capillaires et leurs categories'
      actions={
        <Button variant='contained' onClick={onCreate}>
          Nouveau soin
        </Button>
      }
    />
  )
}
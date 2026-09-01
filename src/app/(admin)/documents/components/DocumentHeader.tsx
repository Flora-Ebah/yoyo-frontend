import Button from '@mui/material/Button'

import PageHeader from '@/components/page/PageHeader'
import { AddIcon } from '@/components/ui'

interface DocumentHeaderProps {
  onCreate: () => void
}

export const DocumentHeader = ({ onCreate }: DocumentHeaderProps) => {
  return (
    <PageHeader
      title='Documents légaux'
      subtitle='Gérez les CGU, mentions légales et règles communautaires'
      actions={
        <Button variant='contained' onClick={onCreate}>
          Nouveau document
        </Button>
      }
    />
  )
}


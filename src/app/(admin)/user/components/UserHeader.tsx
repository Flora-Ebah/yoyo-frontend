import Button from '@mui/material/Button'
import { AddIcon } from '@/components/ui'

import PageHeader from '@/components/page/PageHeader'

interface UserHeaderProps {
  onCreate: () => void
  title?: string
  subtitle?: string
  createLabel?: string
}

export const UserHeader = ({
  onCreate,
  title = 'Gestion des utilisateurs',
  subtitle = 'Gerez les utilisateurs, leurs profils et leurs roles',
  createLabel = 'Nouvel utilisateur'
}: UserHeaderProps) => {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      actions={
        <Button variant='contained' onClick={onCreate}>
          {createLabel}
        </Button>
      }
    />
  )
}

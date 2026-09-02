import Alert from '@mui/material/Alert'
import { AddIcon } from '@/components/ui'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import type {
  CreateRoutineSoinSubTypeRequest,
  RoutineSoinSubTypeField,
  UpdateRoutineSoinSubTypeRequest
} from '@/services/routine-soin-subtype.service'
import {
  ROUTINE_SOIN_SUBTYPE_FIELD_INPUT_TYPES,
  ROUTINE_SOIN_SUBTYPE_STATUSES,
  ROUTINE_SOIN_TYPES
} from '../utils/subtype.utils'

interface SubTypeFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  formData: CreateRoutineSoinSubTypeRequest | UpdateRoutineSoinSubTypeRequest
  formErrors: Record<string, string>
  submitting: boolean
  onClose: () => void
  onSubmit: () => void
  onFormDataChange: (data: CreateRoutineSoinSubTypeRequest | UpdateRoutineSoinSubTypeRequest) => void
}

const buildEmptyField = (): RoutineSoinSubTypeField => ({
  key: '',
  label: '',
  inputType: 'text',
  required: false,
  options: undefined,
  placeholder: '',
  order: 0
})

export const SubTypeFormDialog = ({
  open,
  mode,
  formData,
  formErrors,
  submitting,
  onClose,
  onSubmit,
  onFormDataChange
}: SubTypeFormDialogProps) => {
  const fields = (formData.fields || []) as RoutineSoinSubTypeField[]

  const updateFields = (nextFields: RoutineSoinSubTypeField[]) => {
    onFormDataChange({ ...formData, fields: nextFields })
  }

  const handleAddField = () => {
    updateFields([...fields, buildEmptyField()])
  }

  const handleRemoveField = (index: number) => {
    updateFields(fields.filter((_, i) => i !== index))
  }

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const next = [...fields]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= next.length) return

    const temp = next[index]
    next[index] = next[targetIndex]
    next[targetIndex] = temp

    updateFields(next)
  }

  const handleUpdateField = (index: number, patch: Partial<RoutineSoinSubTypeField>) => {
    const next = fields.map((f, i) => (i === index ? { ...f, ...patch } : f))

    updateFields(next)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>{mode === 'create' ? 'Nouveau sous-type' : 'Modifier le sous-type'}</DialogTitle>
      <DialogContent>
        <Box className='flex flex-col gap-4 mt-2'>
          <Box className='flex flex-col gap-3'>
            <TextField
              label='Nom *'
              value={formData.name || ''}
              onChange={e => onFormDataChange({ ...formData, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
              fullWidth
            />

            <TextField
              label='Slug (optionnel)'
              value={formData.slug || ''}
              onChange={e => onFormDataChange({ ...formData, slug: e.target.value })}
              error={!!formErrors.slug}
              helperText={formErrors.slug || "Laissez vide pour générer automatiquement."}
              fullWidth
            />

            <Box className='flex gap-3 flex-wrap'>
              <FormControl sx={{ minWidth: 220 }} fullWidth>
                <InputLabel>Type *</InputLabel>
                <Select
                  value={(formData.type as any) || ''}
                  label='Type *'
                  onChange={e => onFormDataChange({ ...formData, type: e.target.value as any })}
                  error={!!formErrors.type}
                >
                  {ROUTINE_SOIN_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.type ? (
                  <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>{formErrors.type}</Box>
                ) : null}
              </FormControl>

              {mode === 'edit' && (
                <FormControl sx={{ minWidth: 220 }} fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={(formData.status as any) || 'active'}
                    label='Statut'
                    onChange={e => onFormDataChange({ ...formData, status: e.target.value as any })}
                  >
                    {ROUTINE_SOIN_SUBTYPE_STATUSES.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>

            <TextField
              label='Description'
              value={formData.description || ''}
              onChange={e => onFormDataChange({ ...formData, description: e.target.value })}
              error={!!formErrors.description}
              helperText={formErrors.description}
              fullWidth
              multiline
              minRows={2}
            />
          </Box>

          <Divider />

          <Box className='flex items-center justify-between gap-2'>
            <Box>
              <Typography variant='h6'>Champs</Typography>
              <Typography variant='body2' color='text.secondary'>
                Définissez les champs demandés pour ce sous-type. Les valeurs seront enregistrées dans le champ
                <strong> content </strong> de la routine.
              </Typography>
            </Box>
            <Button variant='outlined' onClick={handleAddField}>
              Ajouter un champ
            </Button>
          </Box>

          {fields.length === 0 ? (
            <Alert severity='info'>Aucun champ. Vous pouvez en ajouter si nécessaire.</Alert>
          ) : (
            <Box className='flex flex-col gap-3'>
              {fields.map((field, index) => {
                const keyError = formErrors[`fields.${index}.key`]
                const labelError = formErrors[`fields.${index}.label`]

                return (
                  <Box
                    key={`${index}-${field.key}`}
                    sx={{
                      border: theme => `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 2
                    }}
                  >
                    <Box className='flex items-center justify-between gap-2'>
                      <Typography variant='subtitle2'>Champ {index + 1}</Typography>

                      <Box className='flex items-center gap-1'>
                        <Tooltip title='Monter'>
                          <span>
                            <IconButton size='small' onClick={() => handleMoveField(index, 'up')} disabled={index === 0}>
                              <i className='tabler-arrow-up' />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title='Descendre'>
                          <span>
                            <IconButton
                              size='small'
                              onClick={() => handleMoveField(index, 'down')}
                              disabled={index === fields.length - 1}
                            >
                              <i className='tabler-arrow-down' />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title='Supprimer'>
                          <IconButton size='small' color='error' onClick={() => handleRemoveField(index)}>
                            <i className='tabler-trash' />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Box className='flex flex-col gap-3 mt-2'>
                      <Box className='flex gap-3 flex-wrap'>
                        <TextField
                          label='Clé *'
                          value={field.key}
                          onChange={e => handleUpdateField(index, { key: e.target.value })}
                          error={!!keyError}
                          helperText={keyError}
                          sx={{ flex: 1, minWidth: 220 }}
                        />
                        <TextField
                          label='Libellé *'
                          value={field.label}
                          onChange={e => handleUpdateField(index, { label: e.target.value })}
                          error={!!labelError}
                          helperText={labelError}
                          sx={{ flex: 1, minWidth: 220 }}
                        />
                      </Box>

                      <Box className='flex gap-3 flex-wrap items-center'>
                        <FormControl sx={{ minWidth: 220 }} size='small'>
                          <InputLabel>Type de champ</InputLabel>
                          <Select
                            value={field.inputType || 'text'}
                            label='Type de champ'
                            onChange={e =>
                              handleUpdateField(index, {
                                inputType: e.target.value as any,
                                options: e.target.value === 'select' ? field.options || [] : undefined
                              })
                            }
                          >
                            {ROUTINE_SOIN_SUBTYPE_FIELD_INPUT_TYPES.map(inputType => (
                              <MenuItem key={inputType.value} value={inputType.value}>
                                {inputType.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <TextField
                          size='small'
                          label='Ordre'
                          type='number'
                          value={field.order ?? 0}
                          onChange={e => handleUpdateField(index, { order: Number(e.target.value || 0) })}
                          sx={{ width: 120 }}
                        />

                        <FormControlLabel
                          control={
                            <Switch
                              checked={!!field.required}
                              onChange={e => handleUpdateField(index, { required: e.target.checked })}
                            />
                          }
                          label='Obligatoire'
                        />
                      </Box>

                      <TextField
                        size='small'
                        label='Placeholder'
                        value={field.placeholder || ''}
                        onChange={e => handleUpdateField(index, { placeholder: e.target.value })}
                        fullWidth
                      />

                      {field.inputType === 'select' ? (
                        <TextField
                          size='small'
                          label="Options (séparées par des virgules)"
                          value={(field.options || []).join(', ')}
                          onChange={e =>
                            handleUpdateField(index, {
                              options: e.target.value
                                .split(',')
                                .map(o => o.trim())
                                .filter(Boolean)
                            })
                          }
                          fullWidth
                        />
                      ) : null}
                    </Box>
                  </Box>
                )
              })}
            </Box>
          )}

          {formErrors.submit ? <Alert severity='error'>{formErrors.submit}</Alert> : null}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disableElevation sx={{ height: 36, borderRadius: 0, textTransform: 'none', px: 2.5, color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}>Annuler</Button>
        <Button variant='contained' onClick={onSubmit} disabled={submitting}>
          {submitting ? <CircularProgress size={20} /> : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}


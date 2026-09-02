// MUI Imports
import type { Theme } from '@mui/material/styles'

const input: Theme['components'] = {
  MuiFormControl: {
    styleOverrides: {
      root: {
        '&:has(.MuiRadio-root) .MuiFormHelperText-root, &:has(.MuiCheckbox-root) .MuiFormHelperText-root, &:has(.MuiSwitch-root) .MuiFormHelperText-root':
          {
            marginInline: 0
          }
      }
    }
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        lineHeight: 1.6,
        // Police réduite pour le texte saisi et le placeholder de tous les champs.
        fontSize: '0.8125rem',
        '& input::placeholder, & textarea::placeholder': {
          fontSize: '0.8125rem'
        },
        '&.MuiInput-underline': {
          '&:before': {
            borderColor: 'var(--mui-palette-customColors-inputBorder)'
          },
          '&:not(.Mui-disabled, .Mui-error):hover:before': {
            borderColor: 'var(--mui-palette-action-active)'
          }
        },
        '&.Mui-disabled .MuiInputAdornment-root, &.Mui-disabled .MuiInputAdornment-root > *': {
          color: 'var(--mui-palette-action-disabled)'
        }
      }
    }
  },
  MuiFilledInput: {
    styleOverrides: {
      root: {
        borderStartStartRadius: 4,
        borderStartEndRadius: 4,
        '&:before': {
          borderBottom: '1px solid var(--mui-palette-text-secondary)'
        },
        '&:hover:before': {
          borderBottom: '1px solid var(--mui-palette-text-primary)'
        },
        '&.Mui-disabled:before': {
          borderBottomStyle: 'solid',
          opacity: 0.38
        }
      }
    }
  },
  MuiInputLabel: {
    styleOverrides: {
      shrink: ({ ownerState }) => ({
        ...(ownerState.variant === 'outlined' && {
          transform: 'translate(14px, -8px) scale(0.867)'
        }),
        ...(ownerState.variant === 'filled' && {
          transform: `translate(12px, ${ownerState.size === 'small' ? 4 : 7}px) scale(0.867)`
        }),
        ...(ownerState.variant === 'standard' && {
          transform: 'translate(0, -1.5px) scale(0.867)'
        })
      })
    }
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        // Style « souligné » carré : pas de contour complet, seulement une bordure basse.
        backgroundColor: 'transparent',
        borderRadius: 0,
        transition: 'border-color .15s, background-color .15s',
        '& .MuiOutlinedInput-notchedOutline': {
          borderWidth: '0 0 2px 0',
          borderRadius: 0,
          borderColor: 'var(--mui-palette-divider)'
        },
        '&:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled):hover .MuiOutlinedInput-notchedOutline': {
          borderWidth: '0 0 2px 0',
          borderColor: 'var(--mui-palette-action-active)'
        },
        '&.Mui-focused': {
          backgroundColor: 'transparent'
        },
        '&:not(.Mui-error).MuiInputBase-colorPrimary.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderWidth: '0 0 2px 0',
          borderColor: 'var(--mui-palette-primary-main)'
        },
        '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
          borderWidth: '0 0 2px 0',
          borderColor: 'var(--mui-palette-divider)'
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderWidth: '0 0 2px 0',
          borderColor: 'var(--mui-palette-error-main)'
        }
      },
      input: ({ theme, ownerState }) => ({
        ...(ownerState?.size === 'medium' && {
          '&:not(.MuiInputBase-inputMultiline, .MuiInputBase-inputAdornedStart)': {
            padding: theme.spacing(4)
          },
          height: '1.5em'
        })
      }),
      notchedOutline: {
        '& legend': {
          fontSize: '0.867em'
        }
      }
    }
  },
  MuiInputAdornment: {
    styleOverrides: {
      root: {
        color: 'var(--mui-palette-text-primary)',
        '& i, & svg': {
          fontSize: '1rem !important'
        },
        '& *': {
          color: 'inherit !important'
        }
      }
    }
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        lineHeight: 1,
        letterSpacing: 'unset'
      }
    }
  }
}

export default input

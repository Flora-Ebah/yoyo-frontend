'use client'

// React Imports
import { useEffect, useState } from 'react'

// Third-party Imports
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Underline } from '@tiptap/extension-underline'
import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import classnames from 'classnames'

// Local Imports
import FontSizeExtension from './FontSizeExtension'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

// Style Imports
import '@/libs/styles/tiptapEditor.css'

interface RichTextEditorProps {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  minHeight?: number
  error?: boolean
}

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const editorState = useEditorState({
    editor,
    selector: (ctx: { editor: Editor | null }) => {
      if (!ctx.editor) {
        return {
          isBold: false,
          isItalic: false,
          isUnderline: false,
          isStrike: false,
          isLeftAligned: true,
          isCenterAligned: false,
          isRightAligned: false,
          isJustified: false,
          isBulletList: false,
          isOrderedList: false,
          isBlockquote: false,
          isCode: false,
          isLink: false
        }
      }

      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        isUnderline: ctx.editor.isActive('underline') ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        isLeftAligned: ctx.editor.isActive({ textAlign: 'left' }) ?? false,
        isCenterAligned: ctx.editor.isActive({ textAlign: 'center' }) ?? false,
        isRightAligned: ctx.editor.isActive({ textAlign: 'right' }) ?? false,
        isJustified: ctx.editor.isActive({ textAlign: 'justify' }) ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        isBlockquote: ctx.editor.isActive('blockquote') ?? false,
        isCode: ctx.editor.isActive('code') ?? false,
        isLink: ctx.editor.isActive('link') ?? false
      }
    }
  })

  const handleInsertLink = () => {
    if (linkUrl.trim() && editor) {
      if (editor.isActive('link')) {
        (editor.chain() as any).focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
      } else {
        (editor.chain() as any).focus().insertContent(`<a href="${linkUrl}">${linkUrl}</a>`).run()
      }

      setLinkUrl('')
      setLinkDialogOpen(false)
    }
  }

  const handleRemoveLink = () => {
    if (editor) {
      (editor.chain() as any).focus().unsetLink().run()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file && file.type.startsWith('image/')) {
      setImageFile(file)

      // Créer une preview
      const reader = new FileReader()

      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
        setImageUrl(e.target?.result as string)
      }

      reader.readAsDataURL(file)
    } else {
      alert('Veuillez sélectionner un fichier image valide')
    }
  }

  const handleInsertImage = () => {
    if ((imageUrl.trim() || imagePreview) && editor) {
      const src: string = (imagePreview || imageUrl) as string

      (editor.chain() as any).focus().setImage({ src }).run()
      setImageUrl('')
      setImageFile(null)
      setImagePreview(null)
      setImageDialogOpen(false)
    }
  }

  const handleCloseImageDialog = () => {
    setImageUrl('')
    setImageFile(null)
    setImagePreview(null)
    setImageDialogOpen(false)
  }

  if (!editor || !editorState) {
    return null
  }

  return (
    <>
      <div className='flex flex-wrap gap-x-3 gap-y-1 pbs-6 pbe-4 pli-6'>
        {/* Formatage de texte */}
        <IconButton
          {...(editorState.isBold && { color: 'primary' })}
          size='small'
          onClick={() => (editor.chain() as any).focus().toggleBold().run()}
          title='Gras'
        >
          <i className={classnames('tabler-bold', { 'text-textSecondary': !editorState.isBold })} />
        </IconButton>
        <IconButton
          {...(editorState.isUnderline && { color: 'primary' })}
          size='small'
          onClick={() => (editor.chain() as any).focus().toggleUnderline().run()}
          title='Souligné'
        >
          <i className={classnames('tabler-underline', { 'text-textSecondary': !editorState.isUnderline })} />
        </IconButton>
        <IconButton
          {...(editorState.isItalic && { color: 'primary' })}
          size='small'
          onClick={() => (editor.chain() as any).focus().toggleItalic().run()}
          title='Italique'
        >
          <i className={classnames('tabler-italic', { 'text-textSecondary': !editorState.isItalic })} />
        </IconButton>
        <IconButton
          {...(editorState.isStrike && { color: 'primary' })}
          size='small'
          onClick={() => (editor.chain() as any).focus().toggleStrike().run()}
          title='Barré'
        >
          <i className={classnames('tabler-strikethrough', { 'text-textSecondary': !editorState.isStrike })} />
        </IconButton>

        <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />

        {/* Alignement */}
        <IconButton
          {...(editorState.isLeftAligned && { color: 'primary' })}
          size='small'
          onClick={() => (editor.chain() as any).focus().setTextAlign('left').run()}
          title='Aligner à gauche'
        >
          <i className={classnames('tabler-align-left', { 'text-textSecondary': !editorState.isLeftAligned })} />
        </IconButton>
        <IconButton
          {...(editorState.isCenterAligned && { color: 'primary' })}
          size='small'
          onClick={() => (editor.chain() as any).focus().setTextAlign('center').run()}
          title='Centrer'
        >
          <i
            className={classnames('tabler-align-center', {
              'text-textSecondary': !editorState.isCenterAligned
            })}
          />
        </IconButton>
        <IconButton
          {...(editorState.isRightAligned && { color: 'primary' })}
          size='small'
          onClick={() => (editor.chain() as any).focus().setTextAlign('right').run()}
          title='Aligner à droite'
        >
          <i
            className={classnames('tabler-align-right', {
              'text-textSecondary': !editorState.isRightAligned
            })}
          />
        </IconButton>
        <IconButton
          {...(editorState.isJustified && { color: 'primary' })}
          size='small'
          onClick={() => (editor.chain() as any).focus().setTextAlign('justify').run()}
          title='Justifier'
        >
          <i
            className={classnames('tabler-align-justified', {
              'text-textSecondary': !editorState.isJustified
            })}
          />
        </IconButton>

        <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />

        {/* Taille de police */}
        <FormControl size='small' sx={{ minWidth: 100 }}>
          <Select
            value={editor.getAttributes('textStyle').fontSize || 'normal'}
            onChange={(e) => {
              const fontSize = e.target.value

              if (fontSize === 'normal') {
                (editor.chain() as any).focus().unsetFontSize().run()
              } else {
                (editor.chain() as any).focus().setFontSize(fontSize).run()
              }
            }}
            sx={{
              height: '32px',
              fontSize: '0.875rem',
              '& .MuiSelect-select': {
                py: 0.5
              }
            }}
          >
            <MenuItem value='small'>Petit</MenuItem>
            <MenuItem value='normal'>Normal</MenuItem>
            <MenuItem value='large'>Grand</MenuItem>
            <MenuItem value='xlarge'>Très grand</MenuItem>
          </Select>
        </FormControl>

        <IconButton
          size='small'
          onClick={() => {
            const currentSize = editor.getAttributes('textStyle').fontSize || 'normal'
            const sizes = ['small', 'normal', 'large', 'xlarge']
            const currentIndex = sizes.indexOf(currentSize)
            const nextIndex = Math.min(currentIndex + 1, sizes.length - 1)

            if (sizes[nextIndex] === 'normal') {
              (editor.chain() as any).focus().unsetFontSize().run()
            } else {
              (editor.chain() as any).focus().setFontSize(sizes[nextIndex]).run()
            }
          }}
          title='Augmenter la taille'
        >
          <i className='tabler-arrow-up text-textSecondary' />
        </IconButton>
        <IconButton
          size='small'
          onClick={() => {
            const currentSize = editor.getAttributes('textStyle').fontSize || 'normal'
            const sizes = ['small', 'normal', 'large', 'xlarge']
            const currentIndex = sizes.indexOf(currentSize)
            const prevIndex = Math.max(currentIndex - 1, 0)

            if (sizes[prevIndex] === 'normal') {
              (editor.chain() as any).focus().unsetFontSize().run()
            } else {
              (editor.chain() as any).focus().setFontSize(sizes[prevIndex]).run()
            }
          }}
          title='Diminuer la taille'
        >
          <i className='tabler-arrow-down text-textSecondary' />
        </IconButton>

        <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />

        {/* Listes */}
        <IconButton
          {...(editorState.isBulletList && { color: 'primary' })}
          size='small'
          onClick={() => (editor.chain() as any).focus().toggleBulletList().run()}
          title='Liste à puces'
        >
          <i className={classnames('tabler-list', { 'text-textSecondary': !editorState.isBulletList })} />
        </IconButton>
        <IconButton
          {...(editorState.isOrderedList && { color: 'primary' })}
          size='small'
          onClick={() => (editor.chain() as any).focus().toggleOrderedList().run()}
          title='Liste numérotée'
        >
          <i className={classnames('tabler-list-numbers', { 'text-textSecondary': !editorState.isOrderedList })} />
        </IconButton>

        <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />

        {/* Autres */}
        <IconButton
          {...(editorState.isBlockquote && { color: 'primary' })}
          size='small'
          onClick={() => (editor.chain() as any).focus().toggleBlockquote().run()}
          title='Citation'
        >
          <i className={classnames('tabler-quote', { 'text-textSecondary': !editorState.isBlockquote })} />
        </IconButton>
        <IconButton
          {...(editorState.isCode && { color: 'primary' })}
          size='small'
          onClick={() => (editor.chain() as any).focus().toggleCode().run()}
          title='Code'
        >
          <i className={classnames('tabler-code', { 'text-textSecondary': !editorState.isCode })} />
        </IconButton>

        <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />

        {/* Lien */}
        {editorState.isLink ? (
          <IconButton
            size='small'
            onClick={handleRemoveLink}
            title='Supprimer le lien'
          >
            <i className='tabler-unlink text-textSecondary' />
          </IconButton>
        ) : (
          <IconButton
            size='small'
            onClick={() => {
              const url = editor?.getAttributes('link').href || ''

              setLinkUrl(url)
              setLinkDialogOpen(true)
            }}
            title='Insérer un lien'
          >
            <i className='tabler-link text-textSecondary' />
          </IconButton>
        )}

        {/* Image */}
        <IconButton
          size='small'
          onClick={() => setImageDialogOpen(true)}
          title='Insérer une image'
        >
          <i className='tabler-photo text-textSecondary' />
        </IconButton>
      </div>

      {/* Dialog pour insérer un lien */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Insérer un lien</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='URL'
            type='url'
            fullWidth
            variant='outlined'
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder='https://example.com'
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleInsertLink()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleInsertLink} variant='contained'>
            Insérer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour insérer une image */}
      <Dialog open={imageDialogOpen} onClose={handleCloseImageDialog} maxWidth='sm' fullWidth>
        <DialogTitle>Insérer une image</DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-4'>
            {/* Upload depuis l'explorateur */}
            <Box>
              <Typography variant='body2' className='mb-2' color='text.secondary'>
                Charger depuis l&apos;explorateur
              </Typography>
              <Button
                variant='outlined'
                component='label'
                startIcon={<i className='tabler-upload' />}
                fullWidth
              >
                Choisir un fichier
                <input
                  type='file'
                  hidden
                  accept='image/*'
                  onChange={handleFileChange}
                />
              </Button>
              {imageFile && (
                <Typography variant='caption' color='text.secondary' className='mt-1 block'>
                  Fichier sélectionné : {imageFile.name}
                </Typography>
              )}
            </Box>

            {/* Aperçu de l'image */}
            {imagePreview && (
              <Box>
                <Typography variant='body2' className='mb-2' color='text.secondary'>
                  Aperçu
                </Typography>
                <Box
                  component='img'
                  src={imagePreview}
                  alt='Preview'
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1
                  }}
                />
              </Box>
            )}

            <Divider>OU</Divider>

            {/* URL de l'image */}
            <Box>
              <Typography variant='body2' className='mb-2' color='text.secondary'>
                Ou entrer une URL
              </Typography>
              <TextField
                margin='dense'
                label='URL de l&apos;image'
                type='url'
                fullWidth
                variant='outlined'
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value)
                  setImagePreview(null)
                  setImageFile(null)
                }}
                placeholder='https://example.com/image.jpg'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInsertImage()
                  }
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog}>Annuler</Button>
          <Button
            onClick={handleInsertImage}
            variant='contained'
            disabled={!imageUrl.trim() && !imagePreview}
          >
            Insérer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Écrivez quelque chose...',
  minHeight = 200,
  error = false
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        underline: false
      }),
      TextStyle,
      FontSizeExtension,
      Placeholder.configure({
        placeholder
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'left'
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image'
        }
      })
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }: { editor: any }) => {
      if (onChange) {
        onChange(editor.getHTML())
      }
    }
  } as any)

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (!editor) {
    return null
  }

  return (
    <Card
      sx={{
        border: error ? '1px solid' : 'none',
        borderColor: error ? 'error.main' : 'transparent'
      }}
      className='shadow-none'
    >
      <CardContent className='p-0'>
        <EditorToolbar editor={editor} />
        <Divider className='mli-6' />
        <Box
          sx={{
            minHeight: `${minHeight}px`,
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          <EditorContent editor={editor} className='flex' />
        </Box>
      </CardContent>
    </Card>
  )
}






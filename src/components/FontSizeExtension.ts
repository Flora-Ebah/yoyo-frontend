import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize: (size: string) => ReturnType
      /**
       * Unset the font size
       */
      unsetFontSize: () => ReturnType
    }
  }
}

const FontSizeExtension = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle']
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }

              const sizeMap: Record<string, string> = {
                small: '0.875rem',
                normal: '1rem',
                large: '1.25rem',
                xlarge: '1.5rem'
              }

              return {
                style: `font-size: ${sizeMap[attributes.fontSize as string] || attributes.fontSize}`
              }
            }
          }
        }
      }
    ]
  },

  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain, state }) => {
        return chain()
          .setMark('textStyle', { fontSize: size })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .run()
      }
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('fontSize'),
        props: {
          handleDOMEvents: {
            keydown: (_view, event) => {
              // Permettre les raccourcis clavier pour la taille
              return false
            }
          }
        }
      })
    ]
  }
})

export default FontSizeExtension


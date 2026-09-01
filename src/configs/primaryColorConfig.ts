export type PrimaryColorConfig = {
  name?: string
  light?: string
  main: string
  dark?: string
}

// Primary color config object
const primaryColorConfig: PrimaryColorConfig[] = [
  {
    name: 'yoyo-orange',
    light: '#FF9A5A',
    main: '#FF6100',
    dark: '#C94E00'
  },
  {
    name: 'yoyo-amber',
    light: '#FFC97A',
    main: '#F59E0B',
    dark: '#B97408'
  },
  {
    name: 'yoyo-coral',
    light: '#FF8A8A',
    main: '#F97373',
    dark: '#BE4F4F'
  },
  {
    name: 'yoyo-teal',
    light: '#5AD6C6',
    main: '#14B8A6',
    dark: '#0E8A7D'
  },
  {
    name: 'yoyo-sky',
    light: '#67C8FF',
    main: '#0EA5E9',
    dark: '#0B7FB2'
  },
  {
    name: 'yoyo-navy',
    light: '#4A6387',
    main: '#1F3555',
    dark: '#172742'
  }
]

export default primaryColorConfig

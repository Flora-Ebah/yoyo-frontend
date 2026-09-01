// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'

// Data Imports
import { getHorizontalMenuData } from '../menu'

const horizontalMenuData = (): HorizontalMenuDataType[] => {
  return getHorizontalMenuData()
}

export default horizontalMenuData

// React Imports
import type { ComponentProps } from 'react'

import Image from 'next/image'

type LogoProps = Omit<ComponentProps<typeof Image>, 'src' | 'alt'> & {
  width?: number
  height?: number
}

const Logo = ({ width = 40, height = 40, className, ...props }: LogoProps) => {
  return (
    <Image
      src='/images/logo/logo-sidebar.png'
      alt='YoYo Logo'
      width={width}
      height={height}
      className={className}
      priority
      {...props}
    />
  )
}

export default Logo

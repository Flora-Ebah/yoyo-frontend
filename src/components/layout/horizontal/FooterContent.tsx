'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

// Config Imports
import { APP_CONFIG } from '@/configs/constants'

const FooterContent = () => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()

  return (
    <div
      className={classnames(horizontalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()} `}</span>
        <span className='text-primary font-medium'>{APP_CONFIG.title}</span>
        <span className='text-textSecondary'>{` v${APP_CONFIG.version}`}</span>
      </p>
      {!isBreakpointReached && (
        <div className='flex items-center gap-4'>
          <Link href='/help/documentation' className='text-primary'>
            Documentation
          </Link>
          <Link href='/help/faq' className='text-primary'>
            FAQ
          </Link>
          <Link href='/settings' className='text-primary'>
            Paramètres
          </Link>
        </div>
      )}
    </div>
  )
}

export default FooterContent


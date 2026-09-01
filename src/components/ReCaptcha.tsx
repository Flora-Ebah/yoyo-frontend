'use client'

import { useRef, useEffect } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

interface ReCaptchaProps {
  onChange?: (token: string | null) => void
  onExpired?: () => void
  onError?: () => void
  className?: string
}

export default function ReCaptcha({ onChange, onExpired, onError, className }: ReCaptchaProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  useEffect(() => {
    if (!siteKey) {
      console.warn('NEXT_PUBLIC_RECAPTCHA_SITE_KEY n\'est pas défini. reCAPTCHA ne fonctionnera pas.')
    }
  }, [siteKey])

  if (!siteKey) {
    return (
      <div className={`text-sm text-muted-foreground p-4 border border-border rounded-lg bg-muted/50 ${className || ''}`}>
        ⚠️ reCAPTCHA non configuré. Veuillez définir NEXT_PUBLIC_RECAPTCHA_SITE_KEY dans les variables d&apos;environnement.
      </div>
    )
  }

  const handleChange = (token: string | null) => {
    onChange?.(token)
  }

  const handleExpired = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
    }
    onExpired?.()
  }

  const handleError = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
    }
    onError?.()
  }

  return (
    <div className={className}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleChange}
        onExpired={handleExpired}
        onError={handleError}
        theme="light"
        size="normal"
      />
    </div>
  )
}



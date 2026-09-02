'use client'

import { getApps, initializeApp } from 'firebase/app'
import { ReCaptchaEnterpriseProvider, getLimitedUseToken, getToken, initializeAppCheck } from 'firebase/app-check'
import type { AppCheck } from 'firebase/app-check'

/**
 * App Check — attestation de l'application auprès du backend.
 *
 * Remplace la clé partagée `NEXT_PUBLIC_API_KEY`, que Next.js inline dans le bundle envoyé au
 * navigateur et que n'importe qui peut donc y lire. L'attestation est ici produite par reCAPTCHA
 * Enterprise et validée par les serveurs Google : il n'y a plus aucun secret dans le code client.
 *
 * ⚠️ Ne fonctionne que dans le navigateur. Toute importation depuis un Server Component ou une
 * Server Action lèvera — voir le dossier Instruction/APP-CHECK-ADMIN.md, section 4.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
}

let appCheckInstance: AppCheck | null = null
let initializationFailed = false

export const initAppCheck = (): AppCheck | null => {
  if (typeof window === 'undefined') return null
  if (appCheckInstance) return appCheckInstance
  if (initializationFailed) return null

  const recaptchaKey = process.env.NEXT_PUBLIC_APP_CHECK_RECAPTCHA_KEY

  if (!recaptchaKey) {
    // Sans clé reCAPTCHA Enterprise, on ne tente rien : les requêtes partiront sans attestation
    // (le backend est en mode observation, donc rien n'est rejeté).
    return null
  }

  try {
    // En développement, le jeton de débogage remplace reCAPTCHA — qui refuserait `localhost`
    // sans domaine déclaré. Doit être posé AVANT initializeAppCheck.
    if (process.env.NODE_ENV === 'development') {
      const debugToken = process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN

      if (!debugToken) {
        console.warn('[AppCheck] NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN absent : aucune attestation en local.')
      }

      // @ts-expect-error — propriété non typée, lue par le SDK au moment de l'initialisation
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken
    }

    const app = getApps()[0] ?? initializeApp(firebaseConfig)

    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaKey),
      isTokenAutoRefreshEnabled: true
    })

    return appCheckInstance
  } catch (error) {
    initializationFailed = true
    console.warn('[AppCheck] Initialisation impossible. Les requêtes partiront sans attestation.', error)

    return null
  }
}

/**
 * Renvoie un jeton d'attestation, ou `null`.
 *
 * Ne lève jamais : c'est au backend de décider quoi faire d'une requête non attestée, pas au
 * client de s'auto-bloquer.
 */
export const getAppCheckToken = async (): Promise<string | null> => {
  const instance = appCheckInstance ?? initAppCheck()

  if (!instance) return null

  try {
    const { token } = await getToken(instance)

    return token && token.length > 0 ? token : null
  } catch (error) {
    console.warn("[AppCheck] Jeton d'attestation indisponible", error)

    return null
  }
}

/**
 * Routes exigeant un jeton à usage unique (anti-rejeu). Doit rester aligné sur les routes marquées
 * `AppCheckMiddleware.verifyLimitedUse` côté backend.
 */
const LIMITED_USE_PATHS = ['/otp/verify', '/clients/updatepassword']

export const requiresLimitedUseToken = (url?: string | null): boolean => {
  if (!url) return false

  const normalized = url.toLowerCase()

  return LIMITED_USE_PATHS.some(path => normalized.includes(path))
}

/**
 * Jeton d'attestation à usage unique. Jamais mis en cache : chaque appel en produit un nouveau,
 * au prix d'un aller-retour réseau. À réserver aux routes de `LIMITED_USE_PATHS`.
 */
export const getLimitedUseAppCheckToken = async (): Promise<string | null> => {
  const instance = appCheckInstance ?? initAppCheck()

  if (!instance) return null

  try {
    const { token } = await getLimitedUseToken(instance)

    return token && token.length > 0 ? token : null
  } catch (error) {
    console.warn('[AppCheck] Jeton à usage unique indisponible', error)

    return null
  }
}

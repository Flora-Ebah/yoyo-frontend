import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { apiServer } from '@/services/api.server'
import { sessionService } from '@/services/session.service'

/**
 * Proxy d'API côté serveur.
 *
 * SÉCURITÉ (#1) : le navigateur ne détient plus le token d'accès. Le JS de la page
 * appelle `/api/proxy/<endpoint>` (même origine, sans Authorization), et CE handler —
 * exécuté côté serveur — injecte le Bearer depuis le cookie **httpOnly** `auth_token`
 * (ou un token public pour les appels non authentifiés). Il gère aussi le refresh 401.
 *
 * Le token ne transite donc jamais par `document.cookie`/localStorage : un XSS ne peut
 * plus le voler.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const API_VERSION = process.env.API_VERSION || process.env.NEXT_PUBLIC_API_VERSION || 'v1'
const API_PATH = process.env.API_PATH || process.env.NEXT_PUBLIC_API_PATH || ''
const API_BASE_PATH = API_PATH
  ? `/${API_VERSION}/${API_PATH.replace(/^\/+|\/+$/g, '')}`.replace(/\/+/g, '/')
  : `/${API_VERSION}`
const API_KEY = process.env.API_KEY || process.env.PUBLIC_API_KEY || process.env.NEXT_PUBLIC_API_KEY

const target = (path: string, search: string) => `${API_BASE_URL}${API_BASE_PATH}/${path}${search}`

/** En-tête Authorization : token de session (httpOnly) sinon token public. */
async function authHeader(skipAuth: boolean): Promise<Record<string, string>> {
  if (!skipAuth) {
    const store = await cookies()
    const token = store.get('auth_token')?.value

    if (token) return { Authorization: `Bearer ${token}` }
  }

  const publicToken = await apiServer.getPublicToken()

  return publicToken ? { Authorization: `Bearer ${publicToken}` } : {}
}

async function forward(req: NextRequest, pathParts: string[]): Promise<NextResponse> {
  const skipAuth = req.headers.get('x-proxy-skip-auth') === '1'
  const method = req.method.toUpperCase()
  const path = pathParts.map(encodeURIComponent).join('/')
  const url = target(path, req.nextUrl.search || '')

  // Corps forwardé tel quel (binaire) pour supporter JSON ET multipart (uploads de fichiers).
  const hasBody = method !== 'GET' && method !== 'HEAD'
  const body = hasBody ? await req.arrayBuffer() : undefined
  const incomingContentType = req.headers.get('content-type')

  // Attestation App Check produite par le navigateur : relayée telle quelle vers le backend.
  const appCheckToken = req.headers.get('x-firebase-appcheck')

  const doFetch = async () => {
    const headers: Record<string, string> = {
      // On préserve le Content-Type entrant (avec la boundary multipart le cas échéant).
      ...(incomingContentType ? { 'Content-Type': incomingContentType } : {}),
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
      ...(appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } : {}),
      ...(await authHeader(skipAuth))
    }

    return fetch(url, { method, headers, body, cache: 'no-store' })
  }

  let res = await doFetch()

  // Refresh transparent sur 401 (le refresh_token httpOnly reste côté serveur).
  if (res.status === 401 && !skipAuth) {
    try {
      const refreshed = await sessionService.refreshSession()

      if (refreshed) res = await doFetch()
    } catch {
      /* on renvoie le 401 tel quel ci-dessous */
    }
  }

  const respText = await res.text()
  const out = new NextResponse(respText, { status: res.status })
  const ct = res.headers.get('content-type')

  if (ct) out.headers.set('content-type', ct)

  return out
}

type Ctx = { params: Promise<{ path: string[] }> }

const handler = async (req: NextRequest, ctx: Ctx) => {
  const { path } = await ctx.params

  return forward(req, path || [])
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler

export const dynamic = 'force-dynamic'

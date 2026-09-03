import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
        locale: false
      },
      // Les manuels sont des fichiers statiques dans `public/manuels/`. Next.js ne sert pas
      // automatiquement l'index d'un dossier (contrairement à Vercel) : on redirige donc le
      // dossier vers son fichier d'accueil pour que `/manuels` fonctionne en auto-hébergé (cmsdev).
      {
        source: '/manuels',
        destination: '/manuels/index.html',
        permanent: false,
        locale: false
      }
    ]
  }
}

export default nextConfig

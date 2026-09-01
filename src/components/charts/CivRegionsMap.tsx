'use client'

import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

/** Point renvoyé par le backend (GET /partners/geo-distribution). */
type GeoPoint = { ville: string; pros: number; lat: number | null; lng: number | null }

/** Point interne prêt à afficher (coordonnées résolues). */
type ResolvedPoint = { name: string; lat: number; lng: number; pros: number }

type Props = {
  /** Points réels issus du backend ; si vide, la carte affiche un jeu de démonstration. */
  points?: GeoPoint[]
}

// Coordonnées de référence des principales villes / communes de Côte d'Ivoire.
// Sert de repli quand un partenaire n'a pas de latitude/longitude propre.
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  cocody: { lat: 5.36, lng: -3.99 },
  'cocody (abidjan)': { lat: 5.36, lng: -3.99 },
  yopougon: { lat: 5.33, lng: -4.07 },
  'yopougon (abidjan)': { lat: 5.33, lng: -4.07 },
  abobo: { lat: 5.42, lng: -4.02 },
  'abobo (abidjan)': { lat: 5.42, lng: -4.02 },
  plateau: { lat: 5.32, lng: -4.02 },
  'plateau (abidjan)': { lat: 5.32, lng: -4.02 },
  marcory: { lat: 5.3, lng: -3.98 },
  'marcory (abidjan)': { lat: 5.3, lng: -3.98 },
  treichville: { lat: 5.29, lng: -4.0 },
  'treichville (abidjan)': { lat: 5.29, lng: -4.0 },
  adjame: { lat: 5.36, lng: -4.02 },
  koumassi: { lat: 5.29, lng: -3.95 },
  'port-bouet': { lat: 5.26, lng: -3.93 },
  'port bouet': { lat: 5.26, lng: -3.93 },
  attecoube: { lat: 5.34, lng: -4.04 },
  abidjan: { lat: 5.35, lng: -4.01 },
  bouake: { lat: 7.69, lng: -5.03 },
  'bouaké': { lat: 7.69, lng: -5.03 },
  yamoussoukro: { lat: 6.82, lng: -5.28 },
  'san-pedro': { lat: 4.75, lng: -6.64 },
  'san-pédro': { lat: 4.75, lng: -6.64 },
  'san pedro': { lat: 4.75, lng: -6.64 },
  korhogo: { lat: 9.46, lng: -5.63 },
  daloa: { lat: 6.88, lng: -6.45 },
  man: { lat: 7.41, lng: -7.55 },
  gagnoa: { lat: 6.13, lng: -5.95 },
  abengourou: { lat: 6.73, lng: -3.49 },
  divo: { lat: 5.84, lng: -5.36 },
  anyama: { lat: 5.49, lng: -4.05 },
  grand: { lat: 5.14, lng: -5.02 },
  'grand-bassam': { lat: 5.21, lng: -3.74 },
  bingerville: { lat: 5.35, lng: -3.89 }
}

// Jeu de démonstration (affiché uniquement en l'absence de données réelles exploitables).
const DEMO_POINTS: ResolvedPoint[] = [
  { name: 'Cocody (Abidjan)', lat: 5.36, lng: -3.99, pros: 68 },
  { name: 'Yopougon (Abidjan)', lat: 5.33, lng: -4.07, pros: 52 },
  { name: 'Plateau (Abidjan)', lat: 5.32, lng: -4.02, pros: 41 },
  { name: 'Bouaké', lat: 7.69, lng: -5.03, pros: 37 },
  { name: 'Yamoussoukro', lat: 6.82, lng: -5.28, pros: 24 },
  { name: 'San-Pédro', lat: 4.75, lng: -6.64, pros: 19 }
]

function resolvePoints(points?: GeoPoint[]): { data: ResolvedPoint[]; isDemo: boolean } {
  if (!points || points.length === 0) {
    return { data: DEMO_POINTS, isDemo: true }
  }

  const resolved: ResolvedPoint[] = []

  for (const p of points) {
    let lat = typeof p.lat === 'number' && !isNaN(p.lat) && p.lat !== 0 ? p.lat : null
    let lng = typeof p.lng === 'number' && !isNaN(p.lng) && p.lng !== 0 ? p.lng : null

    if (lat === null || lng === null) {
      const key = (p.ville || '').trim().toLowerCase()
      const coords = CITY_COORDS[key]

      if (coords) {
        lat = coords.lat
        lng = coords.lng
      }
    }

    if (lat !== null && lng !== null) {
      resolved.push({ name: p.ville || 'Ville', lat, lng, pros: p.pros })
    }
  }

  // Aucune coordonnée exploitable : on retombe sur la démo pour ne pas afficher une carte vide.
  if (resolved.length === 0) {
    return { data: DEMO_POINTS, isDemo: true }
  }

  return { data: resolved, isDemo: false }
}

export default function CivRegionsMap({ points }: Props) {
  const { data } = resolvePoints(points)
  const max = Math.max(1, ...data.map(p => p.pros))

  const radiusFor = (pros: number) => 8 + (pros / max) * 22

  return (
    <MapContainer
      center={[6.9, -5.3]}
      zoom={7}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', background: 'transparent' }}
      attributionControl={false}
    >
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' attribution='&copy; OpenStreetMap' />
      {data.map(p => (
        <CircleMarker
          key={p.name}
          center={[p.lat, p.lng]}
          radius={radiusFor(p.pros)}
          pathOptions={{ color: '#FF6100', fillColor: '#FF6100', fillOpacity: 0.35, weight: 1.5 }}
        >
          <Tooltip direction='top' offset={[0, -4]} opacity={1}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>{p.name}</div>
            <div>
              {p.pros} {p.pros > 1 ? 'pros' : 'pro'}
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}

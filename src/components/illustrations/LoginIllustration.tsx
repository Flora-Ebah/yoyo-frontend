'use client'

// React Imports
import { useMemo } from 'react'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

interface LoginIllustrationProps {
  className?: string
}

const LoginIllustration = ({ className }: LoginIllustrationProps) => {
  const { settings } = useSettings()
  const isDark = settings.mode === 'dark'

  // Couleurs adaptées au thème
  const colors = useMemo(() => {
    if (isDark) {
      return {
        primary: '#3b82f6', // Bleu
        secondary: '#8b5cf6', // Violet
        accent: '#10b981', // Vert
        success: '#22c55e',
        warning: '#f59e0b',
        card: 'rgba(15, 23, 42, 0.85)',
        cardLight: 'rgba(30, 41, 59, 0.6)',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        glow: 'rgba(59, 130, 246, 0.3)'
      }
    }
    return {
      primary: '#3b82f6', // Bleu
      secondary: '#8b5cf6', // Violet
      accent: '#10b981', // Vert
      success: '#22c55e',
      warning: '#f59e0b',
      card: 'rgba(255, 255, 255, 0.95)',
      cardLight: 'rgba(248, 250, 252, 0.8)',
      text: '#1e293b',
      textSecondary: '#475569',
      glow: 'rgba(59, 130, 246, 0.2)'
    }
  }, [isDark])

  return (
    <svg
      viewBox='0 0 800 600'
      className={className}
      xmlns='http://www.w3.org/2000/svg'
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      <defs>
        {/* Gradients pour les éléments */}
        <linearGradient id='controller-gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor={colors.primary} stopOpacity='0.9' />
          <stop offset='100%' stopColor={colors.secondary} stopOpacity='0.9' />
        </linearGradient>
        <linearGradient id='trophy-gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#fbbf24' stopOpacity='1' />
          <stop offset='50%' stopColor='#f59e0b' stopOpacity='1' />
          <stop offset='100%' stopColor='#d97706' stopOpacity='1' />
        </linearGradient>
        <linearGradient id='rank-gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor={colors.primary} stopOpacity='0.4' />
          <stop offset='100%' stopColor={colors.secondary} stopOpacity='0.4' />
        </linearGradient>

        {/* Effets de glow */}
        <filter id='glow'>
          <feGaussianBlur stdDeviation='3' result='coloredBlur' />
          <feMerge>
            <feMergeNode in='coloredBlur' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>

        {/* Ombre portée */}
        <filter id='shadow' x='-50%' y='-50%' width='200%' height='200%'>
          <feDropShadow dx='0' dy='4' stdDeviation='8' floodColor={isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.15)'} />
        </filter>
      </defs>

      {/* Éléments décoratifs en arrière-plan - plus subtils */}
      <circle cx='120' cy='120' r='80' fill={colors.primary} opacity='0.08' />
      <circle cx='680' cy='480' r='100' fill={colors.secondary} opacity='0.08' />
      <circle cx='650' cy='120' r='50' fill={colors.accent} opacity='0.08' />
      <circle cx='200' cy='500' r='60' fill={colors.warning} opacity='0.08' />

      {/* Contrôleur de jeu moderne (gauche) */}
      <g transform='translate(120, 180)' filter='url(#shadow)'>
        {/* Ombre du contrôleur */}
        <ellipse cx='60' cy='100' rx='70' ry='20' fill='rgba(0, 0, 0, 0.1)' opacity='0.3' />

        {/* Poignées gauche */}
        <ellipse cx='-20' cy='60' rx='22' ry='40' fill={colors.card} stroke={colors.primary} strokeWidth='2.5' />
        <ellipse cx='-20' cy='60' rx='18' ry='35' fill={colors.cardLight} />

        {/* Corps principal */}
        <rect x='0' y='20' width='140' height='90' rx='18' fill={colors.card} stroke={colors.primary} strokeWidth='2.5' />
        <rect x='5' y='25' width='130' height='80' rx='15' fill={colors.cardLight} />

        {/* Boutons colorés */}
        <circle cx='35' cy='50' r='10' fill={colors.primary} opacity='0.8' filter='url(#glow)' />
        <circle cx='35' cy='50' r='6' fill='white' opacity='0.6' />
        <circle cx='60' cy='50' r='10' fill={colors.secondary} opacity='0.8' filter='url(#glow)' />
        <circle cx='60' cy='50' r='6' fill='white' opacity='0.6' />
        <circle cx='85' cy='50' r='10' fill={colors.accent} opacity='0.8' filter='url(#glow)' />
        <circle cx='85' cy='50' r='6' fill='white' opacity='0.6' />
        <circle cx='110' cy='50' r='10' fill={colors.warning} opacity='0.8' filter='url(#glow)' />
        <circle cx='110' cy='50' r='6' fill='white' opacity='0.6' />

        {/* D-pad amélioré */}
        <g transform='translate(30, 75)'>
          <rect x='-8' y='-8' width='16' height='16' rx='3' fill={colors.primary} opacity='0.5' />
          <rect x='-6' y='-6' width='12' height='12' rx='2' fill={colors.primary} opacity='0.7' />
          <line x1='0' y1='-10' x2='0' y2='10' stroke={colors.primary} strokeWidth='2' opacity='0.8' />
          <line x1='-10' y1='0' x2='10' y2='0' stroke={colors.primary} strokeWidth='2' opacity='0.8' />
        </g>

        {/* Joysticks améliorés */}
        <g transform='translate(85, 85)'>
          <circle cx='0' cy='0' r='14' fill={colors.secondary} opacity='0.6' />
          <circle cx='0' cy='0' r='10' fill={colors.card} stroke={colors.secondary} strokeWidth='2' />
          <circle cx='0' cy='0' r='5' fill={colors.secondary} opacity='0.8' />
        </g>

        {/* Poignées droite */}
        <ellipse cx='160' cy='60' rx='22' ry='40' fill={colors.card} stroke={colors.primary} strokeWidth='2.5' />
        <ellipse cx='160' cy='60' rx='18' ry='35' fill={colors.cardLight} />
      </g>

      {/* Trophée élégant (centre) */}
      <g transform='translate(380, 120)' filter='url(#shadow)'>
        {/* Base du trophée avec ombre */}
        <ellipse cx='0' cy='140' rx='35' ry='8' fill='rgba(0, 0, 0, 0.2)' opacity='0.3' />
        <rect x='-35' y='130' width='70' height='25' rx='8' fill={colors.card} stroke='#fbbf24' strokeWidth='2.5' />
        <rect x='-30' y='135' width='60' height='15' rx='5' fill='url(#trophy-gradient)' opacity='0.3' />

        {/* Corps du trophée avec dégradé */}
        <path
          d='M 0 130 L -25 85 L -25 45 L -12 45 L -12 25 L 12 25 L 12 45 L 25 45 L 25 85 Z'
          fill='url(#trophy-gradient)'
          stroke='#d97706'
          strokeWidth='2.5'
        />
        <path
          d='M 0 130 L -20 90 L -20 50 L -10 50 L -10 30 L 10 30 L 10 50 L 20 50 L 20 90 Z'
          fill='#fbbf24'
          opacity='0.6'
        />

        {/* Poignées élégantes */}
        <ellipse cx='-30' cy='65' rx='10' ry='28' fill='url(#trophy-gradient)' />
        <ellipse cx='30' cy='65' rx='10' ry='28' fill='url(#trophy-gradient)' />
        <ellipse cx='-30' cy='65' rx='6' ry='20' fill='#fbbf24' opacity='0.7' />
        <ellipse cx='30' cy='65' rx='6' ry='20' fill='#fbbf24' opacity='0.7' />

        {/* Étoile brillante au sommet */}
        <g transform='translate(0, 25)'>
          <path
            d='M 0 -15 L 4 -5 L 14 -5 L 6 2 L 9 12 L 0 7 L -9 12 L -6 2 L -14 -5 L -4 -5 Z'
            fill='#fbbf24'
            filter='url(#glow)'
          />
          <path
            d='M 0 -12 L 3 -4 L 11 -4 L 5 1 L 7 9 L 0 5 L -7 9 L -5 1 L -11 -4 L -3 -4 Z'
            fill='#fef3c7'
            opacity='0.8'
          />
        </g>
      </g>

      {/* Carte de classement moderne (droite) */}
      <g transform='translate(520, 160)' filter='url(#shadow)'>
        {/* Carte principale */}
        <rect x='0' y='0' width='200' height='220' rx='16' fill={colors.card} stroke={colors.primary} strokeWidth='2.5' />
        <rect x='3' y='3' width='194' height='214' rx='14' fill={colors.cardLight} />

        {/* En-tête avec gradient */}
        <rect x='0' y='0' width='200' height='45' rx='16' fill='url(#rank-gradient)' />
        <rect x='0' y='0' width='200' height='45' rx='16' fill={colors.primary} opacity='0.2' />
        <text x='100' y='32' textAnchor='middle' fill={colors.text} fontSize='18' fontWeight='bold' fontFamily='system-ui, sans-serif'>
          Classement
        </text>

        {/* Top 3 avec médailles */}
        {[
          { pos: 1, medal: '#fbbf24', name: 'Champion', pts: 1250 },
          { pos: 2, medal: '#94a3b8', name: 'Vice-Champ', pts: 1180 },
          { pos: 3, medal: '#cd7f32', name: 'Troisième', pts: 1120 }
        ].map((player, i) => (
          <g key={player.pos} transform={`translate(15, ${65 + i * 45})`}>
            {/* Médaille */}
            <circle cx='18' cy='18' r='16' fill={player.medal} filter='url(#glow)' />
            <circle cx='18' cy='18' r='12' fill='white' opacity='0.3' />
            <text x='18' y='23' textAnchor='middle' fill='white' fontSize='14' fontWeight='bold' fontFamily='system-ui, sans-serif'>
              {player.pos}
            </text>

            {/* Barre de progression */}
            <rect x='40' y='8' width='130' height='20' rx='6' fill={colors.cardLight} />
            <rect x='42' y='10' width={`${(player.pts / 1250) * 126}`} height='16' rx='4' fill={colors.primary} opacity='0.6' />

            {/* Nom et points */}
            <text x='45' y='22' fill={colors.text} fontSize='13' fontWeight='600' fontFamily='system-ui, sans-serif'>
              {player.name}
            </text>
            <text x='165' y='22' textAnchor='end' fill={colors.primary} fontSize='13' fontWeight='bold' fontFamily='system-ui, sans-serif'>
              {player.pts} pts
            </text>
          </g>
        ))}
      </g>

      {/* Bracket de tournoi moderne (bas) */}
      <g transform='translate(180, 420)' filter='url(#shadow)'>
        {/* Lignes du bracket avec gradient */}
        <defs>
          <linearGradient id='bracket-gradient' x1='0%' y1='0%' x2='100%' y2='0%'>
            <stop offset='0%' stopColor={colors.primary} stopOpacity='0.8' />
            <stop offset='100%' stopColor={colors.secondary} stopOpacity='0.8' />
          </linearGradient>
        </defs>

        {/* Matchs du premier tour */}
        <line x1='0' y1='0' x2='0' y2='70' stroke='url(#bracket-gradient)' strokeWidth='4' strokeLinecap='round' />
        <line x1='0' y1='35' x2='110' y2='35' stroke='url(#bracket-gradient)' strokeWidth='4' strokeLinecap='round' />
        <line x1='110' y1='0' x2='110' y2='70' stroke='url(#bracket-gradient)' strokeWidth='4' strokeLinecap='round' />
        <line x1='110' y1='35' x2='220' y2='20' stroke={colors.secondary} strokeWidth='4' strokeLinecap='round' />
        <line x1='220' y1='0' x2='220' y2='40' stroke={colors.secondary} strokeWidth='4' strokeLinecap='round' />

        {/* Cercles pour les matchs avec glow */}
        <circle cx='0' cy='0' r='10' fill={colors.primary} filter='url(#glow)' />
        <circle cx='0' cy='70' r='10' fill={colors.primary} filter='url(#glow)' />
        <circle cx='110' cy='0' r='10' fill={colors.primary} filter='url(#glow)' />
        <circle cx='110' cy='70' r='10' fill={colors.primary} filter='url(#glow)' />
        <circle cx='220' cy='20' r='12' fill={colors.secondary} filter='url(#glow)' />
        <circle cx='220' cy='20' r='7' fill='white' opacity='0.8' />
      </g>

      {/* Particules décoratives flottantes */}
      {[1, 2, 3, 4, 5, 6].map((i) => {
        const x = 50 + (i % 3) * 250
        const y = 80 + Math.floor(i / 3) * 200
        const size = 4 + (i % 2) * 2
        return (
          <g key={i} transform={`translate(${x}, ${y})`}>
            <circle cx='0' cy='0' r={size} fill={colors.primary} opacity='0.4' filter='url(#glow)' />
            <circle cx='0' cy='0' r={size * 0.6} fill='white' opacity='0.6' />
          </g>
        )
      })}

      {/* Lignes de connexion décoratives */}
      <path
        d='M 100 200 Q 400 100 700 250'
        fill='none'
        stroke={colors.primary}
        strokeWidth='2'
        strokeDasharray='5,5'
        opacity='0.2'
      />
      <path
        d='M 150 400 Q 400 350 650 450'
        fill='none'
        stroke={colors.secondary}
        strokeWidth='2'
        strokeDasharray='5,5'
        opacity='0.2'
      />
    </svg>
  )
}

export default LoginIllustration

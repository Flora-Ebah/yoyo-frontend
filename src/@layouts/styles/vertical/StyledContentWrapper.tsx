'use client'

// Third-party Imports
import styled from '@emotion/styled'

// Util Imports
import { commonLayoutClasses, verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const StyledContentWrapper = styled.div`
  &:has(.${verticalLayoutClasses.content}>.${commonLayoutClasses.contentHeightFixed}) {
    max-block-size: 100dvh;
  }

  /* Sur téléphone : pas d'arrondi côté gauche → le header/contenu collent au bord. */
  @media (max-width: 600px) {
    border-start-start-radius: 0 !important;
    border-end-start-radius: 0 !important;
    border-inline-start: none !important;
  }
`

export default StyledContentWrapper

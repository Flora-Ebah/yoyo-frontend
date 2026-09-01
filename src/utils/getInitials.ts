/**
 * Retourne les initiales d'une chaîne de caractères
 * Pour les noms complets : première lettre du prénom + première lettre du nom de famille
 * @param string - La chaîne de caractères (ex: "John Doe" ou "Jean Pierre Martin")
 * @returns Les initiales en majuscules (ex: "JD" ou "JM")
 */
export const getInitials = (string: string): string => {
  if (!string || string.trim() === '') {
    return ''
  }

  const words = string.trim().split(/\s+/).filter(word => word.length > 0)

  if (words.length === 0) {
    return ''
  }

  if (words.length === 1) {
    // Si un seul mot, retourner la première lettre
    return words[0].charAt(0).toUpperCase()
  }

  // Si plusieurs mots, retourner la première lettre du premier mot et la première lettre du dernier mot
  const firstInitial = words[0].charAt(0).toUpperCase()
  const lastInitial = words[words.length - 1].charAt(0).toUpperCase()

  return `${firstInitial}${lastInitial}`
}

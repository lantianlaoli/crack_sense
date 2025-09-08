export interface FormattedSection {
  header: string
  content: string
}

// Format the crack cause string into titled sections if possible
export const formatCrackCause = (crackCause: string | undefined | null): FormattedSection[] => {
  if (!crackCause) return []

  const sectionRegex = /(\d+\)\s+[A-Z\s]+:)/g
  const parts = crackCause.split(sectionRegex).filter(part => part.trim())

  const sections: FormattedSection[] = []
  for (let i = 0; i < parts.length; i += 2) {
    if (parts[i] && parts[i + 1]) {
      sections.push({ header: parts[i].trim(), content: parts[i + 1].trim() })
    }
  }

  return sections.length > 0
    ? sections
    : [{ header: '', content: crackCause.trim() }]
}


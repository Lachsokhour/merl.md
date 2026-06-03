export interface FontOption {
  name: string
  weights?: string
}

export const ENGLISH_FONTS: FontOption[] = [
  { name: 'Inter', weights: '300;400;600;700' },
  { name: 'Roboto', weights: '300;400;500;700' },
  { name: 'Poppins', weights: '300;400;600;700' },
  { name: 'Open Sans', weights: '300;400;600;700' },
  { name: 'Lato', weights: '300;400;700;900' },
  { name: 'Montserrat', weights: '300;400;600;700' },
  { name: 'Noto Sans', weights: '300;400;600;700' },
  { name: 'Source Sans 3', weights: '300;400;600;700' },
  { name: 'Nunito', weights: '300;400;600;700' },
  { name: 'Quicksand', weights: '300;400;600;700' },
  { name: 'Work Sans', weights: '300;400;600;700' },
  { name: 'DM Sans', weights: '300;400;500;700' },
  { name: 'Karla', weights: '300;400;600;700' },
]

export const KHMER_FONTS: FontOption[] = [
  { name: 'Noto Sans Khmer', weights: '400;500;600;700' },
  { name: 'Google Sans', weights: '400;500;700' },
  { name: 'Kantumruy Pro', weights: '300;400;500;600;700' },
  { name: 'Koh Santepheap', weights: '400;700;900' },
  { name: 'Battambang', weights: '400;700;900' },
  { name: 'Moul', weights: '400' },
  { name: 'Bayon', weights: '400' },
  { name: 'Suwannaphum', weights: '400;700;900' },
  { name: 'Content', weights: '400;700' },
  { name: 'Siemreap', weights: '400' },
  { name: 'Freehand', weights: '400' },
  { name: 'Nokora', weights: '400;700' },
  { name: 'Preah Vihear', weights: '400' },
  { name: 'Hanuman', weights: '400;700' },
  { name: 'Metal', weights: '400' },
  { name: 'Dangrek', weights: '400' },
  { name: 'Moulpali', weights: '400' },
]

export function buildGoogleFontsUrl(english: string, khmer: string): string {
  const enc = (s: string) => s.replace(/ /g, '+')
  const fmt = (name: string, weights?: string) => {
    const w = weights ? `:wght@${weights}` : ''
    return `family=${enc(name)}${w}`
  }
  const enW = ENGLISH_FONTS.find(f => f.name === english)?.weights || '400;600;700'
  const khW = KHMER_FONTS.find(f => f.name === khmer)?.weights || '400;600;700'
  return `https://fonts.googleapis.com/css2?${fmt(english, enW)}&${fmt(khmer, khW)}&display=swap`
}

/**
 * MotoStore brand logo — v1.0 brand guidelines.
 * Znak: tri ubrzavajuće kose linije ("acceleration stripes") + kondenzovan wordmark.
 * Varijante: full (znak + wordmark), mark (samo znak / favicon), stacked.
 */

// Znak — tri kose linije rastuće visine, nagib udesno (ubrzanje)
export function LogoMark({ size = 24, color = '#FF4B1F' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* tri stripes: kraća -> duža, iskošene 12° */}
      <path d="M6 24 L9.5 24 L12 13 L8.5 13 Z" fill={color} />
      <path d="M13 24 L16.5 24 L19.5 9 L16 9 Z" fill={color} />
      <path d="M20 24 L23.5 24 L27 5 L23.5 5 Z" fill={color} />
    </svg>
  )
}

interface LogoProps {
  /** full = znak + MOTOSTORE.RS · mark = samo znak · stacked = znak iznad teksta */
  variant?: 'full' | 'mark' | 'stacked'
  /** dark = za tamnu pozadinu (off-white tekst) · light = za svetlu (ink tekst) · mono = jednobojno */
  scheme?: 'dark' | 'light' | 'mono-black' | 'mono-white'
  /** visina znaka u px */
  size?: number
  showTld?: boolean
}

export default function Logo({ variant = 'full', scheme = 'dark', size = 26, showTld = true }: LogoProps) {
  const markColor =
    scheme === 'mono-black' ? '#0B0B10' : scheme === 'mono-white' ? '#FFFFFF' : '#FF4B1F'
  const textColor =
    scheme === 'dark' || scheme === 'mono-white' ? '#F6F4F1' : '#0B0B10'
  const dimColor =
    scheme === 'dark' || scheme === 'mono-white' ? 'rgba(246,244,241,0.45)' : 'rgba(11,11,16,0.45)'

  const wordmark = (
    <span
      style={{
        fontFamily: "'Barlow Condensed', 'Oswald', 'Arial Narrow', sans-serif",
        fontWeight: 800,
        fontSize: size * 0.92,
        letterSpacing: '0.02em',
        lineHeight: 1,
        color: textColor,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      MOTO<span style={{ color: scheme.startsWith('mono') ? textColor : '#FF4B1F' }}>STORE</span>
      {showTld && <span style={{ color: dimColor, fontWeight: 600 }}>.RS</span>}
    </span>
  )

  if (variant === 'mark') return <LogoMark size={size} color={markColor} />

  if (variant === 'stacked') {
    return (
      <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.25 }}>
        <LogoMark size={size * 1.4} color={markColor} />
        {wordmark}
      </span>
    )
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.35 }}>
      <LogoMark size={size} color={markColor} />
      {wordmark}
    </span>
  )
}

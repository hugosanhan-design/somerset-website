import { SomersetIcon, type IconName, type IconVariant } from '@/components/SomersetIcon'

export type { IconName }

// Spanish for Expats uses the Sello style; tiny inline marks use the line style.
export function Icon({ name, size = 24, variant = 'sello', className, title }: {
  name: IconName; size?: number; variant?: IconVariant; className?: string; title?: string
}) {
  return <SomersetIcon name={name} size={size} variant={variant} className={className} title={title} />
}

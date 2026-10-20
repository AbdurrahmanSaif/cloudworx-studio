import { Archive, Cog, MoveHorizontal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'
import { EQUIPMENT } from '../../lib/catalog'
import type { ItemType } from '../../types'

export const TYPE_ICONS: Record<ItemType, LucideIcon> = {
  cabinet: Archive,
  motor: Cog,
  conveyor: MoveHorizontal,
}

type GlyphSize = 'xs' | 'sm' | 'md' | 'lg'

export function EquipmentGlyph({
  type,
  size = 'md',
}: {
  type: ItemType
  size?: GlyphSize
}) {
  const Icon = TYPE_ICONS[type]
  const color = EQUIPMENT[type].color
  const style = {
    color,
    backgroundColor: `${color}1c`,
    borderColor: `${color}30`,
  } as CSSProperties

  return (
    <span
      aria-hidden="true"
      className={`equipment-glyph equipment-glyph--${size}`}
      style={style}
    >
      <Icon />
    </span>
  )
}

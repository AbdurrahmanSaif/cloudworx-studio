import type { ItemType, LayoutItem } from '../types'

export function typeLabel(type: ItemType): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export function itemDisplayName(item: LayoutItem): string {
  return `${typeLabel(item.type)} ${item.seq}`
}

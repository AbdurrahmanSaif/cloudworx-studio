import { describe, expect, it } from 'vitest'
import type { LayoutItem } from '../types'
import { itemDisplayName, t, typeLabel } from './i18n'

describe('t', () => {
  it('returns English strings for the en locale', () => {
    expect(t('en', 'toolbar.undo')).toBe('Undo')
    expect(t('en', 'type.cabinet')).toBe('Cabinet')
  })

  it('returns Vietnamese strings for the vi locale', () => {
    expect(t('vi', 'toolbar.undo')).toBe('Hoàn tác')
    expect(t('vi', 'type.cabinet')).toBe('Tủ điện')
  })

  it('interpolates parameters', () => {
    expect(t('en', 'toolbar.placing', { type: 'Motor' })).toBe(
      'Placing: Motor',
    )
    expect(t('vi', 'toolbar.placing', { type: 'Động cơ' })).toBe(
      'Đang đặt: Động cơ',
    )
    expect(t('en', 'toolbar.items.other', { n: 5 })).toBe('5 items')
  })

  it('leaves unknown placeholders untouched', () => {
    expect(t('en', 'toolbar.placing', {})).toBe('Placing: {type}')
  })

  it('falls back to the key for unknown messages', () => {
    expect(t('en', 'does.not.exist' as never)).toBe('does.not.exist')
  })
})

describe('typeLabel / itemDisplayName', () => {
  it('localises type labels', () => {
    expect(typeLabel('motor', 'en')).toBe('Motor')
    expect(typeLabel('motor', 'vi')).toBe('Động cơ')
  })

  it('composes a localised item name with the sequence number', () => {
    const item: LayoutItem = {
      id: 'x',
      type: 'cabinet',
      seq: 3,
      position: { x: 0, z: 0 },
      rotation: 0,
    }
    expect(itemDisplayName(item, 'en')).toBe('Cabinet 3')
    expect(itemDisplayName(item, 'vi')).toBe('Tủ điện 3')
  })
})

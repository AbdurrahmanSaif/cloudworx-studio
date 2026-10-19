import { useEditorStore } from '../store/editorStore'
import type { ItemType, Lang, LayoutItem } from '../types'

const en = {
  'type.cabinet': 'Cabinet',
  'type.motor': 'Motor',
  'type.conveyor': 'Conveyor',

  'section.palette': 'Palette',
  'section.items': 'Placed items',
  'section.props': 'Properties',
  'section.rules': 'Rule warnings',
  'section.bom': 'Bill of materials',

  'toolbar.undo': 'Undo',
  'toolbar.redo': 'Redo',
  'toolbar.rotate': 'Rotate 90°',
  'toolbar.delete': 'Delete',
  'toolbar.placing': 'Placing: {type}',
  'toolbar.items.one': '{n} item',
  'toolbar.items.other': '{n} items',

  'palette.hint.pick': 'Pick a type, then click the floor. Drag items to move them.',
  'palette.hint.placing': 'Click the floor to place {type} — Esc to cancel.',

  'list.empty':
    'Nothing placed yet. Pick a type in the palette, then click the floor.',
  'list.violationAria': 'Clearance violation',

  'props.empty':
    'Select an item in the viewport or the list to edit its properties.',
  'props.name': 'Name',
  'props.posX': 'X (m)',
  'props.posZ': 'Z (m)',
  'props.snapHint':
    'Values snap to 0.5 m and stay inside the floor. Apply with Enter or by leaving the field.',
  'props.rotation': 'Rotation',
  'props.type': 'Type',
  'props.rotate': 'Rotate 90°',
  'props.delete': 'Delete',

  'rules.empty':
    'No clearance violations. Any two items whose centres are closer than 0.6 m are highlighted in red and listed here.',
  'rules.count.one': '{n} violation',
  'rules.count.other': '{n} violations',
  'rules.detail': 'centres {d} m apart · limit 0.60 m · click to select',

  'bom.type': 'Type',
  'bom.qty': 'Qty',
  'bom.total': 'Total',
  'bom.empty': 'No items placed yet.',

  'lang.aria': 'Language',
} as const

export type MessageKey = keyof typeof en

const vi: Record<MessageKey, string> = {
  'type.cabinet': 'Tủ điện',
  'type.motor': 'Động cơ',
  'type.conveyor': 'Băng chuyền',

  'section.palette': 'Bộ chọn thiết bị',
  'section.items': 'Thiết bị đã đặt',
  'section.props': 'Thuộc tính',
  'section.rules': 'Cảnh báo quy tắc',
  'section.bom': 'Bảng vật tư',

  'toolbar.undo': 'Hoàn tác',
  'toolbar.redo': 'Làm lại',
  'toolbar.rotate': 'Xoay 90°',
  'toolbar.delete': 'Xóa',
  'toolbar.placing': 'Đang đặt: {type}',
  'toolbar.items.one': '{n} thiết bị',
  'toolbar.items.other': '{n} thiết bị',

  'palette.hint.pick':
    'Chọn một loại, rồi nhấp vào sàn để đặt. Kéo thiết bị để di chuyển.',
  'palette.hint.placing': 'Nhấp vào sàn để đặt {type} — Esc để hủy.',

  'list.empty':
    'Chưa có thiết bị nào. Chọn loại ở bảng bên trái, rồi nhấp vào sàn.',
  'list.violationAria': 'Vi phạm khoảng cách',

  'props.empty': 'Chọn một thiết bị trong khung nhìn hoặc danh sách để chỉnh sửa.',
  'props.name': 'Tên',
  'props.posX': 'X (m)',
  'props.posZ': 'Z (m)',
  'props.snapHint':
    'Giá trị làm tròn về lưới 0,5 m và luôn nằm trong sàn. Nhấn Enter hoặc rời ô để áp dụng.',
  'props.rotation': 'Góc xoay',
  'props.type': 'Loại',
  'props.rotate': 'Xoay 90°',
  'props.delete': 'Xóa',

  'rules.empty':
    'Không có vi phạm khoảng cách. Hai thiết bị có tâm cách nhau dưới 0,6 m sẽ được tô đỏ và liệt kê ở đây.',
  'rules.count.one': '{n} vi phạm',
  'rules.count.other': '{n} vi phạm',
  'rules.detail': 'tâm cách nhau {d} m · giới hạn 0,60 m · nhấp để chọn',

  'bom.type': 'Loại',
  'bom.qty': 'SL',
  'bom.total': 'Tổng',
  'bom.empty': 'Chưa có thiết bị nào.',

  'lang.aria': 'Ngôn ngữ',
}

const DICTS: Record<Lang, Record<MessageKey, string>> = { en, vi }

export type MessageParams = Record<string, string | number>

export function t(
  lang: Lang,
  key: MessageKey,
  params?: MessageParams,
): string {
  const template = DICTS[lang][key] ?? en[key] ?? key
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}

export function typeLabel(type: ItemType, lang: Lang): string {
  return t(lang, `type.${type}`)
}

export function itemDisplayName(item: LayoutItem, lang: Lang): string {
  return `${typeLabel(item.type, lang)} ${item.seq}`
}

export interface Translator {
  lang: Lang
  t: (key: MessageKey, params?: MessageParams) => string
  typeLabel: (type: ItemType) => string
  itemName: (item: LayoutItem) => string
}

/** Bound translator for the current store language. */
export function useI18n(): Translator {
  const lang = useEditorStore((s) => s.lang)
  return {
    lang,
    t: (key, params) => t(lang, key, params),
    typeLabel: (type) => typeLabel(type, lang),
    itemName: (item) => itemDisplayName(item, lang),
  }
}

import type { Card } from '../src/database/entities/Card'
import type { DailyFocusOverride } from '../src/database/entities/DailyFocusOverride'
import type { List } from '../src/database/entities/List'

export type FocusSource = 'automatic' | 'manual'

export interface FocusItem {
  card: Card
  source: FocusSource
  overdue: boolean
}

export interface FocusResponse {
  date: string
  items: FocusItem[]
  total: number
  overdueCount: number
}

export function isValidLocalDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  )
}

export function localDateKey(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function deriveFocusItems(
  cards: Card[],
  lists: List[],
  overrides: DailyFocusOverride[],
  date: string
): FocusItem[] {
  const listById = new Map(lists.map((list) => [list.id, list]))
  const overrideByCardId = new Map(overrides.map((override) => [override.card_id, override]))

  return cards
    .flatMap((card): FocusItem[] => {
      const list = listById.get(card.list_id)
      if (!list || list.name.trim() === '已完成') return []

      const override = overrideByCardId.get(card.id)
      if (override?.mode === 'exclude') return []

      const dueDate = card.due_date ? localDateKey(card.due_date) : ''
      const automatic = Boolean(dueDate && dueDate <= date)
      if (!automatic && override?.mode !== 'include') return []

      return [
        {
          card,
          source: override?.mode === 'include' && !automatic ? 'manual' : 'automatic',
          overdue: Boolean(dueDate && dueDate < date),
        },
      ]
    })
    .sort((left, right) => {
      const leftGroup = left.overdue ? 0 : left.source === 'automatic' ? 1 : 2
      const rightGroup = right.overdue ? 0 : right.source === 'automatic' ? 1 : 2
      if (leftGroup !== rightGroup) return leftGroup - rightGroup

      if (leftGroup < 2) {
        return localDateKey(left.card.due_date!) < localDateKey(right.card.due_date!) ? -1 : 1
      }

      const leftCreated = overrideByCardId.get(left.card.id)?.created_at?.getTime() ?? 0
      const rightCreated = overrideByCardId.get(right.card.id)?.created_at?.getTime() ?? 0
      return leftCreated - rightCreated
    })
}

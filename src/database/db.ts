import type { Board } from './entities/Board'
import type { List } from './entities/List'
import type { Card } from './entities/Card'
import type { Label } from './entities/Label'
import type { TimeBlock } from './entities/TimeBlock'

let nextId = 1
function genId() {
  return nextId++
}

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data))
}

export const db = {
  boards: {
    find(): Board[] {
      return load<Board>('b')
    },
    create(d: Partial<Board>): Board {
      const b: Board = {
        id: genId(),
        name: d.name || '',
        description: d.description,
        created_at: new Date(),
        updated_at: new Date(),
        lists: [],
      }
      const all = load<Board>('b')
      all.push(b)
      save('b', all)
      return b
    },
    async update(id: number, d: Partial<Board>) {
      const all = load<Board>('b')
      const i = all.findIndex((x) => x.id === id)
      if (i >= 0) {
        all[i] = { ...all[i], ...d, updated_at: new Date() }
        save('b', all)
      }
    },
    async delete(id: number) {
      save(
        'b',
        load<Board>('b').filter((x) => x.id !== id)
      )
    },
  },
  lists: {
    find(boardId?: number): List[] {
      let all = load<List>('l')
      if (boardId) all = all.filter((x) => x.board_id === boardId)
      return all.sort((a, b) => a.position - b.position)
    },
    create(d: Partial<List>): List {
      const l: List = {
        id: genId(),
        board_id: d.board_id || 0,
        name: d.name || '',
        position: d.position || 0,
        created_at: new Date(),
        board: undefined,
        cards: [],
      }
      const all = load<List>('l')
      all.push(l)
      save('l', all)
      return l
    },
    async update(id: number, d: Partial<List>) {
      const all = load<List>('l')
      const i = all.findIndex((x) => x.id === id)
      if (i >= 0) {
        all[i] = { ...all[i], ...d }
        save('l', all)
      }
    },
    async delete(id: number) {
      save(
        'l',
        load<List>('l').filter((x) => x.id !== id)
      )
    },
  },
  cards: {
    find(listId?: number): Card[] {
      let all = load<Card>('c')
      if (listId) all = all.filter((x) => x.list_id === listId)
      return all.sort((a, b) => a.position - b.position)
    },
    create(d: Partial<Card>): Card {
      const c: Card = {
        id: genId(),
        list_id: d.list_id || 0,
        title: d.title || '',
        description: d.description,
        priority: d.priority || 'medium',
        due_date: d.due_date,
        position: d.position || 0,
        created_at: new Date(),
        updated_at: new Date(),
        list: undefined,
        cardLabels: [],
        timeBlocks: [],
        comments: [],
      }
      const all = load<Card>('c')
      all.push(c)
      save('c', all)
      return c
    },
    async update(id: number, d: Partial<Card>) {
      const all = load<Card>('c')
      const i = all.findIndex((x) => x.id === id)
      if (i >= 0) {
        all[i] = { ...all[i], ...d, updated_at: new Date() }
        save('c', all)
      }
    },
    async delete(id: number) {
      save(
        'c',
        load<Card>('c').filter((x) => x.id !== id)
      )
    },
    async moveCard(cardId: number, targetListId: number, position: number) {
      const all = load<Card>('c')
      const card = all.find((x) => x.id === cardId)
      if (!card) return
      const oldListId = card.list_id
      if (oldListId === targetListId) {
        const listCards = all
          .filter((x) => x.list_id === oldListId && x.id !== cardId)
          .sort((a, b) => a.position - b.position)
        const pos = Math.max(0, Math.min(position - 1, listCards.length))
        listCards.splice(pos, 0, { ...card, position: pos + 1, list_id: targetListId })
        listCards.forEach((c, i) => {
          c.position = i + 1
        })
        save('c', [
          ...listCards,
          ...all
            .filter((x) => x.list_id !== oldListId || x.id === cardId)
            .filter((x) => x.id !== cardId),
        ])
      } else {
        const srcCards = all
          .filter((x) => x.list_id === oldListId && x.id !== cardId)
          .sort((a, b) => a.position - b.position)
        srcCards.forEach((c, i) => {
          c.position = i + 1
        })
        const tgtCards = all
          .filter((x) => x.list_id === targetListId)
          .sort((a, b) => a.position - b.position)
        const pos = Math.max(0, Math.min(position - 1, tgtCards.length))
        tgtCards.splice(pos, 0, { ...card, position: pos + 1, list_id: targetListId })
        tgtCards.forEach((c, i) => {
          c.position = i + 1
        })
        save('c', [...srcCards, ...tgtCards])
      }
    },
  },
  labels: {
    find(): Label[] {
      return load<Label>('lb')
    },
    create(d: Partial<Label>): Label {
      const l: Label = {
        id: genId(),
        board_id: d.board_id || 0,
        name: d.name || '',
        color: d.color || '#999',
        cardLabels: [],
      }
      const all = load<Label>('lb')
      all.push(l)
      save('lb', all)
      return l
    },
    async update(id: number, d: Partial<Label>) {
      const all = load<Label>('lb')
      const i = all.findIndex((x) => x.id === id)
      if (i >= 0) {
        all[i] = { ...all[i], ...d }
        save('lb', all)
      }
    },
    async delete(id: number) {
      save(
        'lb',
        load<Label>('lb').filter((x) => x.id !== id)
      )
    },
  },
  timeBlocks: {
    find(): TimeBlock[] {
      return load<TimeBlock>('tb')
    },
    create(d: Partial<TimeBlock>): TimeBlock {
      const t: TimeBlock = {
        id: genId(),
        card_id: d.card_id,
        start_time: d.start_time || new Date(),
        end_time: d.end_time || new Date(),
        title: d.title || '',
      }
      const all = load<TimeBlock>('tb')
      all.push(t)
      save('tb', all)
      return t
    },
    async update(id: number, d: Partial<TimeBlock>) {
      const all = load<TimeBlock>('tb')
      const i = all.findIndex((x) => x.id === id)
      if (i >= 0) {
        all[i] = { ...all[i], ...d }
        save('tb', all)
      }
    },
    async delete(id: number) {
      save(
        'tb',
        load<TimeBlock>('tb').filter((x) => x.id !== id)
      )
    },
  },
}

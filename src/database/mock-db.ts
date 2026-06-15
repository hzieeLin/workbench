import type { Board } from './entities/Board'
import type { List } from './entities/List'
import type { Card } from './entities/Card'
import type { Label } from './entities/Label'
import type { TimeBlock } from './entities/TimeBlock'
import type { Comment } from './entities/Comment'

const isBrowser = typeof window !== 'undefined'

let nextId = 1
function generateId(): number {
  return nextId++
}

function getStorage<T>(key: string): T[] {
  if (!isBrowser) return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

function setStorage<T>(key: string, data: T[]): void {
  if (!isBrowser) return
  localStorage.setItem(key, JSON.stringify(data))
}

export const mockDB = {
  boards: {
    find(): Board[] {
      return getStorage<Board>('db_boards')
    },
    findOne(options?: { where?: { id?: number } }): Board | null {
      const boards = getStorage<Board>('db_boards')
      if (options?.where?.id) {
        return boards.find((b) => b.id === options.where!.id) || null
      }
      return boards[0] || null
    },
    create(data: Partial<Board>): Board {
      const board: Board = {
        id: generateId(),
        name: data.name || '',
        description: data.description,
        created_at: new Date(),
        updated_at: new Date(),
        lists: [],
      }
      const boards = getStorage<Board>('db_boards')
      boards.push(board)
      setStorage('db_boards', boards)
      return board
    },
    async save(board: Board): Promise<Board> {
      const boards = getStorage<Board>('db_boards')
      const index = boards.findIndex((b) => b.id === board.id)
      if (index >= 0) {
        boards[index] = { ...boards[index], ...board, updated_at: new Date() }
      } else {
        boards.push(board)
      }
      setStorage('db_boards', boards)
      return board
    },
    async update(id: number, data: Partial<Board>): Promise<void> {
      const boards = getStorage<Board>('db_boards')
      const index = boards.findIndex((b) => b.id === id)
      if (index >= 0) {
        boards[index] = { ...boards[index], ...data, updated_at: new Date() }
        setStorage('db_boards', boards)
      }
    },
    async delete(id: number): Promise<void> {
      const boards = getStorage<Board>('db_boards')
      setStorage(
        'db_boards',
        boards.filter((b) => b.id !== id)
      )
    },
  },

  lists: {
    find(options?: { where?: { board_id?: number }; order?: { position?: string } }): List[] {
      let lists = getStorage<List>('db_lists')
      if (options?.where?.board_id) {
        lists = lists.filter((l) => l.board_id === options.where!.board_id)
      }
      if (options?.order?.position === 'ASC') {
        lists.sort((a, b) => a.position - b.position)
      }
      return lists
    },
    create(data: Partial<List>): List {
      const list: List = {
        id: generateId(),
        board_id: data.board_id || 0,
        name: data.name || '',
        position: data.position || 0,
        created_at: new Date(),
        board: undefined,
        cards: [],
      }
      const lists = getStorage<List>('db_lists')
      lists.push(list)
      setStorage('db_lists', lists)
      return list
    },
    async save(list: List): Promise<List> {
      const lists = getStorage<List>('db_lists')
      const index = lists.findIndex((l) => l.id === list.id)
      if (index >= 0) {
        lists[index] = { ...lists[index], ...list }
      } else {
        lists.push(list)
      }
      setStorage('db_lists', lists)
      return list
    },
    async update(id: number, data: Partial<List>): Promise<void> {
      const lists = getStorage<List>('db_lists')
      const index = lists.findIndex((l) => l.id === id)
      if (index >= 0) {
        lists[index] = { ...lists[index], ...data }
        setStorage('db_lists', lists)
      }
    },
    async delete(id: number): Promise<void> {
      const lists = getStorage<List>('db_lists')
      setStorage(
        'db_lists',
        lists.filter((l) => l.id !== id)
      )
    },
  },

  cards: {
    find(options?: {
      where?: { list_id?: number; id?: number }
      order?: { position?: string }
    }): Card[] {
      let cards = getStorage<Card>('db_cards')
      if (options?.where?.list_id) {
        cards = cards.filter((c) => c.list_id === options.where!.list_id)
      }
      if (options?.where?.id) {
        cards = cards.filter((c) => c.id === options.where!.id)
      }
      if (options?.order?.position === 'ASC') {
        cards.sort((a, b) => a.position - b.position)
      }
      return cards
    },
    create(data: Partial<Card>): Card {
      const card: Card = {
        id: generateId(),
        list_id: data.list_id || 0,
        title: data.title || '',
        description: data.description,
        priority: data.priority || 'medium',
        due_date: data.due_date,
        position: data.position || 0,
        created_at: new Date(),
        updated_at: new Date(),
        list: undefined,
        cardLabels: [],
        timeBlocks: [],
        comments: [],
      }
      const cards = getStorage<Card>('db_cards')
      cards.push(card)
      setStorage('db_cards', cards)
      return card
    },
    async save(card: Card): Promise<Card> {
      const cards = getStorage<Card>('db_cards')
      const index = cards.findIndex((c) => c.id === card.id)
      if (index >= 0) {
        cards[index] = { ...cards[index], ...card, updated_at: new Date() }
      } else {
        cards.push(card)
      }
      setStorage('db_cards', cards)
      return card
    },
    async update(id: number, data: Partial<Card>): Promise<void> {
      const cards = getStorage<Card>('db_cards')
      const index = cards.findIndex((c) => c.id === id)
      if (index >= 0) {
        cards[index] = { ...cards[index], ...data, updated_at: new Date() }
        setStorage('db_cards', cards)
      }
    },
    async delete(id: number): Promise<void> {
      const cards = getStorage<Card>('db_cards')
      setStorage(
        'db_cards',
        cards.filter((c) => c.id !== id)
      )
    },
    async count(options?: { where?: { list_id?: number; priority?: string } }): Promise<number> {
      let cards = getStorage<Card>('db_cards')
      if (options?.where?.list_id) {
        cards = cards.filter((c) => c.list_id === options.where!.list_id)
      }
      if (options?.where?.priority) {
        cards = cards.filter((c) => c.priority === options.where!.priority)
      }
      return cards.length
    },
  },

  labels: {
    find(): Label[] {
      return getStorage<Label>('db_labels')
    },
    create(data: Partial<Label>): Label {
      const label: Label = {
        id: generateId(),
        board_id: data.board_id || 0,
        name: data.name || '',
        color: data.color || '#999',
        cardLabels: [],
      }
      const labels = getStorage<Label>('db_labels')
      labels.push(label)
      setStorage('db_labels', labels)
      return label
    },
    async save(label: Label): Promise<Label> {
      const labels = getStorage<Label>('db_labels')
      const index = labels.findIndex((l) => l.id === label.id)
      if (index >= 0) {
        labels[index] = { ...labels[index], ...label }
      } else {
        labels.push(label)
      }
      setStorage('db_labels', labels)
      return label
    },
    async update(id: number, data: Partial<Label>): Promise<void> {
      const labels = getStorage<Label>('db_labels')
      const index = labels.findIndex((l) => l.id === id)
      if (index >= 0) {
        labels[index] = { ...labels[index], ...data }
        setStorage('db_labels', labels)
      }
    },
    async delete(id: number): Promise<void> {
      const labels = getStorage<Label>('db_labels')
      setStorage(
        'db_labels',
        labels.filter((l) => l.id !== id)
      )
    },
  },

  timeBlocks: {
    find(options?: { where?: { card_id?: number } }): TimeBlock[] {
      let blocks = getStorage<TimeBlock>('db_timeblocks')
      if (options?.where?.card_id) {
        blocks = blocks.filter((b) => b.card_id === options.where!.card_id)
      }
      return blocks
    },
    create(data: Partial<TimeBlock>): TimeBlock {
      const block: TimeBlock = {
        id: generateId(),
        card_id: data.card_id,
        start_time: data.start_time || new Date(),
        end_time: data.end_time || new Date(),
        title: data.title || '',
      }
      const blocks = getStorage<TimeBlock>('db_timeblocks')
      blocks.push(block)
      setStorage('db_timeblocks', blocks)
      return block
    },
    async save(block: TimeBlock): Promise<TimeBlock> {
      const blocks = getStorage<TimeBlock>('db_timeblocks')
      const index = blocks.findIndex((b) => b.id === block.id)
      if (index >= 0) {
        blocks[index] = { ...blocks[index], ...block }
      } else {
        blocks.push(block)
      }
      setStorage('db_timeblocks', blocks)
      return block
    },
    async update(id: number, data: Partial<TimeBlock>): Promise<void> {
      const blocks = getStorage<TimeBlock>('db_timeblocks')
      const index = blocks.findIndex((b) => b.id === id)
      if (index >= 0) {
        blocks[index] = { ...blocks[index], ...data }
        setStorage('db_timeblocks', blocks)
      }
    },
    async delete(id: number): Promise<void> {
      const blocks = getStorage<TimeBlock>('db_timeblocks')
      setStorage(
        'db_timeblocks',
        blocks.filter((b) => b.id !== id)
      )
    },
  },

  comments: {
    find(options?: { where?: { card_id?: number } }): Comment[] {
      let comments = getStorage<Comment>('db_comments')
      if (options?.where?.card_id) {
        comments = comments.filter((c) => c.card_id === options.where!.card_id)
      }
      return comments
    },
    findOne(options?: { where?: { id?: number } }): Comment | null {
      const comments = getStorage<Comment>('db_comments')
      if (options?.where?.id) {
        return comments.find((c) => c.id === options.where!.id) || null
      }
      return comments[0] || null
    },
    create(data: Partial<Comment>): Comment {
      const comment: Comment = {
        id: generateId(),
        card_id: data.card_id || 0,
        author: data.author || '',
        content: data.content || '',
        created_at: new Date(),
        card: undefined,
      }
      const comments = getStorage<Comment>('db_comments')
      comments.push(comment)
      setStorage('db_comments', comments)
      return comment
    },
    async save(comment: Comment): Promise<Comment> {
      const comments = getStorage<Comment>('db_comments')
      const index = comments.findIndex((c) => c.id === comment.id)
      if (index >= 0) {
        comments[index] = { ...comments[index], ...comment }
      } else {
        comments.push(comment)
      }
      setStorage('db_comments', comments)
      return comment
    },
    async update(id: number, data: Partial<Comment>): Promise<void> {
      const comments = getStorage<Comment>('db_comments')
      const index = comments.findIndex((c) => c.id === id)
      if (index >= 0) {
        comments[index] = { ...comments[index], ...data }
        setStorage('db_comments', comments)
      }
    },
    async delete(id: number): Promise<void> {
      const comments = getStorage<Comment>('db_comments')
      setStorage(
        'db_comments',
        comments.filter((c) => c.id !== id)
      )
    },
  },
}

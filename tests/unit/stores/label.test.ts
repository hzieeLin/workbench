import { setActivePinia, createPinia } from 'pinia'
import { useLabelStore } from '@/stores/label'
import { apiClient } from '@/services/api'

jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('Label Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
  })

  it('should fetch labels', async () => {
    const mockLabels = [
      { id: 1, name: 'Bug', color: '#FF0000', board_id: 1 },
      { id: 2, name: 'Feature', color: '#00FF00', board_id: 1 },
    ]
    ;(apiClient.get as jest.Mock).mockResolvedValue(mockLabels)

    const store = useLabelStore()
    await store.fetchLabels(1)

    expect(apiClient.get).toHaveBeenCalledWith('/boards/1/labels')
    expect(store.labels).toEqual(mockLabels)
    expect(store.loading).toBe(false)
  })

  it('should create a label', async () => {
    const newLabel = { id: 3, name: 'Test Label', color: '#FF0000', board_id: 1 }
    ;(apiClient.post as jest.Mock).mockResolvedValue(newLabel)

    const store = useLabelStore()
    const label = await store.createLabel(1, 'Test Label', '#FF0000')

    expect(apiClient.post).toHaveBeenCalledWith('/boards/1/labels', {
      name: 'Test Label',
      color: '#FF0000',
    })
    expect(label.name).toBe('Test Label')
    expect(label.color).toBe('#FF0000')
    expect(store.labels).toContainEqual(newLabel)
  })

  it('should update a label', async () => {
    const store = useLabelStore()
    store.labels = [{ id: 1, name: 'Old Name', color: '#FF0000', board_id: 1 }]

    await store.updateLabel(1, { name: 'New Name' })

    expect(apiClient.patch).toHaveBeenCalledWith('/labels/1', { name: 'New Name' })
    expect(store.labels[0].name).toBe('New Name')
  })

  it('should delete a label', async () => {
    const store = useLabelStore()
    store.labels = [
      { id: 1, name: 'Label 1', color: '#FF0000', board_id: 1 },
      { id: 2, name: 'Label 2', color: '#00FF00', board_id: 1 },
    ]

    await store.deleteLabel(1)

    expect(apiClient.delete).toHaveBeenCalledWith('/labels/1')
    expect(store.labels).toEqual([{ id: 2, name: 'Label 2', color: '#00FF00', board_id: 1 }])
  })

  it('should handle fetch error', async () => {
    ;(apiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'))

    const store = useLabelStore()
    await store.fetchLabels(1)

    expect(store.labels).toEqual([])
    expect(store.error).toBe('Network error')
    expect(store.loading).toBe(false)
  })
})

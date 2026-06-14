import { apiClient } from '@/services/api'

describe('apiClient', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('posts JSON and returns parsed response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, name: 'Product Plan' }),
    })

    const result = await apiClient.post('/boards', { name: 'Product Plan' })

    expect(global.fetch).toHaveBeenCalledWith('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Product Plan' }),
    })
    expect(result).toEqual({ id: 1, name: 'Product Plan' })
  })

  it('throws JSON error messages', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Board name is required' }),
    })

    await expect(apiClient.post('/boards', {})).rejects.toThrow('Board name is required')
  })
})

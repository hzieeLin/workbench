import { setActivePinia, createPinia } from 'pinia'
import { useStatisticsStore } from '@/stores/statistics'

jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue([]),
  },
}))

describe('Statistics Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
  })

  it('fetches empty statistics without query builder support', async () => {
    const store = useStatisticsStore()

    await store.fetchStatistics()

    expect(store.error).toBeNull()
    expect(store.completionData).toEqual({
      completed: 0,
      pending: 0,
      total: 0,
    })
    expect(store.timeData.datasets[0].label).toBe('工作时间（分钟）')
    expect(store.trendData.datasets.map((dataset) => dataset.label)).toEqual([
      '新建任务',
      '完成任务',
    ])
  })
})

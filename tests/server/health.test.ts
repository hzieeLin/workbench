/**
 * @jest-environment node
 */

import request from 'supertest'
import { createApp } from '../../server/app'

describe('server health', () => {
  it('returns ok status', async () => {
    const app = createApp()

    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })
})

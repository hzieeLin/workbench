type JsonBody = Record<string, unknown>

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, options)
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = typeof payload.error === 'string' ? payload.error : 'Request failed'
    throw new Error(message)
  }

  return payload as T
}

export const apiClient = {
  get<T>(path: string) {
    return request<T>(path)
  },
  post<T>(path: string, body: JsonBody) {
    return request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  },
  patch<T>(path: string, body: JsonBody) {
    return request<T>(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  },
  delete<T>(path: string) {
    return request<T>(path, { method: 'DELETE' })
  },
}

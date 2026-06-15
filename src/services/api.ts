type JsonBody = Record<string, unknown>

export function getApiBase(
  protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:'
) {
  if (protocol === 'file:') {
    return 'http://localhost:3001/api'
  }

  return '/api'
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${getApiBase()}${path}`, options)
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

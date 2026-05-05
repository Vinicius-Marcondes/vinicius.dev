export const apiBaseUrl = '/api'

export type ApiErrorPayload = Readonly<{
  error: string
  field?: string
  reason?: string
  resource?: string
}>

const isApiErrorPayload = (value: unknown): value is ApiErrorPayload => {
  if (!value || typeof value !== 'object') {
    return false
  }

  return typeof (value as Record<string, unknown>).error === 'string'
}

export class ApiRequestError extends Error {
  readonly status: number
  readonly payload?: ApiErrorPayload

  constructor(status: number, payload?: ApiErrorPayload) {
    super(`API request failed with status ${status}`)
    this.name = 'ApiRequestError'
    this.status = status
    this.payload = payload
  }
}

const asJson = async (response: Response): Promise<unknown | undefined> => {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    return undefined
  }

  try {
    return await response.json()
  } catch {
    return undefined
  }
}

const requestJson = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const headers = new Headers(init.headers)

  if (!headers.has('accept')) {
    headers.set('accept', 'application/json')
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })

  const payload = await asJson(response)

  if (!response.ok) {
    throw new ApiRequestError(response.status, isApiErrorPayload(payload) ? payload : undefined)
  }

  if (typeof payload === 'undefined') {
    throw new ApiRequestError(response.status)
  }

  return payload as T
}

export const getJson = <T>(path: string, init: Omit<RequestInit, 'method'> = {}) =>
  requestJson<T>(path, {
    ...init,
    method: 'GET',
  })

export const postJson = <TInput, TOutput>(
  path: string,
  payload: TInput,
  init: Omit<RequestInit, 'body' | 'method'> = {},
) => {
  const headers = new Headers(init.headers)

  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }

  return requestJson<TOutput>(path, {
    ...init,
    body: JSON.stringify(payload),
    headers,
    method: 'POST',
  })
}

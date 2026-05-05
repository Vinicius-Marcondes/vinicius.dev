import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiRequestError, getJson, postJson } from './index'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('shared API client', () => {
  it('sends credentialed GET requests with JSON accept headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(getJson('/status-strip')).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith('/api/status-strip', {
      credentials: 'include',
      headers: expect.any(Headers),
      method: 'GET',
    })
    expect((fetchMock.mock.calls[0]?.[1]?.headers as Headers).get('accept')).toBe('application/json')
  })

  it('serializes POST bodies and preserves explicit headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ state: 'ready' }), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      postJson('/auth/login', { email: 'admin@example.com' }, {
        headers: {
          accept: 'application/vnd.test+json',
        },
      }),
    ).resolves.toEqual({ state: 'ready' })
    const init = fetchMock.mock.calls[0]?.[1]
    const headers = init?.headers as Headers
    expect(init?.body).toBe(JSON.stringify({ email: 'admin@example.com' }))
    expect(headers.get('accept')).toBe('application/vnd.test+json')
    expect(headers.get('content-type')).toBe('application/json')
  })

  it('throws typed API errors for JSON and empty error responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: 'denied', reason: 'bad_password' }), {
            headers: { 'content-type': 'application/json' },
            status: 401,
          }),
        )
        .mockResolvedValueOnce(
          new Response('', {
            headers: { 'content-type': 'text/plain' },
            status: 200,
          }),
        ),
    )

    await expect(getJson('/auth/session')).rejects.toMatchObject({
      payload: {
        error: 'denied',
        reason: 'bad_password',
      },
      status: 401,
    } satisfies Partial<ApiRequestError>)
    await expect(getJson('/empty')).rejects.toMatchObject({
      payload: undefined,
      status: 200,
    } satisfies Partial<ApiRequestError>)
  })
})

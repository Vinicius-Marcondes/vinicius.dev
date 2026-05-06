import { useMemo, useState, type ChangeEvent } from 'react'
import { Form, useActionData, useLoaderData, useNavigation, useSearchParams } from 'react-router-dom'
import { InlineLabel, ScreenFrame, Stack } from '../../../../shared/ui'
import type { AdminPhotoCurationItem, PhotoTone } from '../../../../entities/photo'
import type { AdminPhotosActionData, AdminPhotosLoaderData } from '../model/types'

const tones: PhotoTone[] = ['amber', 'cyan', 'mono', 'sunset', 'violet']

const tagsValue = (photo: AdminPhotoCurationItem) => photo.tags.join(', ')

export function AdminPhotosPage() {
  const data = useLoaderData() as AdminPhotosLoaderData
  const actionData = useActionData() as AdminPhotosActionData | undefined
  const navigation = useNavigation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const isSubmitting = navigation.state === 'submitting'

  const pageLabel = useMemo(
    () => `page ${data.pageInfo.page} / ${data.pageInfo.totalPages}`,
    [data.pageInfo.page, data.pageInfo.totalPages],
  )

  const updateQuery = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === 'all') {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }

    next.set('page', '1')
    setSearchParams(next)
  }

  const goToPage = (page: number) => {
    const next = new URLSearchParams(searchParams)
    if (page <= 1) {
      next.delete('page')
    } else {
      next.set('page', String(page))
    }
    setSearchParams(next)
  }

  const handlePreview = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setPreviewUrl(null)
      return
    }
    setPreviewUrl(URL.createObjectURL(file))
  }

  return (
    <Stack gap={20}>
      <InlineLabel>photo catalog</InlineLabel>
      <h2 className="page-heading fx-crt-title">photo control</h2>
      <p className="page-copy">
        Upload originals as drafts, then publish or feature records once their metadata is ready.
      </p>

      <div className="admin-dashboard">
        <ScreenFrame className="admin-panel">
          <InlineLabel>upload original</InlineLabel>
          <Form method="post" encType="multipart/form-data" className="admin-status-editor">
            <input type="hidden" name="intent" value="upload_photo" />
            <label className="admin-field">
              <span>file</span>
              <input name="file" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePreview} required />
            </label>
            {previewUrl ? (
              <img
                alt="Selected photo preview"
                src={previewUrl}
                style={{ width: '100%', maxHeight: 240, objectFit: 'cover', border: '1px solid var(--color-border)' }}
              />
            ) : null}
            <label className="admin-field">
              <span>title</span>
              <input name="title" required />
            </label>
            <label className="admin-field">
              <span>frame</span>
              <input name="frame" required />
            </label>
            <label className="admin-field">
              <span>date</span>
              <input name="date" type="date" required />
            </label>
            <label className="admin-field">
              <span>location</span>
              <input name="location" required />
            </label>
            <label className="admin-field">
              <span>tone</span>
              <select name="tone" defaultValue="amber">
                {tones.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>tags</span>
              <input name="tags" placeholder="street, night" />
            </label>
            <label className="admin-field">
              <span>caption</span>
              <input name="caption" />
            </label>
            <label className="admin-field">
              <span>camera</span>
              <input name="camera" />
            </label>
            <label className="admin-field">
              <span>film</span>
              <input name="film" />
            </label>
            {actionData?.intent === 'upload_photo' ? (
              <p className={actionData.status === 'error' ? 'admin-login__error' : undefined}>{actionData.message}</p>
            ) : null}
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'uploading...' : 'upload draft'}
            </button>
          </Form>
        </ScreenFrame>

        <ScreenFrame className="admin-panel admin-panel--wide">
          <InlineLabel>records</InlineLabel>
          <div className="admin-status-editor">
            <label className="admin-field">
              <span>search</span>
              <input
                value={data.filters.search}
                onChange={(event) => updateQuery({ search: event.target.value })}
                placeholder="title, frame, location"
              />
            </label>
            <label className="admin-field">
              <span>status</span>
              <select value={data.filters.status} onChange={(event) => updateQuery({ status: event.target.value })}>
                <option value="all">all</option>
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </label>
            <label className="admin-field">
              <span>featured</span>
              <select value={data.filters.featured} onChange={(event) => updateQuery({ featured: event.target.value })}>
                <option value="all">all</option>
                <option value="featured">featured</option>
                <option value="not_featured">not featured</option>
              </select>
            </label>
          </div>

          <div className="admin-table">
            {data.items.map((photo) => (
              <div key={photo.id} className="admin-table__row" style={{ alignItems: 'start' }}>
                <span>{photo.frame}</span>
                <Form method="post" style={{ display: 'grid', gap: 8 }}>
                  <input type="hidden" name="intent" value="update_metadata" />
                  <input type="hidden" name="photoId" value={photo.id} />
                  <input name="title" defaultValue={photo.title} aria-label={`Title for ${photo.title}`} />
                  <input name="date" type="date" defaultValue={photo.date} aria-label={`Date for ${photo.title}`} />
                  <input name="location" defaultValue={photo.location} aria-label={`Location for ${photo.title}`} />
                  <input name="frame" defaultValue={photo.frame} aria-label={`Frame for ${photo.title}`} />
                  <select name="tone" defaultValue={photo.tone} aria-label={`Tone for ${photo.title}`}>
                    {tones.map((tone) => (
                      <option key={tone} value={tone}>
                        {tone}
                      </option>
                    ))}
                  </select>
                  <input name="tags" defaultValue={tagsValue(photo)} aria-label={`Tags for ${photo.title}`} />
                  <input name="caption" defaultValue={photo.caption ?? ''} aria-label={`Caption for ${photo.title}`} />
                  <input name="camera" defaultValue={photo.camera ?? ''} aria-label={`Camera for ${photo.title}`} />
                  <input name="film" defaultValue={photo.film ?? ''} aria-label={`Film for ${photo.title}`} />
                  <button type="submit" disabled={isSubmitting}>save metadata</button>
                  {actionData?.rowId === photo.id && actionData.intent === 'update_metadata' ? <p>{actionData.message}</p> : null}
                </Form>
                <div style={{ display: 'grid', gap: 8 }}>
                  <span>{photo.status} // {photo.featured ? 'featured' : 'not featured'}</span>
                  <Form method="post">
                    <input type="hidden" name="intent" value="update_curation" />
                    <input type="hidden" name="photoId" value={photo.id} />
                    <input type="hidden" name="status" value={photo.status === 'published' ? 'draft' : 'published'} />
                    <button type="submit" disabled={isSubmitting}>
                      {photo.status === 'published' ? 'unpublish' : 'publish'}
                    </button>
                  </Form>
                  <Form method="post">
                    <input type="hidden" name="intent" value="update_curation" />
                    <input type="hidden" name="photoId" value={photo.id} />
                    <input type="hidden" name="featured" value={photo.featured ? 'false' : 'true'} />
                    <button type="submit" disabled={isSubmitting}>
                      {photo.featured ? 'unfeature' : 'feature'}
                    </button>
                  </Form>
                  {actionData?.rowId === photo.id && actionData.intent === 'update_curation' ? <p>{actionData.message}</p> : null}
                </div>
              </div>
            ))}
          </div>

          <nav aria-label="Admin photos pagination" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button type="button" disabled={data.pageInfo.page <= 1} onClick={() => goToPage(data.pageInfo.page - 1)}>
              previous
            </button>
            <span>{pageLabel}</span>
            <button
              type="button"
              disabled={data.pageInfo.page >= data.pageInfo.totalPages}
              onClick={() => goToPage(data.pageInfo.page + 1)}
            >
              next
            </button>
          </nav>
        </ScreenFrame>
      </div>
    </Stack>
  )
}

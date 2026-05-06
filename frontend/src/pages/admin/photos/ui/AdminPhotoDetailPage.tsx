import { Form, useActionData, useLoaderData, useLocation, useNavigation } from 'react-router-dom'
import { ActionButton, InlineLabel, ScreenFrame, Stack } from '../../../../shared/ui'
import type { PhotoTone } from '../../../../entities/photo'
import type { AdminPhotoDetailLoaderData, AdminPhotosActionData } from '../model/types'

const tones: PhotoTone[] = ['amber', 'cyan', 'mono', 'sunset', 'violet']

const tagsValue = (tags: readonly string[]) => tags.join(', ')

export function AdminPhotoDetailPage() {
  const { item: photo, originalUrl } = useLoaderData() as AdminPhotoDetailLoaderData
  const actionData = useActionData() as AdminPhotosActionData | undefined
  const navigation = useNavigation()
  const location = useLocation()
  const isSubmitting = navigation.state === 'submitting'
  const backTo = (location.state as { from?: string } | null)?.from ?? '/admin/photos'

  return (
    <Stack gap={20}>
      <div className="admin-photo-header">
        <div>
          <InlineLabel>photo catalog</InlineLabel>
          <h2 className="page-heading fx-crt-title">{photo.title}</h2>
          <p className="page-copy">
            {photo.frame} // {photo.location} // {photo.status} // {photo.featured ? 'featured' : 'not featured'}
          </p>
        </div>
        <ActionButton to={backTo}>back to gallery</ActionButton>
      </div>

      <div className="admin-photo-detail">
        <ScreenFrame className="admin-panel admin-photo-detail__media">
          <img src={originalUrl} alt={photo.title} />
          <div>
            <InlineLabel>original</InlineLabel>
            <p>
              {photo.original.displayFilename ?? 'untitled'} // {photo.original.mimeType ?? 'unknown mime'} //{' '}
              {photo.original.byteSize ? `${photo.original.byteSize} bytes` : 'size pending'}
            </p>
          </div>
        </ScreenFrame>

        <ScreenFrame className="admin-panel">
          <InlineLabel>metadata</InlineLabel>
          <Form method="post" className="admin-status-editor">
            <input type="hidden" name="intent" value="update_metadata" />
            <input type="hidden" name="photoId" value={photo.id} />
            <label className="admin-field">
              <span>title</span>
              <input name="title" defaultValue={photo.title} required />
            </label>
            <label className="admin-field">
              <span>frame</span>
              <input name="frame" defaultValue={photo.frame} required />
            </label>
            <label className="admin-field">
              <span>date</span>
              <input name="date" type="date" defaultValue={photo.date} required />
            </label>
            <label className="admin-field">
              <span>location</span>
              <input name="location" defaultValue={photo.location} required />
            </label>
            <label className="admin-field">
              <span>tone</span>
              <select name="tone" defaultValue={photo.tone}>
                {tones.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>tags</span>
              <input name="tags" defaultValue={tagsValue(photo.tags)} />
            </label>
            <label className="admin-field">
              <span>caption</span>
              <textarea name="caption" rows={4} defaultValue={photo.caption ?? ''} />
            </label>
            <label className="admin-field">
              <span>camera</span>
              <input name="camera" defaultValue={photo.camera ?? ''} />
            </label>
            <label className="admin-field">
              <span>film</span>
              <input name="film" defaultValue={photo.film ?? ''} />
            </label>
            {actionData?.rowId === photo.id && actionData.intent === 'update_metadata' ? (
              <p className={actionData.status === 'error' ? 'admin-login__error' : undefined}>{actionData.message}</p>
            ) : null}
            <button type="submit" disabled={isSubmitting}>
              save metadata
            </button>
          </Form>
        </ScreenFrame>

        <ScreenFrame className="admin-panel">
          <InlineLabel>visibility</InlineLabel>
          <div className="admin-photo-visibility">
            <span>{photo.status === 'published' ? 'public original is available' : 'draft original is private'}</span>
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
            {actionData?.rowId === photo.id && actionData.intent === 'update_curation' ? (
              <p className={actionData.status === 'error' ? 'admin-login__error' : undefined}>{actionData.message}</p>
            ) : null}
          </div>
        </ScreenFrame>
      </div>
    </Stack>
  )
}

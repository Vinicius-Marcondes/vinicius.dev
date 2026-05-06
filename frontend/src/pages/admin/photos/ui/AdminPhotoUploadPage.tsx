import { useEffect, useState, type ChangeEvent } from 'react'
import { Form, useActionData, useNavigation } from 'react-router-dom'
import { ActionButton, InlineLabel, ScreenFrame, Stack } from '../../../../shared/ui'
import type { PhotoTone } from '../../../../entities/photo'
import type { AdminPhotosActionData } from '../model/types'

const tones: PhotoTone[] = ['amber', 'cyan', 'mono', 'sunset', 'violet']

export function AdminPhotoUploadPage() {
  const actionData = useActionData() as AdminPhotosActionData | undefined
  const navigation = useNavigation()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const isSubmitting = navigation.state === 'submitting'

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handlePreview = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current)
      }

      return file ? URL.createObjectURL(file) : null
    })
  }

  return (
    <Stack gap={20}>
      <div className="admin-photo-header">
        <div>
          <InlineLabel>photo catalog</InlineLabel>
          <h2 className="page-heading fx-crt-title">upload original</h2>
          <p className="page-copy">Create a draft photo record with its original media and first metadata pass.</p>
        </div>
        <ActionButton to="/admin/photos">back to gallery</ActionButton>
      </div>

      <ScreenFrame className="admin-panel admin-photo-upload">
        <Form method="post" encType="multipart/form-data" className="admin-status-editor">
          <input type="hidden" name="intent" value="upload_photo" />
          <label className="admin-field">
            <span>file</span>
            <input name="file" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePreview} required />
          </label>
          {previewUrl ? (
            <img className="admin-photo-upload__preview" alt="Selected photo preview" src={previewUrl} />
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
            <textarea name="caption" rows={3} />
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
    </Stack>
  )
}

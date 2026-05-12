import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react'
import { Form, useActionData, useNavigation } from 'react-router-dom'
import { ActionButton, InlineLabel, ScreenFrame, Stack } from '../../../../shared/ui'
import type { PhotoTone } from '../../../../entities/photo'
import type { AdminPhotosActionData } from '../model/types'

const tones: PhotoTone[] = ['amber', 'cyan', 'mono', 'sunset', 'violet']
const acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp']

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

export function AdminPhotoUploadPage() {
  const actionData = useActionData() as AdminPhotosActionData | undefined
  const navigation = useNavigation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewObjectUrlRef = useRef<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number } | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [tagChips, setTagChips] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState('')
  const isSubmitting = navigation.state === 'submitting'
  const serializedTags = [...tagChips, tagDraft.trim()].filter(Boolean).join(', ')

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current)
      }
    }
  }, [])

  const setFilePreview = useCallback((file: File | null) => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current)
      previewObjectUrlRef.current = null
    }

    setSelectedFile(file ? { name: file.name, size: file.size } : null)

    if (!file) {
      setPreviewUrl(null)
      return
    }

    const nextPreviewUrl = URL.createObjectURL(file)
    previewObjectUrlRef.current = nextPreviewUrl
    setPreviewUrl(nextPreviewUrl)
  }, [])

  const handlePreview = (event: ChangeEvent<HTMLInputElement>) => {
    setFilePreview(event.target.files?.[0] ?? null)
  }

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    if (event.dataTransfer.types.includes('Files')) {
      setIsDragActive(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragActive(false)
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragActive(false)

    const file = Array.from(event.dataTransfer.files).find((item) => acceptedFileTypes.includes(item.type))
    const input = fileInputRef.current

    if (!file || !input) {
      return
    }

    const transfer = new DataTransfer()
    transfer.items.add(file)
    input.files = transfer.files
    setFilePreview(file)
  }

  const addTag = useCallback((value: string) => {
    const nextTag = value.replace(',', '').trim()

    if (!nextTag) {
      return
    }

    setTagChips((current) => (current.includes(nextTag) ? current : [...current, nextTag]))
    setTagDraft('')
  }, [])

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if ((event.key === 'Enter' || event.key === ',') && tagDraft.trim()) {
      event.preventDefault()
      addTag(tagDraft)
    }

    if (event.key === 'Backspace' && !tagDraft && tagChips.length > 0) {
      event.preventDefault()
      setTagChips((current) => current.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTagChips((current) => current.filter((tag) => tag !== tagToRemove))
  }

  return (
    <Stack gap={20}>
      <div className="admin-photo-upload__header">
        <div>
          <InlineLabel className="admin-photo-upload__eyebrow">// photo catalog</InlineLabel>
          <h2 className="admin-photo-upload__title">upload original</h2>
          <p className="admin-photo-upload__subtitle">
            Create a draft photo record with its original media and first metadata pass.
          </p>
        </div>
        <ActionButton to="/admin/photos" className="admin-photo-upload__back glitch-hover">
          ← back to gallery
        </ActionButton>
      </div>

      <ScreenFrame className="admin-photo-upload">
        <Form method="post" encType="multipart/form-data" className="admin-photo-upload__form">
          <input type="hidden" name="intent" value="upload_photo" />

          <div className="admin-photo-upload__grid">
            <section className="admin-photo-upload__media-panel" aria-labelledby="photo-upload-media">
              <h3 id="photo-upload-media" className="sr-only">
                upload media
              </h3>
              <label
                className={
                  isDragActive
                    ? 'admin-photo-upload__drop-zone admin-photo-upload__drop-zone--active'
                    : 'admin-photo-upload__drop-zone'
                }
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  name="file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  aria-label="file"
                  aria-describedby="photo-upload-file-hint"
                  onChange={handlePreview}
                  required
                />
                {previewUrl ? (
                  <>
                    <img className="admin-photo-upload__preview" alt="Selected photo preview" src={previewUrl} />
                    <span className="admin-photo-upload__drop-overlay">
                      <span className="admin-photo-upload__drop-play" aria-hidden="true">
                        ►
                      </span>
                      <span>replace file</span>
                    </span>
                  </>
                ) : (
                  <span className="admin-photo-upload__drop-empty">
                    <span className="admin-photo-upload__drop-icon" aria-hidden="true">
                      ▒
                    </span>
                    <span className="admin-photo-upload__drop-label">drop image here</span>
                    <span id="photo-upload-file-hint" className="admin-photo-upload__drop-hint">
                      // jpeg · png · webp
                    </span>
                  </span>
                )}
              </label>

              <div className={selectedFile ? 'admin-photo-upload__file-info is-visible' : 'admin-photo-upload__file-info'}>
                <span className="admin-photo-upload__file-status">◆ ready</span>
                <span className="admin-photo-upload__file-name">{selectedFile?.name ?? 'no file selected'}</span>
                <span className="admin-photo-upload__file-size">
                  {selectedFile ? formatFileSize(selectedFile.size) : '--'}
                </span>
              </div>

              {isSubmitting ? (
                <p className="admin-photo-upload__status" role="status">
                  <span aria-hidden="true">►</span>
                  processing draft...
                </p>
              ) : actionData?.intent === 'upload_photo' ? (
                <p
                  className={
                    actionData.status === 'error'
                      ? 'admin-photo-upload__status admin-photo-upload__status--error'
                      : 'admin-photo-upload__status admin-photo-upload__status--success'
                  }
                  role={actionData.status === 'error' ? 'alert' : 'status'}
                >
                  <span aria-hidden="true">{actionData.status === 'error' ? '!' : '◆'}</span>
                  {actionData.message}
                </p>
              ) : null}
            </section>

            <section className="admin-photo-upload__meta-panel" aria-label="photo metadata">
              <div className="admin-photo-upload__section">
                <div className="admin-photo-upload__section-label">// core metadata</div>
                <div className="admin-photo-upload__field-stack">
                  <label className="admin-photo-upload__field">
                    <span className="admin-photo-upload__field-label">
                      title <span className="admin-photo-upload__required">*</span>
                    </span>
                    <span className="admin-photo-upload__input-wrap">
                      <span className="admin-photo-upload__prompt" aria-hidden="true">
                        &gt;
                      </span>
                      <input name="title" placeholder="untitled frame" required />
                    </span>
                  </label>

                  <div className="admin-photo-upload__fields-row">
                    <label className="admin-photo-upload__field">
                      <span className="admin-photo-upload__field-label">
                        date <span className="admin-photo-upload__required">*</span>
                      </span>
                      <span className="admin-photo-upload__input-wrap">
                        <span className="admin-photo-upload__prompt" aria-hidden="true">
                          &gt;
                        </span>
                        <input name="date" type="date" required />
                      </span>
                    </label>

                    <label className="admin-photo-upload__field">
                      <span className="admin-photo-upload__field-label">
                        frame <span className="admin-photo-upload__required">*</span>
                      </span>
                      <span className="admin-photo-upload__input-wrap">
                        <span className="admin-photo-upload__prompt" aria-hidden="true">
                          &gt;
                        </span>
                        <input name="frame" placeholder="e.g. roll-03 frame-12" required />
                      </span>
                    </label>
                  </div>

                  <label className="admin-photo-upload__field">
                    <span className="admin-photo-upload__field-label">
                      location <span className="admin-photo-upload__required">*</span>
                    </span>
                    <span className="admin-photo-upload__input-wrap">
                      <span className="admin-photo-upload__prompt" aria-hidden="true">
                        &gt;
                      </span>
                      <input name="location" placeholder="city, country" required />
                    </span>
                  </label>

                  <fieldset className="admin-photo-upload__field admin-photo-upload__tone-field">
                    <legend className="admin-photo-upload__field-label">tone</legend>
                    <div className="admin-photo-upload__tone-grid">
                      {tones.map((tone) => (
                        <label key={tone} className="admin-photo-upload__tone-option">
                          <input type="radio" name="tone" value={tone} defaultChecked={tone === 'amber'} />
                          <span>{tone}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </div>

              <div className="admin-photo-upload__section">
                <div className="admin-photo-upload__section-label">// tags &amp; caption</div>
                <div className="admin-photo-upload__field-stack">
                  <div className="admin-photo-upload__field">
                    <label className="admin-photo-upload__field-label" htmlFor="photo-upload-tags">
                      tags <span className="admin-photo-upload__optional">// comma list</span>
                    </label>
                    <span className="admin-photo-upload__input-wrap admin-photo-upload__input-wrap--tags">
                      <input type="hidden" name="tags" value={serializedTags} />
                      {tagChips.map((tag) => (
                        <span key={tag} className="admin-photo-upload__tag-chip">
                          {tag}
                          <button type="button" aria-label={`remove ${tag} tag`} onClick={() => removeTag(tag)}>
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        id="photo-upload-tags"
                        value={tagDraft}
                        placeholder={tagChips.length > 0 ? 'add more' : 'street, night'}
                        onBlur={() => addTag(tagDraft)}
                        onChange={(event) => setTagDraft(event.target.value)}
                        onKeyDown={handleTagKeyDown}
                      />
                    </span>
                    <span className="admin-photo-upload__hint">// saved as comma-delimited tags</span>
                  </div>

                  <label className="admin-photo-upload__field">
                    <span className="admin-photo-upload__field-label">caption</span>
                    <textarea
                      name="caption"
                      rows={3}
                      placeholder="describe the shot, the moment, the light..."
                    />
                  </label>
                </div>
              </div>

              <div className="admin-photo-upload__section">
                <div className="admin-photo-upload__section-label">// technical</div>
                <div className="admin-photo-upload__fields-row">
                  <label className="admin-photo-upload__field">
                    <span className="admin-photo-upload__field-label">camera</span>
                    <span className="admin-photo-upload__input-wrap">
                      <span className="admin-photo-upload__prompt" aria-hidden="true">
                        &gt;
                      </span>
                      <input name="camera" placeholder="e.g. Pentax K1000" />
                    </span>
                  </label>

                  <label className="admin-photo-upload__field">
                    <span className="admin-photo-upload__field-label">film</span>
                    <span className="admin-photo-upload__input-wrap">
                      <span className="admin-photo-upload__prompt" aria-hidden="true">
                        &gt;
                      </span>
                      <input name="film" placeholder="e.g. Kodak Ultramax" />
                    </span>
                  </label>
                </div>
              </div>

              <div className="admin-photo-upload__footer">
                <p>
                  <span>*</span> required fields
                </p>
                <button type="submit" disabled={isSubmitting}>
                  <span aria-hidden="true">{isSubmitting ? '▌' : '►'}</span>
                  {isSubmitting ? 'uploading...' : 'upload draft'}
                </button>
              </div>
            </section>
          </div>
        </Form>
      </ScreenFrame>
    </Stack>
  )
}

import { useEffect, useEffectEvent, useState } from 'react'

const channels = [
  { body: 'please stand by.', label: 'static', number: '00' },
  { body: 'hi — you found it.', label: 'pirate', number: '99' },
  { body: 'photos since 2019 // portra fanatic.', label: 'archive', number: '07' },
  { body: 'currently tuning the front-end migration wave.', label: 'dev.log', number: '13' },
] as const

type ChannelChangeOverlayProps = {
  open: boolean
  onClose: () => void
}

export function ChannelChangeOverlay({ open, onClose }: ChannelChangeOverlayProps) {
  const [index, setIndex] = useState(0)
  const handleClose = useEffectEvent(onClose)

  useEffect(() => {
    if (!open) return

    const intervalId = window.setInterval(() => {
      setIndex((current) => current + 1)
    }, 620)
    const timeoutId = window.setTimeout(() => handleClose(), 620 * channels.length + 400)

    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [open])

  if (!open) {
    return null
  }

  const channel = channels[Math.min(index, channels.length - 1)]

  return (
    <div className="channel-change" role="presentation">
      <div className="channel-change__noise" aria-hidden="true" />
      <div className="channel-change__card">
        <div className="channel-change__number fx-crt-title">CH.{channel.number}</div>
        <div className="channel-change__label">// {channel.label}</div>
        <div className="channel-change__body">{channel.body}</div>
      </div>
    </div>
  )
}

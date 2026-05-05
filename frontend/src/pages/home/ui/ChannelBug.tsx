type ChannelBugProps = {
  channel?: number
  onOpen: () => void
}

export function ChannelBug({ channel = 3, onOpen }: ChannelBugProps) {
  return (
    <button type="button" className="channel-bug glitch-hover" onClick={onOpen}>
      <span className="channel-bug__channel">CH.{String(channel).padStart(2, '0')}</span>
      <span className="channel-bug__separator" aria-hidden="true" />
      <span className="channel-bug__live">
        <span className="channel-bug__pulse" aria-hidden="true" />
        live
      </span>
    </button>
  )
}

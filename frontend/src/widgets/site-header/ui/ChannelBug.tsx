type ChannelBugProps = {
  channel?: number
}

export function ChannelBug({ channel = 3 }: ChannelBugProps) {
  return (
    <div className="shell-channel-bug" aria-label={`Live channel ${String(channel).padStart(2, '0')}`}>
      <span className="shell-channel-bug__channel">CH.{String(channel).padStart(2, '0')}</span>
      <span className="shell-channel-bug__separator" aria-hidden="true" />
      <span className="shell-channel-bug__live">
        <span className="shell-channel-bug__pulse" aria-hidden="true" />
        live
      </span>
    </div>
  )
}
